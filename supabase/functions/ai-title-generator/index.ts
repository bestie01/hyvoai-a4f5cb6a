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
    const { game, theme, targetAudience } = await req.json();

    if (!game) {
      throw new Error('Game/category is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('[AI-TITLE-GENERATOR] Generating titles for:', { game, theme, targetAudience });

    // Call Lovable AI
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
Game: ${game}
Theme: ${theme || 'engaging gameplay'}
Target Audience: ${targetAudience || 'gaming enthusiasts'}

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
      const errorText = await aiResponse.text();
      console.error('[AI-TITLE-GENERATOR] API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = JSON.parse(aiData.choices[0].message.content);

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
    console.error('[AI-TITLE-GENERATOR] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});