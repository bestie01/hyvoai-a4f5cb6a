import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Eye, MessageSquare, Radio, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface LiveRailProps {
  isLive: boolean;
  viewers: number;
  followers: number;
  title: string;
}

interface ChatPing { id: string; user: string; text: string }

/** Live broadcast readouts + a realtime chat pulse from connected platforms. */
export function LiveRail({ isLive, viewers, followers, title }: LiveRailProps) {
  const [pings, setPings] = useState<ChatPing[]>([]);
  const [chatTimes, setChatTimes] = useState<number[]>([]);
  const [now, setNow] = useState(Date.now());
  const baseFollowers = useRef<{ t: number; v: number }[]>([]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!followers) return;
    const t = Date.now();
    baseFollowers.current = [...baseFollowers.current.filter((x) => t - x.t < 10 * 60_000), { t, v: followers }];
  }, [followers]);

  const recent = baseFollowers.current;
  const followerDelta = recent.length > 1 ? followers - recent[0].v : 0;
  const spike = followerDelta >= 5;
  const chatPerMin = chatTimes.filter((t) => now - t < 60_000).length;

  useEffect(() => {
    const channel = supabase
      .channel("cockpit-chat-pulse")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
        const row = payload.new as Record<string, unknown>;
        setPings((prev) => [
          { id: String(row.id ?? Date.now()), user: String(row.username ?? "viewer"), text: String(row.message ?? "") },
          ...prev,
        ].slice(0, 6));
        setChatTimes((prev) => [...prev.filter((t) => Date.now() - t < 60_000), Date.now()]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="liquid-glass-panel rounded-2xl border border-border/40 p-4 space-y-4">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        <Radio className="h-3.5 w-3.5 text-[hsl(var(--neon-cyan))]" /> Broadcast
      </div>

      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/40"}`} />
        <span className="text-sm font-medium">{isLive ? "On air" : "Offline"}</span>
      </div>

      {title && <p className="text-xs text-muted-foreground line-clamp-2">{title}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/40 bg-background/30 p-3">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            <Eye className="h-3 w-3" /> Viewers
          </p>
          <p className="font-mono text-lg tabular-nums">{isLive ? viewers.toLocaleString() : "—"}</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-background/30 p-3">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            <Users className="h-3 w-3" /> Followers
          </p>
          <p className="font-mono text-lg tabular-nums">{followers ? followers.toLocaleString() : "—"}</p>
          {followerDelta > 0 && (
            <p className={`flex items-center gap-1 text-[10px] ${spike ? "text-success font-semibold" : "text-muted-foreground"}`}>
              <TrendingUp className="h-3 w-3" /> +{followerDelta} in 10m{spike ? " · spike" : ""}
            </p>
          )}
        </div>
        <div className="col-span-2 rounded-xl border border-border/40 bg-background/30 p-3">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            <MessageSquare className="h-3 w-3" /> Chat activity
          </p>
          <p className="font-mono text-lg tabular-nums">{chatPerMin} <span className="text-xs text-muted-foreground">msgs / min</span></p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <MessageSquare className="h-3.5 w-3.5" /> Chat pulse
        </p>
        {pings.length === 0 ? (
          <p className="text-xs text-muted-foreground/70">Quiet. Messages appear here the moment chat moves.</p>
        ) : (
          <ul className="space-y-1.5">
            {pings.map((p) => (
              <li key={p.id} className="text-xs">
                <span className="text-[hsl(var(--neon-cyan))]">{p.user}</span>{" "}
                <span className="text-muted-foreground">{p.text.slice(0, 60)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
