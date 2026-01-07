import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const stylePrompts: Record<string, string> = {
  enhanced: 'Improve the quality, sharpness, and clarity while maintaining the original style',
  vibrant: 'Make colors more vibrant and saturated, increase color contrast',
  dramatic: 'Add dramatic lighting, stronger shadows, and cinematic effects',
  minimal: 'Create a cleaner, more minimal version with simplified elements',
  gaming: 'Apply gaming aesthetic with neon accents, dynamic effects, and bold style',
  professional: 'Make it look more polished and professional with clean lines and balance',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, style = 'enhanced', customPrompt = '' } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('[AI-THUMBNAIL-RECREATE] LOVABLE_API_KEY not set');
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

    console.log('[AI-THUMBNAIL-RECREATE] Recreating thumbnail for user:', user.id);
    console.log('[AI-THUMBNAIL-RECREATE] Style:', style);

    const styleInstruction = stylePrompts[style] || stylePrompts.enhanced;
    const fullPrompt = customPrompt 
      ? `Recreate this thumbnail. ${styleInstruction}. Also: ${customPrompt}`
      : `Recreate this thumbnail with improvements. ${styleInstruction}. Keep the same subject and composition but enhance the overall quality and appeal.`;

    // Use Gemini 2.5 Flash to recreate the image
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: fullPrompt
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI-THUMBNAIL-RECREATE] API error:', errorText);
      throw new Error('Failed to recreate thumbnail');
    }

    const data = await response.json();
    const recreatedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!recreatedImageUrl) {
      console.error('[AI-THUMBNAIL-RECREATE] No image in response');
      throw new Error('No recreated image generated');
    }

    // Store recreation in database
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseService.from('ai_generated_content').insert({
      user_id: user.id,
      content_type: 'thumbnail_recreation',
      content_data: { style, customPrompt, originalUrl: imageUrl.substring(0, 100) }
    });

    console.log('[AI-THUMBNAIL-RECREATE] Recreation complete');

    return new Response(
      JSON.stringify({ imageUrl: recreatedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[AI-THUMBNAIL-RECREATE] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to recreate thumbnail' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
