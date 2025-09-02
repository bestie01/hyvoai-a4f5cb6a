import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  stream_id: string;
  platform: 'twitch' | 'youtube';
  viewers: number;
  duration: string;
  messages: number;
  engagement_rate: number;
  quality: string;
}

interface AnalyticsSummary {
  totalStreams: number;
  totalViewers: number;
  avgViewers: number;
  peakViewers: number;
  records: AnalyticsData[];
}

export function useStreamAnalytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const recordAnalytics = useCallback(async (data: AnalyticsData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.functions.invoke('streaming-analytics', {
        body: data
      });

      if (error) {
        console.error('Error recording analytics:', error);
        toast({
          title: "Analytics Error",
          description: "Failed to record stream analytics",
          variant: "destructive",
        });
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in recordAnalytics:', error);
      toast({
        title: "Analytics Error",
        description: "Failed to record stream analytics",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getAnalytics = useCallback(async (
    userId: string, 
    platform?: 'twitch' | 'youtube', 
    days: number = 7
  ): Promise<{ data: AnalyticsSummary | null; error: any }> => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        user_id: userId,
        days: days.toString(),
      });
      
      if (platform) {
        params.append('platform', platform);
      }

      const { data, error } = await supabase.functions.invoke('streaming-analytics?' + params.toString(), {
        method: 'GET'
      });

      if (error) {
        console.error('Error fetching analytics:', error);
        toast({
          title: "Analytics Error",
          description: "Failed to fetch stream analytics",
          variant: "destructive",
        });
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      toast({
        title: "Analytics Error",
        description: "Failed to fetch stream analytics",
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    recordAnalytics,
    getAnalytics,
    loading,
  };
}