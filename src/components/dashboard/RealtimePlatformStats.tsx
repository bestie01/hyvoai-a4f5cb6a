import { useEffect } from "react";
import { motion } from "framer-motion";
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
  MessageSquare,
  Loader2
} from "lucide-react";
import { useRealPlatformStats } from "@/hooks/useRealPlatformStats";

interface RealtimePlatformStatsProps {
  onRefresh?: () => void;
}

export const RealtimePlatformStats = ({ onRefresh }: RealtimePlatformStatsProps) => {
  const { 
    twitchStats, 
    youtubeStats, 
    isLoading, 
    fetchStats,
    startPolling, 
    stopPolling 
  } = useRealPlatformStats();

  useEffect(() => {
    // Start polling for both platforms
    startPolling(['twitch', 'youtube'], 30000);
    
    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  const handleRefresh = async () => {
    await Promise.all([fetchStats('twitch'), fetchStats('youtube')]);
    onRefresh?.();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const platforms = [
    {
      name: "Twitch",
      icon: Twitch,
      color: "from-purple-500/20 to-purple-600/20",
      borderColor: "border-purple-500/30",
      iconColor: "text-purple-500",
      stats: twitchStats,
    },
    {
      name: "YouTube",
      icon: Youtube,
      color: "from-red-500/20 to-red-600/20",
      borderColor: "border-red-500/30",
      iconColor: "text-red-500",
      stats: youtubeStats,
    },
  ];

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-primary" />
          Platform Analytics
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {platforms.map((platform, index) => (
          <motion.div
            key={platform.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl bg-gradient-to-r ${platform.color} border ${platform.borderColor}`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <platform.icon className={`w-5 h-5 ${platform.iconColor}`} />
                <span className="font-semibold">{platform.name}</span>
              </div>
              
              {platform.stats?.isLive ? (
                <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                  <Radio className="w-3 h-3 mr-1" />
                  LIVE
                </Badge>
              ) : (
                <Badge variant="secondary">Offline</Badge>
              )}
            </div>

            {platform.stats ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                    <Eye className="w-3 h-3" />
                    Viewers
                  </div>
                  <div className="text-xl font-bold">{formatNumber(platform.stats.viewers)}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                    <Users className="w-3 h-3" />
                    Followers
                  </div>
                  <div className="text-xl font-bold">{formatNumber(platform.stats.followers)}</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                    <Heart className="w-3 h-3" />
                    Subscribers
                  </div>
                  <div className="text-xl font-bold">{formatNumber(platform.stats.subscribers)}</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-2">
                Connect your {platform.name} account to see stats
              </div>
            )}

            {platform.stats?.title && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="text-xs text-muted-foreground mb-1">Current Stream</div>
                <div className="text-sm font-medium truncate">{platform.stats.title}</div>
                {platform.stats.gameName && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Playing: {platform.stats.gameName}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
        
        {!twitchStats && !youtubeStats && !isLoading && (
          <div className="text-center py-6 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Connect your streaming platforms to see real-time analytics</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
