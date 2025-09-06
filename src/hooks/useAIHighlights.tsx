import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StreamData {
  id: string;
  duration: string;
  viewers: number;
  category: string;
}

interface ChatMessage {
  username: string;
  message: string;
  timestamp: string;
}

interface Highlight {
  timestamp: string;
  duration: number;
  type: 'reaction' | 'gameplay' | 'chat_moment' | 'achievement';
  confidence: number;
  description: string;
  suggested_title: string;
  tags: string[];
}

export function useAIHighlights() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  const generateHighlights = useCallback(async (
    streamData: StreamData,
    chatMessages: ChatMessage[],
    audioLevels: number[]
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('ai-highlight-generator', {
        body: { streamData, chatMessages, audioLevels }
      });

      if (error) {
        console.error('Error generating highlights:', error);
        toast({
          title: "Highlight Generation Error",
          description: "Failed to generate stream highlights",
          variant: "destructive",
        });
        return { data: null, error };
      }

      setHighlights(data.highlights);
      return { data: data.highlights, summary: data.summary, error: null };
    } catch (error) {
      console.error('Error in generateHighlights:', error);
      toast({
        title: "Highlight Generation Error",
        description: "Failed to generate stream highlights",
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getHighlightsHistory = useCallback(async (streamId?: string) => {
    try {
      let query = supabase
        .from('stream_highlights')
        .select('*')
        .order('generated_at', { ascending: false });

      if (streamId) {
        query = query.eq('stream_id', streamId);
      }

      const { data, error } = await query.limit(10);

      if (error) {
        console.error('Error fetching highlights history:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getHighlightsHistory:', error);
      return { data: null, error };
    }
  }, []);

  return {
    generateHighlights,
    getHighlightsHistory,
    highlights,
    loading,
  };
}