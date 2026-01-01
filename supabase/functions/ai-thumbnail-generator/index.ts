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
      `Create a vibrant gaming stream thumbnail for ${game}. Title: "${title}". Style: Bold neon colors, action-packed dynamic composition, professional esports aesthetic with dramatic lighting. 16:9 landscape format, eye-catching and click-worthy.`,
      `Design a cinematic ${game} stream thumbnail featuring "${title}". Include gaming aesthetic with colorful gradients, modern typography style, high energy composition. Professional quality, 16:9 aspect ratio.`,
      `Generate a professional stream thumbnail for ${game} gameplay. Focus: "${title}". Style: Close-up dramatic action shot, bold colors, eye-catching design that stands out. High quality, 16:9 format.`
    ];

    const thumbnails = [];

    // Use Gemini image generation model
    for (let i = 0; i < 3; i++) {
      try {
        console.log(`[AI-THUMBNAIL-GENERATOR] Generating thumbnail ${i + 1}/3...`);
        
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image',
            messages: [
              {
                role: 'user',
                content: prompts[i]
              }
            ]
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`[AI-THUMBNAIL-GENERATOR] API error for thumbnail ${i + 1}:`, aiResponse.status, errorText);
          
          // Handle rate limits
          if (aiResponse.status === 429) {
            console.log('[AI-THUMBNAIL-GENERATOR] Rate limited, waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          continue;
        }

        const aiData = await aiResponse.json();
        console.log(`[AI-THUMBNAIL-GENERATOR] Response for thumbnail ${i + 1}:`, JSON.stringify(aiData).substring(0, 500));

        // Extract image from various possible response formats
        let imageUrl = null;
        
        // Check for inline_data format (base64)
        const content = aiData.choices?.[0]?.message?.content;
        if (Array.isArray(content)) {
          for (const part of content) {
            if (part.type === 'image' && part.image?.data) {
              imageUrl = `data:${part.image.mime_type || 'image/png'};base64,${part.image.data}`;
              break;
            }
            if (part.inline_data?.data) {
              imageUrl = `data:${part.inline_data.mime_type || 'image/png'};base64,${part.inline_data.data}`;
              break;
            }
          }
        }
        
        // Check for images array format
        if (!imageUrl && aiData.choices?.[0]?.message?.images) {
          const images = aiData.choices[0].message.images;
          if (images.length > 0) {
            imageUrl = images[0].image_url?.url || images[0].url || images[0];
          }
        }

        // Check for image_url format
        if (!imageUrl && aiData.choices?.[0]?.message?.image_url) {
          imageUrl = aiData.choices[0].message.image_url.url || aiData.choices[0].message.image_url;
        }
        
        if (imageUrl) {
          thumbnails.push({
            url: imageUrl,
            prompt: prompts[i],
            style: ['action', 'cinematic', 'close-up'][i]
          });
          console.log(`[AI-THUMBNAIL-GENERATOR] Successfully generated thumbnail ${i + 1}`);
        } else {
          console.log(`[AI-THUMBNAIL-GENERATOR] No image found in response ${i + 1}`);
        }

        // Small delay between requests to avoid rate limiting
        if (i < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (innerError) {
        console.error(`[AI-THUMBNAIL-GENERATOR] Error generating thumbnail ${i + 1}:`, innerError);
      }
    }

    if (thumbnails.length === 0) {
      // Generate fallback placeholder thumbnails with AI descriptions
      console.log('[AI-THUMBNAIL-GENERATOR] Generating text descriptions as fallback...');
      
      const fallbackResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: 'You are a creative thumbnail designer. Describe 3 unique thumbnail concepts in detail.'
            },
            {
              role: 'user',
              content: `Create 3 detailed thumbnail concept descriptions for a ${game} stream titled "${title}". Each should be unique and eye-catching. Return as JSON: { "concepts": [{ "title": "...", "description": "...", "colors": ["..."], "elements": ["..."] }] }`
            }
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const concepts = JSON.parse(fallbackData.choices[0].message.content);
        
        // Create placeholder images with gradient backgrounds
        const gradients = [
          'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
        ];

        concepts.concepts?.forEach((concept: any, index: number) => {
          thumbnails.push({
            url: `https://placehold.co/1920x1080/667eea/ffffff?text=${encodeURIComponent(title.substring(0, 20))}`,
            prompt: concept.description || prompts[index],
            style: concept.title || ['action', 'cinematic', 'close-up'][index],
            isPlaceholder: true,
            concept: concept
          });
        });
      }
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
      JSON.stringify({ 
        thumbnails,
        message: thumbnails.length > 0 ? 'Thumbnails generated successfully' : 'Generated concept descriptions'
      }),
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
