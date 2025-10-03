import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('[AI-PREDICTIVE-ANALYTICS] Analyzing data for user:', user.id);

    // Fetch historical stream data
    const { data: analytics, error: analyticsError } = await supabase
      .from('stream_analytics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (analyticsError) {
      throw new Error('Failed to fetch analytics');
    }

    if (!analytics || analytics.length < 5) {
      return new Response(
        JSON.stringify({ 
          error: 'Not enough data for predictions',
          message: 'Stream at least 5 times to get AI predictions' 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Call Lovable AI for predictions
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a stream analytics AI. Analyze historical streaming data to predict optimal stream times, forecast viewership, and identify growth patterns.

Provide actionable insights with specific recommendations.`
          },
          {
            role: 'user',
            content: `Analyze this streaming data and provide predictions:

${JSON.stringify(analytics.slice(0, 50), null, 2)}

Return JSON with:
{
  "optimal_stream_times": [
    {
      "day": "Monday",
      "time": "19:00",
      "expected_viewers": number,
      "confidence": number (0-1)
    }
  ],
  "viewer_forecast": {
    "next_week": number,
    "next_month": number,
    "growth_rate": number (percentage)
  },
  "recommendations": [
    {
      "title": "string",
      "description": "string",
      "impact": "high" | "medium" | "low",
      "category": "timing" | "content" | "engagement"
    }
  ],
  "insights": [
    "insight 1",
    "insight 2",
    "insight 3"
  ]
}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[AI-PREDICTIVE-ANALYTICS] API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const predictions = JSON.parse(aiData.choices[0].message.content);

    // Store predictions
    await supabase.from('ai_predictions').insert({
      user_id: user.id,
      prediction_type: 'stream_analytics',
      prediction_data: predictions,
      confidence_score: predictions.optimal_stream_times?.[0]?.confidence || 0.5
    });

    console.log('[AI-PREDICTIVE-ANALYTICS] Predictions generated');

    return new Response(
      JSON.stringify(predictions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[AI-PREDICTIVE-ANALYTICS] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});