import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function safeErrorResponse(error: unknown, context: string, statusCode: number = 500): Response {
  console.error(`[${context}] Error:`, error instanceof Error ? error.message : String(error));
  
  const clientMessages: Record<number, string> = {
    400: 'Invalid request parameters',
    401: 'Authentication required',
    500: 'An unexpected error occurred',
  };
  
  return new Response(
    JSON.stringify({ error: clientMessages[statusCode] || 'An unexpected error occurred' }),
    { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function safeJsonParse<T>(data: any, defaultValue: T): T {
  try {
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return defaultValue;
    return JSON.parse(content) as T;
  } catch {
    console.warn('[AI-TITLE-GENERATOR] Failed to parse AI response, using defaults');
    return defaultValue;
  }
}

interface TitleResult {
  titles: string[];
  descriptions: string[];
}

const defaultResult: TitleResult = {
  titles: ['Exciting Stream Coming Soon!', 'Join the Action Live', 'Don\'t Miss This Stream'],
  descriptions: ['Join us for an amazing stream experience!', 'Live now - come hang out!'],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { game, theme, targetAudience } = body;

    if (!game) {
      return safeErrorResponse(new Error('Game is required'), 'VALIDATION', 400);
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[AI-TITLE-GENERATOR] LOVABLE_API_KEY not configured');
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

    console.log('[AI-TITLE-GENERATOR] Generating titles for:', { game, theme, targetAudience });

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `You are a world-class stream title copywriter, trained on viral YouTube and Twitch content. Your titles consistently drive 3-5x more clicks than average.

Master the psychology of clickable titles:
- Pattern interrupt: Start with unexpected words or contrasts
- Curiosity gaps: Make viewers NEED to know more
- Power words: Use emotional triggers (INSANE, SECRET, FINALLY, BRUTAL)
- Social proof hints: Imply community engagement
- Specificity: Numbers and specific details build trust
- Urgency without clickbait: Create FOMO authentically

Title formulas that WORK:
1. [EMOTION] + [GAME] + [SPECIFIC OUTCOME] → "BRUTAL Dark Souls 1 Challenge - No Healing Allowed"
2. [NUMBER] + [UNEXPECTED THING] + [GAME] → "3 Pro Secrets That Changed My Valorant Rank"
3. [CURIOSITY HOOK] + [GAME] + [STAKES] → "This Loadout Got Me BANNED... (Apex Legends)"
4. [TIME PRESSURE] + [CHALLENGE] → "24 HOURS to Hit Diamond or I Quit"
5. [CONTROVERSY/HOT TAKE] + [PROOF] → "Why Everyone's Playing [GAME] Wrong"`
          },
          {
            role: 'user',
            content: `Create 5 VIRAL-WORTHY stream title options for:
Game: ${game.slice(0, 100)}
Theme: ${(theme || 'engaging gameplay').slice(0, 100)}
Target Audience: ${(targetAudience || 'gaming enthusiasts').slice(0, 100)}

Requirements:
- Each title MUST use a different formula/approach
- Include 1-2 strategic emojis max (not at start)
- Under 60 characters for YouTube optimization
- Sound natural, not AI-generated
- Create genuine curiosity

Also generate 3 compelling description variants (under 200 characters) that:
- Hook viewers in first 5 words
- Include relevant keywords naturally
- End with a soft CTA or curiosity hook

Return as JSON:
{
  "titles": ["title1", "title2", "title3", "title4", "title5"],
  "descriptions": ["desc1", "desc2", "desc3"]
}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      console.error('[AI-TITLE-GENERATOR] AI API error:', aiResponse.status);
      return safeErrorResponse(new Error('AI service unavailable'), 'AI', 500);
    }

    const aiData = await aiResponse.json();
    const content = safeJsonParse<TitleResult>(aiData, defaultResult);

    // Store generated content
    await supabase.from('ai_generated_content').insert({
      user_id: user.id,
      content_type: 'title',
      content_data: content,
      used: false
    });

    console.log('[AI-TITLE-GENERATOR] Success:', content);

    return new Response(
      JSON.stringify(content),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return safeErrorResponse(error, 'AI-TITLE-GENERATOR');
  }
});
