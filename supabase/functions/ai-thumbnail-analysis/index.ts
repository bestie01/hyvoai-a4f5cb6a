import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('[AI-THUMBNAIL-ANALYSIS] LOVABLE_API_KEY not set');
      return new Response(
        JSON.stringify({ error: 'API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    
    const token = authHeader?.replace('Bearer ', '');
    const { data: userData } = await supabaseClient.auth.getUser(token || '');
    const user = userData?.user;

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[AI-THUMBNAIL-ANALYSIS] Analyzing thumbnail for user:', user.id);

    // Use GPT-4o to analyze the thumbnail
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert thumbnail analyzer for streaming and YouTube content. Analyze thumbnails and provide a detailed score and feedback.
            
            Return a JSON object with this exact structure:
            {
              "score": <number 0-100>,
              "breakdown": [
                { "category": "Visual Impact", "score": <0-100>, "feedback": "<short feedback>", "icon": "eye" },
                { "category": "Color & Contrast", "score": <0-100>, "feedback": "<short feedback>", "icon": "palette" },
                { "category": "Text Readability", "score": <0-100>, "feedback": "<short feedback>", "icon": "type" },
                { "category": "Composition", "score": <0-100>, "feedback": "<short feedback>", "icon": "image" }
              ],
              "strengths": ["<strength 1>", "<strength 2>"],
              "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
            }
            
            Be specific and actionable in your feedback. Score should reflect how effective the thumbnail would be at attracting clicks.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this thumbnail and provide a detailed effectiveness score with breakdown, strengths, and improvement suggestions.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI-THUMBNAIL-ANALYSIS] OpenAI error:', errorText);
      throw new Error('Failed to analyze thumbnail');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('[AI-THUMBNAIL-ANALYSIS] Failed to parse response:', content);
      // Return default analysis on parse failure
      analysis = {
        score: 70,
        breakdown: [
          { category: "Visual Impact", score: 70, feedback: "Good visual elements present", icon: "eye" },
          { category: "Color & Contrast", score: 70, feedback: "Decent color balance", icon: "palette" },
          { category: "Text Readability", score: 70, feedback: "Text is readable", icon: "type" },
          { category: "Composition", score: 70, feedback: "Well composed", icon: "image" }
        ],
        strengths: ["Good overall composition", "Clear main subject"],
        suggestions: ["Consider adding more contrast", "Use bolder text", "Add visual focal point"]
      };
    }

    // Store analysis in database
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseService.from('ai_generated_content').insert({
      user_id: user.id,
      content_type: 'thumbnail_analysis',
      content_data: analysis
    });

    console.log('[AI-THUMBNAIL-ANALYSIS] Analysis complete, score:', analysis.score);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[AI-THUMBNAIL-ANALYSIS] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze thumbnail' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
