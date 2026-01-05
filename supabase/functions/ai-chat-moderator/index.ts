import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safe error response - logs details server-side, returns generic message to client
function safeErrorResponse(error: unknown, context: string, statusCode: number = 500): Response {
  console.error(`[${context}] Error:`, error instanceof Error ? error.message : String(error));
  
  const clientMessages: Record<number, string> = {
    400: 'Invalid request parameters',
    401: 'Authentication required',
    403: 'Access denied',
    500: 'An unexpected error occurred',
  };
  
  return new Response(
    JSON.stringify({ error: clientMessages[statusCode] || 'An unexpected error occurred' }),
    { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Safe JSON parsing
function safeJsonParse<T>(data: any, defaultValue: T): T {
  try {
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return defaultValue;
    return JSON.parse(content) as T;
  } catch {
    console.warn('[AI-CHAT-MODERATOR] Failed to parse AI response, using defaults');
    return defaultValue;
  }
}

interface ModerationResult {
  toxicity_score: number;
  action: string;
  reason: string;
  categories: string[];
}

const defaultResult: ModerationResult = {
  toxicity_score: 0,
  action: 'none',
  reason: 'Unable to analyze message',
  categories: [],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { message, username, streamId, sensitivity = 'balanced' } = body;

    // Validate required fields
    if (!message || !username || !streamId) {
      return safeErrorResponse(new Error('Missing required fields'), 'VALIDATION', 400);
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[AI-CHAT-MODERATOR] LOVABLE_API_KEY not configured');
      return safeErrorResponse(new Error('Service not configured'), 'CONFIG', 500);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return safeErrorResponse(new Error('No auth header'), 'AUTH', 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return safeErrorResponse(new Error('Unauthorized'), 'AUTH', 401);
    }

    const sensitivityThresholds: Record<string, number> = {
      strict: 30,
      balanced: 50,
      lenient: 70
    };

    const threshold = sensitivityThresholds[sensitivity] || 50;

    console.log('[AI-CHAT-MODERATOR] Analyzing message:', { username, streamId, sensitivity });

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
Message: "${message.slice(0, 500)}"

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
      console.error('[AI-CHAT-MODERATOR] AI API error:', aiResponse.status);
      return safeErrorResponse(new Error('AI service unavailable'), 'AI', 500);
    }

    const aiData = await aiResponse.json();
    const analysis = safeJsonParse<ModerationResult>(aiData, defaultResult);

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
      message: message.slice(0, 1000),
      username: username.slice(0, 100),
      action: finalAction,
      toxicity_score: analysis.toxicity_score,
      reason: analysis.reason?.slice(0, 500) || null
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
    return safeErrorResponse(error, 'AI-CHAT-MODERATOR');
  }
});
