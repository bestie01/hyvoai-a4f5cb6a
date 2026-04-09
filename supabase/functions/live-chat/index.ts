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
  action: 'get_messages' | 'get_live_chat_id' | 'send_message';
  platform: 'twitch' | 'youtube';
  channelId?: string;
  liveChatId?: string;
  pageToken?: string;
  message?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json() as ChatRequest;
    const { action, platform, channelId, liveChatId, pageToken, message } = body;

    if (!action || !platform) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action, platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user's connection — try both 'youtube' and 'google' for backward compat
    const platformNames = platform === 'youtube' ? ['youtube', 'google'] : [platform];
    let connection = null;
    for (const pName of platformNames) {
      const { data } = await supabaseClient
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('platform', pName)
        .eq('is_active', true)
        .maybeSingle();
      if (data) { connection = data; break; }
    }

    let result: any = null;

    if (platform === 'twitch') {
      result = await handleTwitchChat(connection?.access_token, channelId, action);
    } else if (platform === 'youtube') {
      if (action === 'send_message') {
        if (!connection?.access_token) {
          return new Response(
            JSON.stringify({ error: 'No YouTube access token. Please connect your YouTube account.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!liveChatId) {
          return new Response(
            JSON.stringify({ error: 'Missing liveChatId. Ensure you have an active live broadcast.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!message || typeof message !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Missing or invalid message.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        result = await handleYouTubeSendMessage(connection.access_token, liveChatId, message);
      } else {
        result = await handleYouTubeChat(connection?.access_token, action, liveChatId, pageToken);
      }
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
): Promise<any> {
  const clientId = Deno.env.get('TWITCH_CLIENT_ID');
  
  if (!clientId || !accessToken) {
    console.warn('[live-chat] Twitch credentials not available');
    return { messages: [] };
  }

  try {
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
    if (!twitchUser) return { messages: [] };

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
      const broadcastResponse = await fetch(
        'https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet&broadcastStatus=active&mine=true',
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
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

      return { messages: [], liveChatId: broadcast.snippet?.liveChatId };
    }

    if (action === 'get_messages' && liveChatId) {
      let url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${liveChatId}&part=snippet,authorDetails`;
      if (pageToken) url += `&pageToken=${pageToken}`;

      const chatResponse = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` },
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

async function handleYouTubeSendMessage(
  accessToken: string,
  liveChatId: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      'https://www.googleapis.com/youtube/v3/liveChat/messages?part=snippet',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            liveChatId,
            type: 'textMessageEvent',
            textMessageDetails: { messageText: message },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[live-chat] YouTube send error:', errorText);
      return { success: false, error: `YouTube API error: ${response.status}` };
    }

    return { success: true };
  } catch (error) {
    console.error('[live-chat] YouTube send error:', error);
    return { success: false, error: error.message };
  }
}
