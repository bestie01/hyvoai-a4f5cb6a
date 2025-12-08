import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealPlatformStats {
  viewers: number;
  followers: number;
  subscribers: number;
  isLive: boolean;
  title: string;
  gameName?: string;
  channelName?: string;
  totalViews?: number;
  lastUpdated: Date;
}

interface UseRealPlatformStatsReturn {
  twitchStats: RealPlatformStats | null;
  youtubeStats: RealPlatformStats | null;
  isLoading: boolean;
  error: string | null;
  fetchStats: (platform: 'twitch' | 'youtube') => Promise<RealPlatformStats | null>;
  startPolling: (platforms: ('twitch' | 'youtube')[], intervalMs?: number) => void;
  stopPolling: () => void;
}

const DEFAULT_STATS: RealPlatformStats = {
  viewers: 0,
  followers: 0,
  subscribers: 0,
  isLive: false,
  title: '',
  lastUpdated: new Date(),
};

export const useRealPlatformStats = (): UseRealPlatformStatsReturn => {
  const { toast } = useToast();
  const [twitchStats, setTwitchStats] = useState<RealPlatformStats | null>(null);
  const [youtubeStats, setYoutubeStats] = useState<RealPlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async (platform: 'twitch' | 'youtube'): Promise<RealPlatformStats | null> => {
    try {
      const { data, error: fetchError } = await supabase.functions.invoke('platform-stats', {
        body: { platform, action: 'get_stats' },
      });

      if (fetchError) {
        console.error(`Error fetching ${platform} stats:`, fetchError);
        return null;
      }

      if (data?.needsAuth) {
        // Platform not connected
        return null;
      }

      if (data?.stats) {
        const stats: RealPlatformStats = {
          viewers: data.stats.viewers || 0,
          followers: data.stats.followers || 0,
          subscribers: data.stats.subscribers || 0,
          isLive: data.stats.isLive || false,
          title: data.stats.title || '',
          gameName: data.stats.gameName,
          channelName: data.stats.channelName,
          totalViews: data.stats.totalViews,
          lastUpdated: new Date(),
        };

        if (platform === 'twitch') {
          setTwitchStats(stats);
        } else {
          setYoutubeStats(stats);
        }

        return stats;
      }

      return null;
    } catch (err) {
      console.error(`Error fetching ${platform} stats:`, err);
      return null;
    }
  }, []);

  const startPolling = useCallback((
    platforms: ('twitch' | 'youtube')[],
    intervalMs: number = 30000
  ) => {
    // Clear any existing polling
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setIsLoading(true);

    // Fetch immediately for all platforms
    const fetchAll = async () => {
      await Promise.all(platforms.map(p => fetchStats(p)));
      setIsLoading(false);
    };

    fetchAll();

    // Set up polling interval
    pollingIntervalRef.current = setInterval(() => {
      platforms.forEach(p => fetchStats(p));
    }, intervalMs);

    console.log(`[useRealPlatformStats] Started polling for ${platforms.join(', ')} every ${intervalMs}ms`);
  }, [fetchStats]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log('[useRealPlatformStats] Stopped polling');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return {
    twitchStats,
    youtubeStats,
    isLoading,
    error,
    fetchStats,
    startPolling,
    stopPolling,
  };
};
