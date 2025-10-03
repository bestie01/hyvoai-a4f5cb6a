import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAIViewerQA() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const answerQuestion = useCallback(async (
    question: string,
    streamId?: string,
    mode: 'answer' | 'suggest' = 'answer'
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('ai-viewer-qa', {
        body: { question, streamId, mode }
      });

      if (error) {
        console.error('[AI-VIEWER-QA] Error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('[AI-VIEWER-QA] Exception:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  const addKnowledge = useCallback(async (
    question: string,
    answer: string,
    autoRespond: boolean = true
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('viewer_qa_knowledge')
        .insert({
          user_id: user.id,
          question,
          answer,
          auto_respond: autoRespond
        });

      if (error) {
        console.error('[AI-VIEWER-QA] Add knowledge error:', error);
        toast({
          title: 'Failed to Add',
          description: 'Could not add to knowledge base',
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: 'Knowledge Added! 📚',
        description: 'AI will now answer this question automatically',
      });

      return { error: null };
    } catch (error) {
      console.error('[AI-VIEWER-QA] Exception:', error);
      return { error };
    }
  }, [toast]);

  const getKnowledge = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('viewer_qa_knowledge')
        .select('*')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false });

      if (error) {
        console.error('[AI-VIEWER-QA] Get knowledge error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('[AI-VIEWER-QA] Exception:', error);
      return { data: null, error };
    }
  }, []);

  return {
    answerQuestion,
    addKnowledge,
    getKnowledge,
    loading,
  };
}