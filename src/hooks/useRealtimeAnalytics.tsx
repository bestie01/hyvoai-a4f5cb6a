import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface RealtimeMetrics {
  currentViewers: number;
  currentEngagement: number;
  streamDuration: string;
  messageRate: number;
}

interface DashboardMetrics {
  totalStreams: number;
  totalViewers: number;
  avgViewers: number;
  peakViewers: number;
  avgEngagement: number;
}

export function useRealtimeAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics | null>(null);

  const recordRealtimeData = useCallback(async (data: {
    streamId: string;
    platform: string;
    viewers: number;
    duration: string;
    chatMessages?: any[];
    audioLevel?: number;
    quality?: string;
  }) => {
    if (!user) return { error: "User not authenticated" };

    try {
      setLoading(true);
      
      const { data: result, error } = await supabase.functions.invoke('realtime-analytics', {
        body: data
      });

      if (error) {
        console.error('Error recording realtime analytics:', error);
        toast({
          title: "Analytics Error",
          description: "Failed to record analytics data",
          variant: "destructive",
        });
        return { error };
      }

      // Update local state with new metrics
      if (result.metrics) {
        setMetrics(result.metrics);
      }
      if (result.realtime) {
        setRealtimeMetrics(result.realtime);
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Error in recordRealtimeData:', error);
      toast({
        title: "Analytics Error",
        description: "Failed to record analytics data",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const getAnalytics = useCallback(async (days: number = 7) => {
    if (!user) return { data: null, error: "User not authenticated" };

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('stream_analytics')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching analytics:', error);
        return { data: null, error };
      }

      // Calculate metrics
      const calculatedMetrics: DashboardMetrics = {
        totalStreams: data.length,
        totalViewers: data.reduce((sum, record) => sum + record.viewers, 0),
        avgViewers: data.length ? Math.round((data.reduce((sum, record) => sum + record.viewers, 0) / data.length) * 100) / 100 : 0,
        peakViewers: Math.max(...data.map(record => record.viewers), 0),
        avgEngagement: data.length ? Math.round((data.reduce((sum, record) => sum + record.engagement_rate, 0) / data.length) * 100) / 100 : 0
      };

      setMetrics(calculatedMetrics);
      return { data: calculatedMetrics, error: null };
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Set up real-time subscription for analytics updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('stream-analytics-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'stream_analytics',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New analytics data:', payload);
          // Refresh metrics when new data comes in
          getAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, getAnalytics]);

  return {
    recordRealtimeData,
    getAnalytics,
    metrics,
    realtimeMetrics,
    loading,
  };
}