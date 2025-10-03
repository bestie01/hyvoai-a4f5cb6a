import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TitleGeneratorResult {
  titles: string[];
  descriptions: string[];
}

export function useAITitleGenerator() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TitleGeneratorResult | null>(null);

  const generateTitles = useCallback(async (
    game: string,
    theme?: string,
    targetAudience?: string
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('ai-title-generator', {
        body: { game, theme, targetAudience }
      });

      if (error) {
        console.error('[AI-TITLE-GENERATOR] Error:', error);
        toast({
          title: 'Generation Failed',
          description: 'Failed to generate titles. Please try again.',
          variant: 'destructive',
        });
        return { data: null, error };
      }

      setResult(data);
      toast({
        title: 'Titles Generated! 🎯',
        description: `Generated ${data.titles.length} title options`,
      });

      return { data, error: null };
    } catch (error) {
      console.error('[AI-TITLE-GENERATOR] Exception:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    generateTitles,
    result,
    loading,
  };
}