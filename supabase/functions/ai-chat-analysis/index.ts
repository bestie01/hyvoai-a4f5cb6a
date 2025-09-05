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
    const { messages, platform, streamId } = await req.json();

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Analyze chat messages for sentiment, toxicity, and engagement
    const analysisPrompt = `Analyze these chat messages for:
1. Overall sentiment (positive/negative/neutral)
2. Toxicity level (0-100)
3. Engagement level (0-100)
4. Key topics/themes
5. Highlight moments (exciting/funny messages)

Chat messages:
${messages.map((msg: any) => `${msg.username}: ${msg.message}`).join('\n')}

Return JSON format:
{
  "sentiment": "positive|negative|neutral",
  "toxicity_score": 0-100,
  "engagement_score": 0-100,
  "topics": ["topic1", "topic2"],
  "highlights": [{"message": "text", "username": "user", "reason": "funny/exciting"}],
  "moderation_flags": [{"message": "text", "reason": "toxic/spam"}]
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
          { role: 'system', content: 'You are an AI chat analyst for streaming platforms. Analyze chat messages and return structured data.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
      }),
    });

    const aiResponse = await response.json();
    const analysis = JSON.parse(aiResponse.choices[0].message.content);

    // Store analysis in Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error } = await supabase
      .from('chat_analysis')
      .insert({
        stream_id: streamId,
        platform: platform,
        message_count: messages.length,
        sentiment: analysis.sentiment,
        toxicity_score: analysis.toxicity_score,
        engagement_score: analysis.engagement_score,
        topics: analysis.topics,
        highlights: analysis.highlights,
        moderation_flags: analysis.moderation_flags,
        analyzed_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing analysis:', error);
    }

    return new Response(JSON.stringify({
      success: true,
      analysis
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in AI chat analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});