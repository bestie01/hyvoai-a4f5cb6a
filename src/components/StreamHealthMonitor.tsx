import { useState, useEffect } from "react";
import { Activity, Wifi, Cpu, HardDrive, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface HealthMetrics {
  bitrate: number;
  fps: number;
  droppedFrames: number;
  networkLatency: number;
  cpuUsage: number;
  memoryUsage: number;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export function StreamHealthMonitor() {
  const [metrics, setMetrics] = useState<HealthMetrics>({
    bitrate: 0,
    fps: 0,
    droppedFrames: 0,
    networkLatency: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    connectionQuality: 'good',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        bitrate: Math.floor(Math.random() * 1000) + 2000,
        fps: Math.floor(Math.random() * 5) + 55,
        droppedFrames: Math.floor(Math.random() * 10),
        networkLatency: Math.floor(Math.random() * 30) + 20,
        cpuUsage: Math.floor(Math.random() * 30) + 40,
        memoryUsage: Math.floor(Math.random() * 20) + 50,
        connectionQuality: ['excellent', 'good', 'fair'][Math.floor(Math.random() * 3)] as any,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-500/20 text-green-500';
      case 'good': return 'bg-blue-500/20 text-blue-500';
      case 'fair': return 'bg-yellow-500/20 text-yellow-500';
      case 'poor': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  return (
    <Card className="card-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stream Health</CardTitle>
            <CardDescription>Real-time streaming metrics</CardDescription>
          </div>
          <Badge className={getQualityColor(metrics.connectionQuality)}>
            <Activity className="h-3 w-3 mr-1" />
            {metrics.connectionQuality}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Bitrate</span>
            </div>
            <div className="text-lg font-semibold">{metrics.bitrate} kbps</div>
          </div>

          <div className="glass p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">FPS</span>
            </div>
            <div className="text-lg font-semibold">{metrics.fps}</div>
          </div>

          <div className="glass p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Dropped</span>
            </div>
            <div className="text-lg font-semibold">{metrics.droppedFrames}</div>
          </div>

          <div className="glass p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Wifi className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Latency</span>
            </div>
            <div className="text-lg font-semibold">{metrics.networkLatency}ms</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">CPU Usage</span>
              </div>
              <span className="text-sm font-medium">{metrics.cpuUsage}%</span>
            </div>
            <Progress value={metrics.cpuUsage} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Memory Usage</span>
              </div>
              <span className="text-sm font-medium">{metrics.memoryUsage}%</span>
            </div>
            <Progress value={metrics.memoryUsage} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}