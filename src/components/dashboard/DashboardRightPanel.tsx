import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StreamAnalytics } from "@/components/StreamAnalytics";
import { RealtimeDashboard } from "@/components/dashboard/RealtimeDashboard";
import { AIChatAnalysis } from "@/components/ai/AIChatAnalysis";
import { AIHighlights } from "@/components/ai/AIHighlights";
import { 
  MessageSquare, 
  Users, 
  Settings, 
  Sparkles,
  Brain,
  Zap,
  TrendingUp
} from "lucide-react";

export function DashboardRightPanel() {
  // Mock data - in a real app, this would come from your state management
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
    { username: "ExcitedFan", message: "POGGERS! That was amazing!", timestamp: "2:33:55" },
    { username: "CasualViewer", message: "What game is this?", timestamp: "2:33:50" },
    { username: "SuperFan", message: "You're the best streamer ever!", timestamp: "2:33:45" },
    { username: "GameExpert", message: "Try using the special combo here", timestamp: "2:33:40" },
    { username: "LongTimeViewer", message: "I've been following since day one!", timestamp: "2:33:35" },
  ];

  // Mock audio levels for AI highlight detection
  const audioLevels = Array.from({ length: 120 }, () => Math.floor(Math.random() * 100));
  
  const streamData = {
    id: streamId,
    duration: streamTime,
    viewers: viewers,
    category: "Gaming"
  };

  return (
    <div className="h-full">
      <ScrollArea className="h-[calc(100vh-2rem)]">
        <div className="space-y-6 p-6">
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

          {/* Traditional Stream Analytics */}
          <StreamAnalytics 
            viewers={viewers}
            streamTime={streamTime}
            isStreaming={isStreaming}
          />

          {/* Scene Management */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Settings className="h-5 w-5 text-primary" />
                Scenes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["Main Scene", "BRB Screen", "Chat Only", "Full Screen"].map((scene, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/20 hover:bg-muted/30 transition-colors">
                    <span className="text-sm text-foreground">{scene}</span>
                    <Button size="sm" variant={index === 0 ? "default" : "ghost"} className="h-6 px-2">
                      {index === 0 ? "Active" : "Switch"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sources */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Zap className="h-5 w-5 text-primary" />
                Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["Webcam", "Game Capture", "Overlay", "Chat Widget"].map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/20">
                    <span className="text-sm text-foreground">{source}</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-xs text-muted-foreground">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Brain className="h-5 w-5 text-primary" />
                AI Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <span className="text-sm text-foreground">Auto Highlights</span>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-accent" />
                    <span className="text-sm text-foreground">Chat Analysis</span>
                  </div>
                  <Badge variant="secondary">Running</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <span className="text-sm text-foreground">Smart Scheduling</span>
                  </div>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}