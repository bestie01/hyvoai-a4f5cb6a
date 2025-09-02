import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Eye,
  MessageSquare,
  Heart,
  Share2
} from "lucide-react";

interface StreamAnalyticsProps {
  viewers: number;
  streamTime: string;
  isStreaming: boolean;
}

export function StreamAnalytics({ viewers, streamTime, isStreaming }: StreamAnalyticsProps) {
  const [peakViewers, setPeakViewers] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [engagementRate, setEngagementRate] = useState(0);
  const [streamQuality, setStreamQuality] = useState<'Good' | 'Fair' | 'Poor'>('Good');

  useEffect(() => {
    if (viewers > peakViewers) {
      setPeakViewers(viewers);
    }
  }, [viewers, peakViewers]);

  useEffect(() => {
    if (isStreaming) {
      // Simulate message updates
      const messageInterval = setInterval(() => {
        setTotalMessages(prev => prev + Math.floor(Math.random() * 3));
      }, 5000);

      // Calculate engagement rate
      const engagementInterval = setInterval(() => {
        if (viewers > 0) {
          const rate = Math.min(100, (totalMessages / viewers) * 10);
          setEngagementRate(rate);
        }
      }, 10000);

      return () => {
        clearInterval(messageInterval);
        clearInterval(engagementInterval);
      };
    }
  }, [isStreaming, viewers, totalMessages]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Good': return 'bg-success';
      case 'Fair': return 'bg-yellow-500';
      case 'Poor': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Stream Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Live Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Current Viewers</span>
              </div>
              <p className="text-2xl font-bold text-primary">{viewers}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Peak Viewers</span>
              </div>
              <p className="text-2xl font-bold text-accent">{peakViewers}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Stream Time</span>
              </div>
              <p className="text-lg font-semibold">{streamTime}</p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Chat Messages</span>
              </div>
              <p className="text-lg font-semibold">{totalMessages}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement & Quality */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Stream Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Engagement Rate</span>
              <span className="text-sm font-medium">{engagementRate.toFixed(1)}%</span>
            </div>
            <Progress value={engagementRate} className="h-2" />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Stream Quality</span>
            <Badge className={`${getQualityColor(streamQuality)} text-white`}>
              {streamQuality}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <div className="text-center">
              <Eye className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Views</p>
              <p className="text-sm font-semibold">{viewers * 3}</p>
            </div>
            
            <div className="text-center">
              <Heart className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Likes</p>
              <p className="text-sm font-semibold">{Math.floor(viewers * 0.7)}</p>
            </div>
            
            <div className="text-center">
              <Share2 className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-xs text-muted-foreground">Shares</p>
              <p className="text-sm font-semibold">{Math.floor(viewers * 0.2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}