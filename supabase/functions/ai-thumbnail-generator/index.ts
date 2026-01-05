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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { title, game, style } = body;

    if (!title || !game) {
      return safeErrorResponse(new Error('Title and game are required'), 'VALIDATION', 400);
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('[AI-THUMBNAIL-GENERATOR] LOVABLE_API_KEY not configured');
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

    // Sanitize inputs
    const safeTitle = title.slice(0, 100);
    const safeGame = game.slice(0, 50);
    const safeStyle = (style || 'vibrant').slice(0, 30);

    console.log('[AI-THUMBNAIL-GENERATOR] Generating thumbnail for:', { title: safeTitle, game: safeGame, style: safeStyle });

    // Professional thumbnail prompts inspired by top creators (Pitzels, MrBeast, Ninja)
    const stylePresets = [safeStyle, safeStyle, safeStyle];
    const prompts = [
      `Ultra high quality gaming thumbnail, ${safeGame} theme, "${safeTitle}" concept. Vibrant saturated colors, dramatic rim lighting, depth of field blur, 3D render style, clean composition with negative space for text, professional esports quality, trending on Artstation, 16:9 aspect ratio, 4K resolution, ${stylePresets[0]} aesthetic`,
      `Cinematic ${safeGame} thumbnail art, epic scene representing "${safeTitle}". Dramatic volumetric lighting, film grain, color graded like blockbuster movie, dynamic action pose, smoke and particle effects, lens flare, professional composition rule of thirds, 16:9 widescreen, ${stylePresets[1]} mood, photorealistic quality`,
      `Modern stream thumbnail for ${safeGame}, "${safeTitle}" theme. Bold graphic design, geometric shapes, neon glow effects, gradient overlays, minimalist but impactful, high contrast, clean edges, professional broadcast quality, contemporary gaming aesthetic, 16:9 format, ${stylePresets[2]} color scheme`
    ];

    const thumbnails = [];

    for (let i = 0; i < 3; i++) {
      try {
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-3-pro-image-preview',
            messages: [
              {
                role: 'user',
                content: prompts[i]
              }
            ],
            modalities: ['image', 'text']
          }),
        });

        if (!aiResponse.ok) {
          console.error(`[AI-THUMBNAIL-GENERATOR] API error for thumbnail ${i}:`, aiResponse.status);
          continue;
        }

        const aiData = await aiResponse.json();
        const imageUrl = aiData?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        
        if (imageUrl) {
          thumbnails.push({
            url: imageUrl,
            prompt: prompts[i],
            style: ['action', 'cinematic', 'close-up'][i]
          });
        }
      } catch (err) {
        console.error(`[AI-THUMBNAIL-GENERATOR] Error generating thumbnail ${i}:`, err);
        continue;
      }
    }

    if (thumbnails.length === 0) {
      return safeErrorResponse(new Error('Failed to generate thumbnails'), 'AI', 500);
    }

    // Store generated content
    await supabase.from('ai_generated_content').insert({
      user_id: user.id,
      content_type: 'thumbnail',
      content_data: { title: safeTitle, game: safeGame, thumbnails },
      used: false
    });

    console.log('[AI-THUMBNAIL-GENERATOR] Generated', thumbnails.length, 'thumbnails');

    return new Response(
      JSON.stringify({ thumbnails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return safeErrorResponse(error, 'AI-THUMBNAIL-GENERATOR');
  }
});
