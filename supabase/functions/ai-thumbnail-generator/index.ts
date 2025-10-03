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
    const { title, game, style } = await req.json();

    if (!title || !game) {
      throw new Error('Title and game are required');
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

    console.log('[AI-THUMBNAIL-GENERATOR] Generating thumbnail for:', { title, game, style });

    const prompts = [
      `Gaming stream thumbnail for ${game}, featuring ${title}, vibrant neon colors, action-packed composition, professional esports style, dramatic lighting, 16:9 aspect ratio`,
      `${game} gameplay thumbnail, cinematic composition, ${title} text overlay, gaming aesthetic, high energy, colorful gradients, modern design`,
      `Stream thumbnail for ${game}, close-up dynamic action, ${title}, bold typography, eye-catching colors, professional quality`
    ];

    const thumbnails = [];

    for (let i = 0; i < 3; i++) {
      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
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
        const errorText = await aiResponse.text();
        console.error('[AI-THUMBNAIL-GENERATOR] API error:', errorText);
        continue;
      }

      const aiData = await aiResponse.json();
      const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageUrl) {
        thumbnails.push({
          url: imageUrl,
          prompt: prompts[i],
          style: ['action', 'cinematic', 'close-up'][i]
        });
      }
    }

    if (thumbnails.length === 0) {
      throw new Error('Failed to generate any thumbnails');
    }

    // Store generated content
    await supabase.from('ai_generated_content').insert({
      user_id: user.id,
      content_type: 'thumbnail',
      content_data: { title, game, thumbnails },
      used: false
    });

    console.log('[AI-THUMBNAIL-GENERATOR] Generated', thumbnails.length, 'thumbnails');

    return new Response(
      JSON.stringify({ thumbnails }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[AI-THUMBNAIL-GENERATOR] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});