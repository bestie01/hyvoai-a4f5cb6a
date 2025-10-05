import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, platformId } = await req.json();

    if (action === 'get_configs') {
      // Fetch all enabled streaming configs
      const { data, error } = await supabase
        .from('platform_streaming_configs')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_enabled', true);

      if (error) throw error;

      return new Response(
        JSON.stringify({ configs: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'toggle') {
      // Toggle a specific platform config
      const { data: currentConfig } = await supabase
        .from('platform_streaming_configs')
        .select('is_enabled')
        .eq('id', platformId)
        .eq('user_id', user.id)
        .single();

      if (!currentConfig) {
        throw new Error('Platform config not found');
      }

      const { data, error } = await supabase
        .from('platform_streaming_configs')
        .update({ is_enabled: !currentConfig.is_enabled })
        .eq('id', platformId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, config: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'start_multi_stream') {
      // This would start the RTMP relay service
      // In production, this would interface with an RTMP server like nginx-rtmp or Node-Media-Server
      console.log('[MULTI-STREAM] Starting multi-stream relay for user:', user.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Multi-stream relay started',
          note: 'In production, this would start an RTMP relay service' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (error: any) {
    console.error('Error in multi-stream relay:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});