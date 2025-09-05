import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { streamData, chatMessages, audioLevels } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Analyze stream data for highlight moments
    const analysisPrompt = `Analyze this streaming session data to identify highlight moments:

Stream Info:
- Duration: ${streamData.duration}
- Viewers: ${streamData.viewers}
- Game/Category: ${streamData.category}

Recent Chat Activity:
${chatMessages.slice(-50).map((msg: any) => `${msg.timestamp}: ${msg.username}: ${msg.message}`).join('\n')}

Audio Activity Levels (1-100):
${audioLevels.map((level: number, index: number) => `${index}s: ${level}`).join(', ')}

Identify potential highlight moments based on:
1. High chat activity/excitement
2. Audio spikes (loud reactions)
3. Viewer count changes
4. Exciting chat keywords

Return JSON format:
{
  "highlights": [
    {
      "timestamp": "HH:MM:SS",
      "duration": 30,
      "type": "reaction|gameplay|chat_moment|achievement",
      "confidence": 0-100,
      "description": "Brief description",
      "suggested_title": "Catchy title for clip",
      "tags": ["tag1", "tag2"]
    }
  ],
  "summary": "Overall stream summary"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an AI highlight detector for streaming content. Identify the most engaging moments.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.4,
      }),
    });

    const aiResponse = await response.json();
    const analysis = JSON.parse(aiResponse.choices[0].message.content);

    // Store highlights in Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error } = await supabase
      .from('stream_highlights')
      .insert({
        stream_id: streamData.id,
        highlights: analysis.highlights,
        summary: analysis.summary,
        generated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing highlights:', error);
    }

    return new Response(JSON.stringify({
      success: true,
      highlights: analysis.highlights,
      summary: analysis.summary
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in AI highlight generation:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});