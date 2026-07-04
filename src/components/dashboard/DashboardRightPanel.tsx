import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StreamAnalytics } from "@/components/StreamAnalytics";
import { RealtimeDashboard } from "@/components/dashboard/RealtimeDashboard";
import { AIChatAnalysis } from "@/components/ai/AIChatAnalysis";
import { AIHighlights } from "@/components/ai/AIHighlights";
import { LiquidGlassCard, LiquidGlassBadge } from "@/components/ui/liquid-glass-card";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare, Sparkles, Brain, Zap, TrendingUp, Layers, Radio,
} from "lucide-react";

interface RtChat { username: string; message: string; timestamp: string }
interface StreamRow { id: number | string; is_live: boolean; created_at: string }

function useLiveStream() {
  const [stream, setStream] = useState<StreamRow | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("streams")
        .select("id, is_live, created_at")
        .eq("user_id", user.id)
        .eq("is_live", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (mounted) setStream((data as unknown as StreamRow) ?? null);

      const channel = supabase
        .channel(`streams-user-${user.id}`)
        .on("postgres_changes",
          { event: "*", schema: "public", table: "streams", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const row = ((payload.new ?? payload.old) as unknown) as StreamRow;
            if (row?.is_live) setStream(row);
            else if (stream?.id === row?.id) setStream(null);
          },
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return stream;
}

function useLiveChat(streamId: string | null) {
  const [messages, setMessages] = useState<RtChat[]>([]);
  useEffect(() => {
    if (!streamId) { setMessages([]); return; }
    const channel = supabase
      .channel(`chat-${streamId}`)
      .on("broadcast", { event: "chat" }, ({ payload }) => {
        setMessages((prev) => [
          ...prev.slice(-49),
          { username: payload.username, message: payload.message, timestamp: new Date().toLocaleTimeString() },
        ]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [streamId]);
  return messages;
}

export function DashboardRightPanel() {
  const stream = useLiveStream();
  const isStreaming = !!stream?.is_live;
  const streamId = String(stream?.id ?? "preview");
  const platform = "twitch";

  const [viewers, setViewers] = useState(0);
  const [streamTime, setStreamTime] = useState("0:00:00");

  useEffect(() => {
    if (!stream) { setStreamTime("0:00:00"); setViewers(0); return; }
    const start = new Date(stream.created_at).getTime();
    const tick = () => {
      const s = Math.max(0, Math.floor((Date.now() - start) / 1000));
      const h = String(Math.floor(s / 3600)).padStart(1, "0");
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
      const sec = String(s % 60).padStart(2, "0");
      setStreamTime(`${h}:${m}:${sec}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [stream]);

  useEffect(() => {
    if (!isStreaming) return;
    const channel = supabase
      .channel(`stats-${streamId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "stream_analytics", filter: `stream_id=eq.${streamId}` },
        (payload) => {
          const row: any = payload.new;
          if (typeof row?.viewer_count === "number") setViewers(row.viewer_count);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isStreaming, streamId]);

  const chatMessages = useLiveChat(isStreaming ? streamId : null);
  const audioLevels = Array.from({ length: 120 }, () => Math.floor(Math.random() * 100));
  const streamData = { id: streamId, duration: streamTime, viewers, category: "Gaming" };

  const scenes = ["Main Scene", "BRB Screen", "Chat Only", "Full Screen"];
  const sources = ["Webcam", "Game Capture", "Overlay", "Chat Widget"];

  return (
    <div className="h-full">
      <ScrollArea className="h-[calc(100vh-2rem)]">
        <div className="space-y-4 p-4">
          <LiquidGlassCard variant="panel" className="p-3 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isStreaming ? "bg-destructive animate-pulse" : "bg-white/30"}`} />
            <div className="flex-1">
              <div className="text-xs text-white/60">Broadcast</div>
              <div className="text-sm text-white font-medium">
                {isStreaming ? `Live · ${streamTime}` : "Offline"}
              </div>
            </div>
            <Radio className={`h-4 w-4 ${isStreaming ? "text-destructive" : "text-white/30"}`} />
          </LiquidGlassCard>

          <RealtimeDashboard
            streamId={streamId}
            platform={platform}
            viewers={viewers}
            duration={streamTime}
            isStreaming={isStreaming}
          />

          <AIChatAnalysis
            messages={chatMessages}
            streamId={streamId}
            platform={platform}
            autoAnalyze={isStreaming && chatMessages.length > 3}
          />

          <AIHighlights streamData={streamData} chatMessages={chatMessages} audioLevels={audioLevels} />

          <StreamAnalytics viewers={viewers} streamTime={streamTime} isStreaming={isStreaming} />

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
                    <div className={`w-2 h-2 rounded-full ${isStreaming ? "bg-emerald-500 animate-pulse" : "bg-white/20"}`} />
                    <span className="text-xs text-white/60">{isStreaming ? "Live" : "Idle"}</span>
                  </div>
                </div>
              ))}
            </div>
          </LiquidGlassCard>

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
                <LiquidGlassBadge className="text-xs">{isStreaming ? "Active" : "Idle"}</LiquidGlassBadge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3 w-3 text-accent" />
                  <span className="text-sm text-white">Chat Analysis</span>
                </div>
                <LiquidGlassBadge className="text-xs">{isStreaming ? "Running" : "Idle"}</LiquidGlassBadge>
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
