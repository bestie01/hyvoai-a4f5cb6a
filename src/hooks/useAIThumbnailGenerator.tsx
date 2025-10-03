import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Thumbnail {
  url: string;
  prompt: string;
  style: string;
}

export function useAIThumbnailGenerator() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);

  const generateThumbnails = useCallback(async (
    title: string,
    game: string,
    style?: string
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('ai-thumbnail-generator', {
        body: { title, game, style }
      });

      if (error) {
        console.error('[AI-THUMBNAIL-GENERATOR] Error:', error);
        toast({
          title: 'Generation Failed',
          description: 'Failed to generate thumbnails. Please try again.',
          variant: 'destructive',
        });
        return { data: null, error };
      }

      setThumbnails(data.thumbnails);
      toast({
        title: 'Thumbnails Generated! 🎨',
        description: `Generated ${data.thumbnails.length} thumbnail options`,
      });

      return { data, error: null };
    } catch (error) {
      console.error('[AI-THUMBNAIL-GENERATOR] Exception:', error);
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
    generateThumbnails,
    thumbnails,
    loading,
  };
}