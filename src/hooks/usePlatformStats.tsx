import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlatformStats {
  viewers: number;
  followers: number;
  subscribers: number;
  chatMessages: number;
  peakViewers: number;
  averageViewers: number;
  streamUptime: number;
  lastUpdated: Date;
}

interface UsePlatformStatsReturn {
  stats: PlatformStats;
  isLoading: boolean;
  error: string | null;
  fetchStats: (platform: 'twitch' | 'youtube', streamId?: string) => Promise<void>;
  startPolling: (platform: 'twitch' | 'youtube', streamId: string, intervalMs?: number) => void;
  stopPolling: () => void;
}

const DEFAULT_STATS: PlatformStats = {
  viewers: 0,
  followers: 0,
  subscribers: 0,
  chatMessages: 0,
  peakViewers: 0,
  averageViewers: 0,
  streamUptime: 0,
  lastUpdated: new Date(),
};

export const usePlatformStats = (): UsePlatformStatsReturn => {
  const { toast } = useToast();
  const [stats, setStats] = useState<PlatformStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const viewerHistoryRef = useRef<number[]>([]);

  const fetchStats = useCallback(async (platform: 'twitch' | 'youtube', streamId?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const functionName = platform === 'twitch' ? 'twitch-stream' : 'youtube-stream';
      
      const { data, error: fetchError } = await supabase.functions.invoke(functionName, {
        body: { 
          action: 'get_stats',
          streamId 
        },
      });

      if (fetchError) throw fetchError;

      if (data) {
        const newViewerCount = data.viewers || 0;
        viewerHistoryRef.current.push(newViewerCount);
        
        // Keep only last 100 samples for average calculation
        if (viewerHistoryRef.current.length > 100) {
          viewerHistoryRef.current.shift();
        }

        const averageViewers = viewerHistoryRef.current.length > 0
          ? Math.round(viewerHistoryRef.current.reduce((a, b) => a + b, 0) / viewerHistoryRef.current.length)
          : 0;

        setStats(prev => ({
          viewers: newViewerCount,
          followers: data.followers || prev.followers,
          subscribers: data.subscribers || prev.subscribers,
          chatMessages: data.chatMessages || prev.chatMessages,
          peakViewers: Math.max(prev.peakViewers, newViewerCount),
          averageViewers,
          streamUptime: data.uptime || prev.streamUptime,
          lastUpdated: new Date(),
        }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(errorMessage);
      console.error('Platform stats error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startPolling = useCallback((
    platform: 'twitch' | 'youtube', 
    streamId: string, 
    intervalMs: number = 30000
  ) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Reset viewer history for new stream
    viewerHistoryRef.current = [];

    // Fetch immediately
    fetchStats(platform, streamId);

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      fetchStats(platform, streamId);
    }, intervalMs);

    toast({
      title: "Stats Polling Started",
      description: `Fetching ${platform} stats every ${intervalMs / 1000}s`,
    });
  }, [fetchStats, toast]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      
      toast({
        title: "Stats Polling Stopped",
        description: "Real-time stats updates paused",
      });
    }
  }, [toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    stats,
    isLoading,
    error,
    fetchStats,
    startPolling,
    stopPolling,
  };
};
