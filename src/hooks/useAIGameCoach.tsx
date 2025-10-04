import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GameMetrics {
  kills?: number;
  deaths?: number;
  assists?: number;
  accuracy?: number;
  kda?: number;
  headshot_percentage?: number;
  [key: string]: any;
}

interface CoachingTip {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface ImprovementArea {
  skill: string;
  current: number;
  target: number;
  advice: string;
}

interface CoachingResult {
  overall_rating: number;
  strengths: string[];
  weaknesses: string[];
  tips: CoachingTip[];
  improvement_areas: ImprovementArea[];
}

export function useAIGameCoach() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [coaching, setCoaching] = useState<CoachingResult | null>(null);

  const analyzePerformance = useCallback(async (
    game: string,
    metrics: GameMetrics,
    sessionDuration: number
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('ai-game-coach', {
        body: { game, metrics, sessionDuration }
      });

      if (error) {
        console.error('[AI-GAME-COACH] Error:', error);
        toast({
          title: 'Analysis Failed',
          description: 'Failed to analyze performance',
          variant: 'destructive',
        });
        return { data: null, error };
      }

      setCoaching(data as CoachingResult);
      toast({
        title: 'Coaching Ready! 🎮',
        description: `Overall rating: ${data.overall_rating}/10`,
      });

      return { data, error: null };
    } catch (error) {
      console.error('[AI-GAME-COACH] Exception:', error);
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
    analyzePerformance,
    coaching,
    loading,
  };
}
