import { useEffect, useState } from "react";
import { Mic, MicOff, Volume2, VolumeX, ChevronDown, ChevronUp, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useHyvoAgent } from "@/hooks/useHyvoAgent";
import { useHyvoBackground } from "@/hooks/useHyvoBackground";
import { HyvoEventRow, HyvoStatus } from "@/lib/hyvo/types";

const STATUS_COPY: Record<HyvoStatus, { label: string; dot: string }> = {
  off: { label: "Asleep", dot: "bg-white/30" },
  idle: { label: "Standing by", dot: "bg-cyan-400" },
  listening: { label: "Listening", dot: "bg-emerald-400 animate-pulse" },
  thinking: { label: "Thinking", dot: "bg-primary animate-pulse" },
  speaking: { label: "Speaking", dot: "bg-cyan-300 animate-pulse" },
};

/**
 * Persistent Hyvo co-pilot dock: mic state, live transcript, last reply and a
 * feed of everything the agent did in the background.
 */
export function HyvoDock() {
  const agent = useHyvoAgent();
  const { settings, update } = agent;
  useHyvoBackground({ enabled: settings.autonomy !== "off", speak: agent.speak, settings });

  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<HyvoEventRow[]>([]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("hyvo_agent_events")
        .select("id, kind, summary, detail, created_at")
        .order("created_at", { ascending: false })
        .limit(25);
      if (active && data) setEvents(data as unknown as HyvoEventRow[]);
    })();
    return () => { active = false; };
  }, [open]);

  useEffect(() => {
    const channel = supabase
      .channel("hyvo-agent-events")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "hyvo_agent_events" }, (payload) => {
        setEvents((prev) => [payload.new as unknown as HyvoEventRow, ...prev].slice(0, 25));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const s = STATUS_COPY[agent.status];

  return (
    <div className="fixed bottom-4 right-4 z-40 w-[340px] max-w-[calc(100vw-2rem)]">
      <div className="liquid-glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-display font-semibold leading-none">Hyvo</p>
            <p className="text-xs text-white/50 mt-1 truncate">{s.label}</p>
          </div>

          <Button
            size="icon" variant="ghost"
            className="h-8 w-8 text-white/70 hover:text-white"
            aria-label={settings.voice_enabled ? "Mute Hyvo's voice" : "Unmute Hyvo's voice"}
            onClick={() => { agent.stopVoice(); void update({ voice_enabled: !settings.voice_enabled }); }}
          >
            {settings.voice_enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          <Button
            size="icon"
            variant={agent.micActive ? "default" : "ghost"}
            className="h-8 w-8"
            aria-label={agent.micActive ? "Stop listening" : "Start listening"}
            onClick={agent.toggleListening}
            disabled={!agent.supported}
          >
            {agent.micActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>

          <Button
            size="icon" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white"
            aria-label={open ? "Collapse Hyvo" : "Expand Hyvo"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>

        {!agent.supported && (
          <p className="px-4 pb-3 text-xs text-amber-300/80">
            Voice input isn't supported in this browser — use Chrome or the desktop app.
          </p>
        )}

        {(agent.transcript || agent.lastReply) && (
          <div className="px-4 pb-3 space-y-1.5">
            {agent.transcript && <p className="text-xs text-white/45 truncate">“{agent.transcript}”</p>}
            {agent.lastReply && <p className="text-sm text-white/90">{agent.lastReply}</p>}
          </div>
        )}

        {open && (
          <div className="border-t border-white/10 max-h-72 overflow-auto">
            <div className="flex items-center gap-2 px-4 py-2 text-xs text-white/50">
              <Activity className="h-3.5 w-3.5" /> Activity
              <Badge variant="outline" className="ml-auto text-[10px] capitalize border-white/15 text-white/60">
                {settings.autonomy}
              </Badge>
            </div>
            {events.length === 0 ? (
              <p className="px-4 pb-4 text-xs text-white/40">Nothing yet. Say “{settings.wake_word}, clip that.”</p>
            ) : (
              <ul className="pb-2">
                {events.map((e) => (
                  <li key={e.id} className="px-4 py-2 hover:bg-white/5">
                    <p className="text-xs text-white/85">{e.summary}</p>
                    <p className="text-[10px] text-white/40 mt-0.5 uppercase tracking-wide">
                      {e.kind} · {new Date(e.created_at).toLocaleTimeString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
