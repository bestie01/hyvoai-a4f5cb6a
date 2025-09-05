import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      streamId, 
      platform, 
      viewers, 
      duration, 
      chatMessages = [], 
      audioLevel = 0,
      quality = 'HD'
    } = await req.json();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    // Create Supabase client with service role for analytics storage
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authenticated user
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error("User not authenticated");
    }

    const userId = userData.user.id;

    // Calculate engagement metrics
    const messageCount = chatMessages.length;
    const engagementRate = viewers > 0 ? (messageCount / viewers) * 100 : 0;

    // Store real-time analytics data
    const { data, error } = await supabase
      .from('stream_analytics')
      .insert({
        user_id: userId,
        stream_id: streamId,
        platform: platform,
        viewers: viewers,
        duration: duration,
        messages: messageCount,
        engagement_rate: Math.round(engagementRate * 100) / 100,
        quality: quality,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing analytics:', error);
      throw error;
    }

    // Calculate real-time metrics for dashboard
    const { data: recentAnalytics } = await supabase
      .from('stream_analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });

    const metrics = {
      totalStreams: recentAnalytics?.length || 0,
      totalViewers: recentAnalytics?.reduce((sum, record) => sum + record.viewers, 0) || 0,
      avgViewers: recentAnalytics?.length ? 
        Math.round((recentAnalytics.reduce((sum, record) => sum + record.viewers, 0) / recentAnalytics.length) * 100) / 100 : 0,
      peakViewers: Math.max(...(recentAnalytics?.map(record => record.viewers) || [0])),
      avgEngagement: recentAnalytics?.length ?
        Math.round((recentAnalytics.reduce((sum, record) => sum + record.engagement_rate, 0) / recentAnalytics.length) * 100) / 100 : 0
    };

    return new Response(JSON.stringify({
      success: true,
      data,
      metrics,
      realtime: {
        currentViewers: viewers,
        currentEngagement: engagementRate,
        streamDuration: duration,
        messageRate: messageCount
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in realtime analytics:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});