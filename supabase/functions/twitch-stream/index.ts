import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TwitchStreamRequest {
  action: 'connect' | 'start' | 'stop' | 'update' | 'disconnect';
  streamKey?: string;
  title?: string;
  category?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, streamKey, title, category }: TwitchStreamRequest = await req.json();

    switch (action) {
      case 'connect':
        console.log(`[TWITCH] User ${user.id} connecting with stream key`);
        
        // Store stream configuration
        await supabase.from('platform_streaming_configs').upsert({
          user_id: user.id,
          platform: 'twitch',
          stream_key: streamKey || '',
          rtmp_url: 'rtmp://live.twitch.tv/app/',
          stream_title: title,
          is_enabled: true,
        }, { onConflict: 'user_id,platform' });

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Connected to Twitch',
          rtmpUrl: 'rtmp://live.twitch.tv/app/',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'start':
        console.log(`[TWITCH] User ${user.id} starting stream`);
        
        // Create stream record
        const { data: stream, error: streamError } = await supabase
          .from('streams')
          .insert({
            user_id: user.id,
            is_live: true,
          })
          .select()
          .single();

        if (streamError) throw streamError;

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Stream started',
          streamId: stream.id,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'stop':
        console.log(`[TWITCH] User ${user.id} stopping stream`);
        
        // Update stream to not live
        await supabase
          .from('streams')
          .update({ is_live: false })
          .eq('user_id', user.id)
          .eq('is_live', true);

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Stream stopped',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'update':
        console.log(`[TWITCH] User ${user.id} updating stream info`);
        
        await supabase
          .from('platform_streaming_configs')
          .update({
            stream_title: title,
            stream_description: category,
          })
          .eq('user_id', user.id)
          .eq('platform', 'twitch');

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Stream info updated',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'disconnect':
        console.log(`[TWITCH] User ${user.id} disconnecting`);
        
        await supabase
          .from('platform_streaming_configs')
          .update({ is_enabled: false })
          .eq('user_id', user.id)
          .eq('platform', 'twitch');

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Disconnected from Twitch',
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('[TWITCH] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
