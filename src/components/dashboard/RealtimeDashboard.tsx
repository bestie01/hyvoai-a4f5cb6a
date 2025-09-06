import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Users, MessageSquare, TrendingUp, Eye, Clock } from "lucide-react";
import { useRealtimeAnalytics } from "@/hooks/useRealtimeAnalytics";

interface RealtimeDashboardProps {
  streamId?: string;
  platform?: string;
  viewers?: number;
  duration?: string;
  isStreaming?: boolean;
}

export function RealtimeDashboard({ 
  streamId, 
  platform, 
  viewers = 0, 
  duration = "00:00:00", 
  isStreaming = false 
}: RealtimeDashboardProps) {
  const { metrics, realtimeMetrics, recordRealtimeData, getAnalytics, loading } = useRealtimeAnalytics();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Record real-time data when streaming
  useEffect(() => {
    if (!isStreaming || !streamId || !platform) return;

    const interval = setInterval(async () => {
      await recordRealtimeData({
        streamId,
        platform,
        viewers,
        duration,
        chatMessages: [], // Would be populated with actual chat data
        quality: 'HD'
      });
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isStreaming, streamId, platform, viewers, duration, recordRealtimeData]);

  // Fetch analytics on component mount
  useEffect(() => {
    getAnalytics(7);
  }, [getAnalytics]);

  return (
    <div className="space-y-4">
      {/* Live Status */}
      {isStreaming && (
        <Card className="bg-gradient-card border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                LIVE
              </div>
              <Badge variant="secondary" className="text-xs">
                {platform}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">{viewers}</span>
                </div>
                <p className="text-xs text-muted-foreground">Current Viewers</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-4 w-4 text-accent" />
                  <span className="text-lg font-bold text-foreground">{duration}</span>
                </div>
                <p className="text-xs text-muted-foreground">Stream Time</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Activity className="h-4 w-4 text-success" />
                  <span className="text-lg font-bold text-foreground">
                    {realtimeMetrics?.currentEngagement.toFixed(1) || "0.0"}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Engagement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Overview */}
      <Card className="bg-gradient-card border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5 text-primary" />
              Analytics Overview
            </div>
            <Badge variant="outline" className="text-xs">
              Last 7 days
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-2 bg-muted/50 rounded"></div>
                </div>
              ))}
            </div>
          ) : metrics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Total Streams</span>
                    <span className="text-sm font-medium text-foreground">{metrics.totalStreams}</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Peak Viewers</span>
                    <span className="text-sm font-medium text-foreground">{metrics.peakViewers}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Average Viewers</span>
                  <span className="text-sm font-medium text-foreground">{metrics.avgViewers}</span>
                </div>
                <Progress value={(metrics.avgViewers / metrics.peakViewers) * 100 || 0} className="h-2" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Average Engagement</span>
                  <span className="text-sm font-medium text-foreground">{metrics.avgEngagement}%</span>
                </div>
                <Progress value={metrics.avgEngagement} className="h-2" />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No analytics data yet</p>
              <p className="text-sm mt-1">Start streaming to see your metrics</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Last Update */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}