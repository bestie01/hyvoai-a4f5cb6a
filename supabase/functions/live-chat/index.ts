import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  id: string;
  platform: 'twitch' | 'youtube';
  username: string;
  displayName: string;
  message: string;
  timestamp: string;
  badges?: string[];
  color?: string;
  isSubscriber?: boolean;
  isModerator?: boolean;
}

interface ChatRequest {
  action: 'get_messages' | 'get_live_chat_id';
  platform: 'twitch' | 'youtube';
  channelId?: string;
  liveChatId?: string;
  pageToken?: string;
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

    const { action, platform, channelId, liveChatId, pageToken } = await req.json() as ChatRequest;

    // Get the user's connection for this platform
    const { data: connection, error: connError } = await supabaseClient
      .from('social_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', platform === 'youtube' ? 'google' : platform)
      .eq('is_active', true)
      .maybeSingle();

    if (connError) {
      console.error('[live-chat] Connection error:', connError);
    }

    let result = null;

    if (platform === 'twitch') {
      result = await handleTwitchChat(connection?.access_token, channelId, action);
    } else if (platform === 'youtube') {
      result = await handleYouTubeChat(connection?.access_token, action, liveChatId, pageToken);
    }

    console.log(`[live-chat] ${platform} ${action} result:`, result?.messages?.length || 0, 'messages');

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[live-chat] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function handleTwitchChat(
  accessToken: string | null,
  channelId: string | undefined,
  action: string
): Promise<{ messages: ChatMessage[] }> {
  const clientId = Deno.env.get('TWITCH_CLIENT_ID');
  
  if (!clientId || !accessToken) {
    console.warn('[live-chat] Twitch credentials not available');
    return { messages: [] };
  }

  try {
    // For Twitch, we need to get the broadcaster's recent chat messages
    // Unfortunately, Twitch doesn't have a simple "get chat messages" API
    // We'll use the EventSub API for real-time, but for now return mock data
    // indicating that WebSocket connection is needed for real-time chat
    
    // Get channel info to verify the connection works
    const userResponse = await fetch('https://api.twitch.tv/helix/users', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Client-Id': clientId,
      },
    });

    if (!userResponse.ok) {
      console.error('[live-chat] Twitch API error:', await userResponse.text());
      return { messages: [] };
    }

    const userData = await userResponse.json();
    const twitchUser = userData.data?.[0];

    if (!twitchUser) {
      return { messages: [] };
    }

    // Note: Real Twitch chat requires IRC or EventSub WebSocket connection
    // This endpoint provides channel info; actual chat would need WebSocket
    return { 
      messages: [],
      channelInfo: {
        id: twitchUser.id,
        login: twitchUser.login,
        displayName: twitchUser.display_name,
      }
    };
  } catch (error) {
    console.error('[live-chat] Twitch error:', error);
    return { messages: [] };
  }
}

async function handleYouTubeChat(
  accessToken: string | null,
  action: string,
  liveChatId?: string,
  pageToken?: string
): Promise<{ messages: ChatMessage[], nextPageToken?: string, pollingIntervalMs?: number, liveChatId?: string }> {
  if (!accessToken) {
    console.warn('[live-chat] YouTube access token not available');
    return { messages: [] };
  }

  try {
    if (action === 'get_live_chat_id') {
      // First, find the active live broadcast
      const broadcastResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet&broadcastStatus=active&mine=true',
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!broadcastResponse.ok) {
        const errorText = await broadcastResponse.text();
        console.error('[live-chat] YouTube broadcast API error:', errorText);
        return { messages: [] };
      }

      const broadcastData = await broadcastResponse.json();
      const broadcast = broadcastData.items?.[0];

      if (!broadcast) {
        console.log('[live-chat] No active YouTube broadcast found');
        return { messages: [], liveChatId: undefined };
      }

      return { 
        messages: [], 
        liveChatId: broadcast.snippet?.liveChatId 
      };
    }

    if (action === 'get_messages' && liveChatId) {
      // Fetch chat messages
      let url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails`;
      
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      const chatResponse = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        console.error('[live-chat] YouTube chat API error:', errorText);
        return { messages: [] };
      }

      const chatData = await chatResponse.json();
      
      const messages: ChatMessage[] = (chatData.items || []).map((item: any) => ({
        id: item.id,
        platform: 'youtube' as const,
        username: item.authorDetails?.channelId || '',
        displayName: item.authorDetails?.displayName || 'Unknown',
        message: item.snippet?.displayMessage || item.snippet?.textMessageDetails?.messageText || '',
        timestamp: item.snippet?.publishedAt || new Date().toISOString(),
        badges: [],
        isSubscriber: item.authorDetails?.isChatSponsor || false,
        isModerator: item.authorDetails?.isChatModerator || false,
      }));

      return {
        messages,
        nextPageToken: chatData.nextPageToken,
        pollingIntervalMs: chatData.pollingIntervalMillis || 5000,
      };
    }

    return { messages: [] };
  } catch (error) {
    console.error('[live-chat] YouTube error:', error);
    return { messages: [] };
  }
}
