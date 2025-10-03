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
    const { message, username, streamId, sensitivity = 'balanced' } = await req.json();

    if (!message || !username || !streamId) {
      throw new Error('Message, username, and streamId are required');
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

    const sensitivityThresholds = {
      strict: 30,
      balanced: 50,
      lenient: 70
    };

    const threshold = sensitivityThresholds[sensitivity as keyof typeof sensitivityThresholds] || 50;

    console.log('[AI-CHAT-MODERATOR] Analyzing message:', { username, streamId, sensitivity });

    // Call Lovable AI for toxicity analysis
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
            content: `You are a chat moderation AI. Analyze messages for toxicity, hate speech, harassment, spam, and inappropriate content. 
Return a toxicity score (0-100) and recommended action.

Scoring:
- 0-30: Clean, no action needed
- 31-60: Mild concern, warn user
- 61-80: Moderate toxicity, timeout recommended
- 81-100: Severe toxicity, ban recommended

Consider context: competitive banter vs actual harassment.`
          },
          {
            role: 'user',
            content: `Analyze this chat message:
Username: ${username}
Message: "${message}"

Return JSON:
{
  "toxicity_score": number (0-100),
  "action": "none" | "warn" | "timeout" | "ban",
  "reason": "brief explanation",
  "categories": ["category1", "category2"]
}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[AI-CHAT-MODERATOR] API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(aiData.choices[0].message.content);

    // Adjust action based on sensitivity
    let finalAction = 'none';
    if (analysis.toxicity_score >= threshold) {
      if (analysis.toxicity_score >= 80) {
        finalAction = 'ban';
      } else if (analysis.toxicity_score >= 60) {
        finalAction = 'timeout';
      } else {
        finalAction = 'warn';
      }
    }

    // Store moderation action
    await supabase.from('chat_moderation_actions').insert({
      user_id: user.id,
      stream_id: streamId,
      message,
      username,
      action: finalAction,
      toxicity_score: analysis.toxicity_score,
      reason: analysis.reason
    });

    console.log('[AI-CHAT-MODERATOR] Analysis complete:', { 
      toxicity_score: analysis.toxicity_score, 
      action: finalAction 
    });

    return new Response(
      JSON.stringify({
        toxicity_score: analysis.toxicity_score,
        action: finalAction,
        reason: analysis.reason,
        categories: analysis.categories
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[AI-CHAT-MODERATOR] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});