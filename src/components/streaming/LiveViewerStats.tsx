import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Twitch, 
  Youtube, 
  Users, 
  Eye, 
  Heart, 
  RefreshCw, 
  Radio,
  TrendingUp,
  Clock,
  Loader2,
  Wifi,
  WifiOff
} from "lucide-react";
import { useRealPlatformStats } from "@/hooks/useRealPlatformStats";
import { usePlatformOAuth } from "@/hooks/usePlatformOAuth";
import { cn } from "@/lib/utils";

interface LiveViewerStatsProps {
  isStreaming?: boolean;
  onConnectPlatform?: (platform: 'twitch' | 'youtube') => void;
}

export const LiveViewerStats = ({ isStreaming = false, onConnectPlatform }: LiveViewerStatsProps) => {
  const { 
    twitchStats, 
    youtubeStats, 
    isLoading, 
    fetchStats,
    startPolling, 
    stopPolling 
  } = useRealPlatformStats();

  const {
    twitchConnection,
    youtubeConnection,
  } = usePlatformOAuth();

  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Start/stop polling based on streaming status
  useEffect(() => {
    if (isStreaming) {
      // Poll every 10 seconds when streaming
      startPolling(['twitch', 'youtube'], 10000);
    } else {
      // Poll every 30 seconds when not streaming
      startPolling(['twitch', 'youtube'], 30000);
    }
    
    return () => stopPolling();
  }, [isStreaming, startPolling, stopPolling]);

  // Track last update time
  useEffect(() => {
    if (twitchStats || youtubeStats) {
      setLastUpdate(new Date());
    }
  }, [twitchStats, youtubeStats]);

  const handleRefresh = async () => {
    await Promise.all([fetchStats('twitch'), fetchStats('youtube')]);
    setLastUpdate(new Date());
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getTimeSinceUpdate = (): string => {
    if (!lastUpdate) return '';
    const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const totalViewers = (twitchStats?.viewers || 0) + (youtubeStats?.viewers || 0);
  const isLive = twitchStats?.isLive || youtubeStats?.isLive;

  return (
    <Card className="glass-card overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Live Stats
            {isLive && (
              <Badge className="bg-destructive text-destructive-foreground text-xs animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {lastUpdate && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getTimeSinceUpdate()}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Total Viewers */}
        <motion.div 
          className="text-center p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Eye className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Viewers</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={totalViewers}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-4xl font-bold text-gradient-primary"
            >
              {formatNumber(totalViewers)}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 gap-2">
          {/* Twitch */}
          <motion.div
            className={cn(
              "p-3 rounded-lg border transition-all",
              twitchConnection?.isConnected 
                ? "bg-[#9146FF]/10 border-[#9146FF]/30" 
                : "bg-muted/30 border-border opacity-60"
            )}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Twitch className="w-4 h-4 text-[#9146FF]" />
              <span className="text-xs font-medium">Twitch</span>
              {twitchStats?.isLive && (
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse ml-auto" />
              )}
            </div>
            
            {twitchConnection?.isConnected ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Viewers</span>
                  <span className="font-semibold">{formatNumber(twitchStats?.viewers || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Followers</span>
                  <span className="text-sm">{formatNumber(twitchStats?.followers || 0)}</span>
                </div>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs h-7"
                onClick={() => onConnectPlatform?.('twitch')}
              >
                <WifiOff className="w-3 h-3 mr-1" />
                Connect
              </Button>
            )}
          </motion.div>

          {/* YouTube */}
          <motion.div
            className={cn(
              "p-3 rounded-lg border transition-all",
              youtubeConnection?.isConnected 
                ? "bg-[#FF0000]/10 border-[#FF0000]/30" 
                : "bg-muted/30 border-border opacity-60"
            )}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Youtube className="w-4 h-4 text-[#FF0000]" />
              <span className="text-xs font-medium">YouTube</span>
              {youtubeStats?.isLive && (
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse ml-auto" />
              )}
            </div>
            
            {youtubeConnection?.isConnected ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Viewers</span>
                  <span className="font-semibold">{formatNumber(youtubeStats?.viewers || 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Subs</span>
                  <span className="text-sm">{formatNumber(youtubeStats?.subscribers || 0)}</span>
                </div>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs h-7"
                onClick={() => onConnectPlatform?.('youtube')}
              >
                <WifiOff className="w-3 h-3 mr-1" />
                Connect
              </Button>
            )}
          </motion.div>
        </div>

        {/* Stream Info */}
        {(twitchStats?.title || youtubeStats?.title) && (
          <div className="p-2 rounded-lg bg-muted/50 border border-border/50">
            <span className="text-xs text-muted-foreground">Now Streaming:</span>
            <p className="text-sm font-medium truncate">
              {twitchStats?.title || youtubeStats?.title}
            </p>
            {twitchStats?.gameName && (
              <span className="text-xs text-primary">{twitchStats.gameName}</span>
            )}
          </div>
        )}

        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <Wifi className={cn(
            "w-3 h-3",
            (twitchConnection?.isConnected || youtubeConnection?.isConnected) 
              ? "text-success" 
              : "text-muted-foreground"
          )} />
          <span className="text-xs text-muted-foreground">
            {twitchConnection?.isConnected && youtubeConnection?.isConnected 
              ? "Both platforms connected"
              : twitchConnection?.isConnected 
                ? "Twitch connected"
                : youtubeConnection?.isConnected 
                  ? "YouTube connected"
                  : "No platforms connected"
            }
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
