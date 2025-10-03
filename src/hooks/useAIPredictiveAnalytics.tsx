import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OptimalStreamTime {
  day: string;
  time: string;
  expected_viewers: number;
  confidence: number;
}

interface ViewerForecast {
  next_week: number;
  next_month: number;
  growth_rate: number;
}

interface Recommendation {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
}

interface PredictiveAnalytics {
  optimal_stream_times: OptimalStreamTime[];
  viewer_forecast: ViewerForecast;
  recommendations: Recommendation[];
  insights: string[];
}

export function useAIPredictiveAnalytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [predictions, setPredictions] = useState<PredictiveAnalytics | null>(null);

  const generatePredictions = useCallback(async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('ai-predictive-analytics');

      if (error) {
        console.error('[AI-PREDICTIVE-ANALYTICS] Error:', error);
        toast({
          title: 'Analysis Failed',
          description: error.message || 'Failed to generate predictions',
          variant: 'destructive',
        });
        return { data: null, error };
      }

      setPredictions(data);
      toast({
        title: 'AI Insights Ready! 📊',
        description: `Generated ${data.recommendations.length} recommendations`,
      });

      return { data, error: null };
    } catch (error) {
      console.error('[AI-PREDICTIVE-ANALYTICS] Exception:', error);
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
    generatePredictions,
    predictions,
    loading,
  };
}