import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StreamAnalytics {
  stream_id: string;
  platform: 'twitch' | 'youtube';
  viewers: number;
  duration: string;
  messages: number;
  engagement_rate: number;
  quality: string;
  timestamp: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'POST') {
      const { stream_id, platform, viewers, duration, messages, engagement_rate, quality } = await req.json();

      // Store analytics data
      const { data, error } = await supabase
        .from('stream_analytics')
        .insert({
          stream_id,
          platform,
          viewers,
          duration,
          messages,
          engagement_rate,
          quality,
          timestamp: new Date().toISOString(),
          user_id: req.headers.get('user-id'), // Pass user ID from auth
        });

      if (error) {
        console.error('Error storing analytics:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const userId = url.searchParams.get('user_id');
      const platform = url.searchParams.get('platform');
      const days = parseInt(url.searchParams.get('days') || '7');

      if (!userId) {
        return new Response(JSON.stringify({ error: 'User ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get analytics data for the last N days
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - days);

      let query = supabase
        .from('stream_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', sinceDate.toISOString())
        .order('timestamp', { ascending: false });

      if (platform) {
        query = query.eq('platform', platform);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching analytics:', error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Calculate summary statistics
      const totalStreams = data?.length || 0;
      const totalViewers = data?.reduce((sum, record) => sum + record.viewers, 0) || 0;
      const avgViewers = totalStreams > 0 ? Math.round(totalViewers / totalStreams) : 0;
      const peakViewers = data?.reduce((max, record) => Math.max(max, record.viewers), 0) || 0;

      const summary = {
        totalStreams,
        totalViewers,
        avgViewers,
        peakViewers,
        records: data || [],
      };

      return new Response(JSON.stringify(summary), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in streaming-analytics function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});