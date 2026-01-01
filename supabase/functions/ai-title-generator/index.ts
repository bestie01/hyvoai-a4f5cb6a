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

    console.log('[AI-TITLE-GENERATOR] Generating titles for:', { game, theme, targetAudience });

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
            content: `You are a creative stream title generator specialized in creating viral, click-worthy titles. Generate catchy, SEO-optimized stream titles that attract viewers. Consider:
- Using emojis strategically (1-2 per title max)
- Creating urgency, excitement, or curiosity
- Including relevant gaming/streaming keywords
- Keeping titles concise (under 60 characters)
- Matching the streamer's vibe and target audience
- Using power words that drive clicks`
          },
          {
            role: 'user',
            content: `Generate 5 stream title options and 3 description variants for:
Game/Category: ${game}
Theme/Mood: ${theme || 'casual gameplay, chill vibes'}
Target Audience: ${targetAudience || 'general gamers and viewers'}

Requirements:
- Titles should be unique and attention-grabbing
- Include variety (some hype, some chill, some mysterious)
- Descriptions should be under 200 characters each
- Make them feel authentic and not too salesy

Return ONLY valid JSON in this exact format:
{
  "titles": ["title1", "title2", "title3", "title4", "title5"],
  "descriptions": ["desc1", "desc2", "desc3"]
}`
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[AI-TITLE-GENERATOR] API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('[AI-TITLE-GENERATOR] Raw response:', JSON.stringify(aiData).substring(0, 500));
    
    let content;
    const messageContent = aiData.choices?.[0]?.message?.content;
    
    if (typeof messageContent === 'string') {
      // Try to extract JSON from the response
      const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    } else {
      content = messageContent;
    }

    // Validate response structure
    if (!content.titles || !Array.isArray(content.titles) || content.titles.length === 0) {
      throw new Error('Invalid response: missing titles array');
    }

    // Store generated content
    await supabase.from('ai_generated_content').insert({
      user_id: user.id,
      content_type: 'title',
      content_data: content,
      used: false
    });

    console.log('[AI-TITLE-GENERATOR] Success - generated', content.titles.length, 'titles');

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
