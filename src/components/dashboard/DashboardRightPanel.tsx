import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StreamAnalytics } from "@/components/StreamAnalytics";
import { RealtimeDashboard } from "@/components/dashboard/RealtimeDashboard";
import { AIChatAnalysis } from "@/components/ai/AIChatAnalysis";
import { AIHighlights } from "@/components/ai/AIHighlights";
import { LiquidGlassCard, LiquidGlassBadge } from "@/components/ui/liquid-glass-card";
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Sparkles,
  Brain,
  Zap,
  TrendingUp,
  Layers
} from "lucide-react";

export function DashboardRightPanel() {
  const isStreaming = true;
  const viewers = 1247;
  const streamTime = "2:34:12";
  const platform = "twitch";
  const streamId = "stream_" + Date.now();

  const chatMessages = [
    { username: "StreamFan123", message: "Great stream!", timestamp: "2:34:10" },
    { username: "GamerPro", message: "How did you do that move?", timestamp: "2:34:08" },
    { username: "ChatBot", message: "Welcome to the stream!", timestamp: "2:34:05" },
    { username: "NewViewer", message: "First time watching, love it!", timestamp: "2:34:02" },
    { username: "RegularViewer", message: "Been watching for months, keep it up!", timestamp: "2:33:58" },
  ];

  const audioLevels = Array.from({ length: 120 }, () => Math.floor(Math.random() * 100));
  
  const streamData = {
    id: streamId,
    duration: streamTime,
    viewers: viewers,
    category: "Gaming"
  };

  const scenes = ["Main Scene", "BRB Screen", "Chat Only", "Full Screen"];
  const sources = ["Webcam", "Game Capture", "Overlay", "Chat Widget"];

  return (
    <div className="h-full">
      <ScrollArea className="h-[calc(100vh-2rem)]">
        <div className="space-y-4 p-4">
          {/* Real-time Dashboard */}
          <RealtimeDashboard 
            streamId={streamId}
            platform={platform}
            viewers={viewers}
            duration={streamTime}
            isStreaming={isStreaming}
          />

          {/* AI Chat Analysis */}
          <AIChatAnalysis 
            messages={chatMessages}
            streamId={streamId}
            platform={platform}
            autoAnalyze={true}
          />

          {/* AI Highlights */}
          <AIHighlights 
            streamData={streamData}
            chatMessages={chatMessages}
            audioLevels={audioLevels}
          />

          {/* Stream Analytics */}
          <StreamAnalytics 
            viewers={viewers}
            streamTime={streamTime}
            isStreaming={isStreaming}
          />

          {/* Scene Management */}
          <LiquidGlassCard variant="panel" className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-white text-sm">Scenes</h3>
            </div>
            <div className="space-y-2">
              {scenes.map((scene, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg liquid-glass-panel hover:bg-white/10 transition-colors">
                  <span className="text-sm text-white">{scene}</span>
                  <Button size="sm" variant={index === 0 ? "default" : "ghost"} className="h-6 px-2 text-xs">
                    {index === 0 ? "Active" : "Switch"}
                  </Button>
                </div>
              ))}
            </div>
          </LiquidGlassCard>

          {/* Sources */}
          <LiquidGlassCard variant="panel" className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-white text-sm">Sources</h3>
            </div>
            <div className="space-y-2">
              {sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg liquid-glass-panel">
                  <span className="text-sm text-white">{source}</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-white/60">Active</span>
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlassCard>

          {/* AI Features */}
          <LiquidGlassCard variant="glow-primary" className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-white text-sm">AI Features</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-accent" />
                  <span className="text-sm text-white">Auto Highlights</span>
                </div>
                <LiquidGlassBadge className="text-xs">Active</LiquidGlassBadge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3 w-3 text-accent" />
                  <span className="text-sm text-white">Chat Analysis</span>
                </div>
                <LiquidGlassBadge className="text-xs">Running</LiquidGlassBadge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-3 w-3 text-accent" />
                  <span className="text-sm text-white">Smart Scheduling</span>
                </div>
                <LiquidGlassBadge className="text-xs bg-transparent border border-white/20">Coming Soon</LiquidGlassBadge>
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      </ScrollArea>
    </div>
  );
}
