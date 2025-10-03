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
    const { question, streamId, mode = 'answer' } = await req.json();

    if (!question) {
      throw new Error('Question is required');
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

    console.log('[AI-VIEWER-QA] Processing question:', question);

    // Fetch existing Q&A knowledge base
    const { data: knowledge, error: knowledgeError } = await supabase
      .from('viewer_qa_knowledge')
      .select('*')
      .eq('user_id', user.id);

    if (knowledgeError) {
      console.error('[AI-VIEWER-QA] Error fetching knowledge:', knowledgeError);
    }

    const knowledgeContext = knowledge?.map(k => 
      `Q: ${k.question}\nA: ${k.answer}`
    ).join('\n\n') || 'No knowledge base yet.';

    // Call Lovable AI
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
            content: `You are a helpful stream chat assistant. Answer viewer questions based on the streamer's knowledge base. If you don't know the answer, say so clearly.

Be concise, friendly, and helpful. Use the streamer's tone from their knowledge base.`
          },
          {
            role: 'user',
            content: `Knowledge Base:
${knowledgeContext}

Viewer Question: ${question}

${mode === 'suggest' ? 'If this is a new question, suggest an answer the streamer could add to their knowledge base.' : 'Answer this question based on the knowledge base.'}`
          }
        ]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[AI-VIEWER-QA] API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const answer = aiData.choices[0].message.content;

    // Update usage count for matched questions
    const matchedKnowledge = knowledge?.find(k => 
      question.toLowerCase().includes(k.question.toLowerCase()) ||
      k.question.toLowerCase().includes(question.toLowerCase())
    );

    if (matchedKnowledge) {
      await supabase
        .from('viewer_qa_knowledge')
        .update({ usage_count: (matchedKnowledge.usage_count || 0) + 1 })
        .eq('id', matchedKnowledge.id);
    }

    console.log('[AI-VIEWER-QA] Answer generated');

    return new Response(
      JSON.stringify({ 
        answer,
        matched: !!matchedKnowledge,
        suggestion: mode === 'suggest'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[AI-VIEWER-QA] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});