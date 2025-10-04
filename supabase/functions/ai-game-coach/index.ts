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
    const { game, metrics, sessionDuration } = await req.json();

    if (!game || !metrics) {
      throw new Error('Game and metrics are required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('[AI-GAME-COACH] Analyzing performance for:', game);

    // Call Lovable AI to analyze performance
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
            content: `You are a professional ${game} coach. Analyze player performance and provide actionable feedback.

Focus on:
1. Key strengths to maintain
2. Critical weaknesses to improve
3. Specific tips and strategies
4. Benchmark comparison with average players

Be concise, encouraging, and specific. Use gaming terminology.`
          },
          {
            role: 'user',
            content: `Game: ${game}
Session Duration: ${sessionDuration} minutes
Performance Metrics: ${JSON.stringify(metrics, null, 2)}

Provide coaching feedback as JSON:
{
  "overall_rating": number (1-10),
  "strengths": [string],
  "weaknesses": [string],
  "tips": [{ "title": string, "description": string, "priority": "high"|"medium"|"low" }],
  "improvement_areas": [{ "skill": string, "current": number, "target": number, "advice": string }]
}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[AI-GAME-COACH] API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const coaching = JSON.parse(aiData.choices[0].message.content);

    // Store coaching session
    await supabase.from('ai_generated_content').insert({
      user_id: user.id,
      content_type: 'game_coaching',
      content_data: {
        game,
        metrics,
        coaching,
        session_duration: sessionDuration
      },
      used: true
    });

    console.log('[AI-GAME-COACH] Coaching analysis complete');

    return new Response(
      JSON.stringify(coaching),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[AI-GAME-COACH] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
