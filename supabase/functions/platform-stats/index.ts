import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StatsRequest {
  platform: 'twitch' | 'youtube';
  action: 'get_stats' | 'get_stream_info';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { platform, action } = await req.json() as StatsRequest;

    // Get the user's connection for this platform
    const { data: connection, error: connError } = await supabaseClient
      .from('social_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform)
      .eq('is_active', true)
      .maybeSingle();

    if (connError || !connection) {
      // Return 200 with needsAuth flag - this is expected behavior, not an error
      return new Response(
        JSON.stringify({ 
          success: false,
          needsAuth: true,
          platform,
          stats: null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let stats = null;

    if (platform === 'twitch') {
      stats = await fetchTwitchStats(connection.access_token, connection.platform_user_id);
    } else if (platform === 'youtube') {
      stats = await fetchYouTubeStats(connection.access_token);
    }

    console.log(`[platform-stats] Fetched ${platform} stats for user ${user.id}:`, stats);

    return new Response(
      JSON.stringify({ success: true, stats }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[platform-stats] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function fetchTwitchStats(accessToken: string, userId: string | null): Promise<any> {
  const clientId = Deno.env.get('TWITCH_CLIENT_ID');
  
  if (!clientId) {
    console.warn('[platform-stats] TWITCH_CLIENT_ID not configured');
    return { viewers: 0, followers: 0, subscribers: 0, isLive: false };
  }

  try {
    // Fetch user info if we don't have the ID
    let twitchUserId = userId;
    
    if (!twitchUserId) {
      const userResponse = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': clientId,
        },
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        twitchUserId = userData.data?.[0]?.id;
      }
    }

    if (!twitchUserId) {
      return { viewers: 0, followers: 0, subscribers: 0, isLive: false };
    }

    // Fetch stream data
    const streamResponse = await fetch(
      `https://api.twitch.tv/helix/streams?user_id=${twitchUserId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': clientId,
        },
      }
    );

    let streamData = { viewers: 0, isLive: false, title: '', gameName: '' };
    
    if (streamResponse.ok) {
      const streamJson = await streamResponse.json();
      const stream = streamJson.data?.[0];
      
      if (stream) {
        streamData = {
          viewers: stream.viewer_count || 0,
          isLive: true,
          title: stream.title || '',
          gameName: stream.game_name || '',
        };
      }
    }

    // Fetch follower count
    const followersResponse = await fetch(
      `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${twitchUserId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': clientId,
        },
      }
    );

    let followers = 0;
    if (followersResponse.ok) {
      const followersJson = await followersResponse.json();
      followers = followersJson.total || 0;
    }

    // Fetch subscriber count (requires channel:read:subscriptions scope)
    const subsResponse = await fetch(
      `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${twitchUserId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Client-Id': clientId,
        },
      }
    );

    let subscribers = 0;
    if (subsResponse.ok) {
      const subsJson = await subsResponse.json();
      subscribers = subsJson.total || 0;
    }

    return {
      ...streamData,
      followers,
      subscribers,
    };
  } catch (error) {
    console.error('[platform-stats] Twitch API error:', error);
    return { viewers: 0, followers: 0, subscribers: 0, isLive: false };
  }
}

async function fetchYouTubeStats(accessToken: string): Promise<any> {
  try {
    // First get the channel info
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!channelResponse.ok) {
      const errorText = await channelResponse.text();
      console.error('[platform-stats] YouTube channel API error:', errorText);
      return { viewers: 0, subscribers: 0, isLive: false };
    }

    const channelData = await channelResponse.json();
    const channel = channelData.items?.[0];
    
    if (!channel) {
      return { viewers: 0, subscribers: 0, isLive: false };
    }

    const channelStats = {
      subscribers: parseInt(channel.statistics?.subscriberCount || '0'),
      totalViews: parseInt(channel.statistics?.viewCount || '0'),
      videoCount: parseInt(channel.statistics?.videoCount || '0'),
      channelName: channel.snippet?.title || '',
    };

    // Check for live broadcasts
    const liveResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,contentDetails&broadcastStatus=active&mine=true',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    let liveData = { isLive: false, viewers: 0, title: '' };

    if (liveResponse.ok) {
      const liveJson = await liveResponse.json();
      const broadcast = liveJson.items?.[0];
      
      if (broadcast && broadcast.status?.lifeCycleStatus === 'live') {
        // Get concurrent viewers for the live stream
        const videoId = broadcast.id;
        const videoResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (videoResponse.ok) {
          const videoJson = await videoResponse.json();
          const video = videoJson.items?.[0];
          
          liveData = {
            isLive: true,
            viewers: parseInt(video?.liveStreamingDetails?.concurrentViewers || '0'),
            title: broadcast.snippet?.title || '',
          };
        }
      }
    }

    return {
      ...channelStats,
      ...liveData,
    };
  } catch (error) {
    console.error('[platform-stats] YouTube API error:', error);
    return { viewers: 0, subscribers: 0, isLive: false };
  }
}
