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
    const { imageUrl, instruction } = await req.json();

    if (!imageUrl || !instruction) {
      return new Response(
        JSON.stringify({ error: 'Image URL and instruction required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('[AI-THUMBNAIL-EDIT] LOVABLE_API_KEY not set');
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

    console.log('[AI-THUMBNAIL-EDIT] Editing thumbnail for user:', user.id);
    console.log('[AI-THUMBNAIL-EDIT] Instruction:', instruction);

    // Use Gemini 2.5 Flash to edit the image
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
                text: `Edit this image with the following changes: ${instruction}. Maintain the overall style and quality of the image.`
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
      console.error('[AI-THUMBNAIL-EDIT] API error:', errorText);
      throw new Error('Failed to edit thumbnail');
    }

    const data = await response.json();
    const editedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!editedImageUrl) {
      console.error('[AI-THUMBNAIL-EDIT] No image in response');
      throw new Error('No edited image generated');
    }

    // Store edit in database
    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabaseService.from('ai_generated_content').insert({
      user_id: user.id,
      content_type: 'thumbnail_edit',
      content_data: { instruction, originalUrl: imageUrl.substring(0, 100) }
    });

    console.log('[AI-THUMBNAIL-EDIT] Edit complete');

    return new Response(
      JSON.stringify({ imageUrl: editedImageUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[AI-THUMBNAIL-EDIT] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to edit thumbnail' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
