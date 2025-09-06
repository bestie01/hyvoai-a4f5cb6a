import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
}

interface ChatAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  toxicity_score: number;
  engagement_score: number;
  topics: string[];
  highlights: Array<{
    message: string;
    username: string;
    reason: string;
  }>;
  moderation_flags: Array<{
    message: string;
    reason: string;
  }>;
}

export function useAIChatAnalysis() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ChatAnalysis | null>(null);

  const analyzeChat = useCallback(async (
    messages: ChatMessage[],
    platform: string,
    streamId: string
  ) => {
    if (messages.length === 0) {
      return { data: null, error: "No messages to analyze" };
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('ai-chat-analysis', {
        body: { messages, platform, streamId }
      });

      if (error) {
        console.error('Error analyzing chat:', error);
        toast({
          title: "Analysis Error",
          description: "Failed to analyze chat messages",
          variant: "destructive",
        });
        return { data: null, error };
      }

      setAnalysis(data.analysis);
      return { data: data.analysis, error: null };
    } catch (error) {
      console.error('Error in analyzeChat:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze chat messages",
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getChatAnalysisHistory = useCallback(async (streamId?: string) => {
    try {
      let query = supabase
        .from('chat_analysis')
        .select('*')
        .order('analyzed_at', { ascending: false });

      if (streamId) {
        query = query.eq('stream_id', streamId);
      }

      const { data, error } = await query.limit(10);

      if (error) {
        console.error('Error fetching chat analysis history:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getChatAnalysisHistory:', error);
      return { data: null, error };
    }
  }, []);

  return {
    analyzeChat,
    getChatAnalysisHistory,
    analysis,
    loading,
  };
}