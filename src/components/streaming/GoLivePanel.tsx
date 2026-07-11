import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Radio, CheckCircle2, Loader2, Twitch, Youtube, PlugZap, AlertTriangle,
  Square, Users, Timer, Megaphone, Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformOAuth } from "@/hooks/usePlatformOAuth";

type PlatformResult = { platform: string; ready: boolean; username?: string; error?: string };

function formatElapsed(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export function GoLivePanel() {
  const { toast } = useToast();
  const { twitchConnection, youtubeConnection, connectTwitch, connectYouTube, refreshConnections } = usePlatformOAuth();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "provisioning" | "ready" | "live">("idle");
  const [results, setResults] = useState<PlatformResult[]>([]);
  const [streamId, setStreamId] = useState<string | null>(null);
  const [viewers, setViewers] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<string>("0:00:00");
  const [updatingTitle, setUpdatingTitle] = useState(false);
  const tickRef = useRef<number | null>(null);

  useEffect(() => { refreshConnections(); }, [refreshConnections]);

  // Elapsed timer
  useEffect(() => {
    if (status !== "live" || !startedAt) {
      setElapsed("0:00:00");
      if (tickRef.current) window.clearInterval(tickRef.current);
      return;
    }
    const tick = () => setElapsed(formatElapsed(Date.now() - startedAt));
    tick();
    tickRef.current = window.setInterval(tick, 1000);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, [status, startedAt]);

  // Real-time viewer count via stream_analytics inserts
  useEffect(() => {
    if (status !== "live" || !streamId) return;
    const ch = supabase
      .channel(`golive-stats-${streamId}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "stream_analytics", filter: `stream_id=eq.${streamId}` },
        (payload) => {
          const row: any = payload.new;
          if (typeof row?.viewer_count === "number") setViewers(row.viewer_count);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [status, streamId]);

  const noConnections = !twitchConnection && !youtubeConnection;

  const goLive = async () => {
    if (noConnections) {
      toast({ title: "Connect a platform first", description: "Link Twitch or YouTube — no stream key needed." });
      return;
    }
    setStatus("provisioning");
    try {
      const { data: prov, error: pErr } = await supabase.functions.invoke("provision-stream", {
        body: { action: "provision", title: title || "Live on Hyvo" },
      });
      if (pErr) throw pErr;
      if (!prov?.ok) throw new Error(prov?.error || "Provision failed");
      setResults(prov.platforms);
      const anyReady = prov.platforms.some((p: PlatformResult) => p.ready);
      if (!anyReady) throw new Error(prov.platforms[0]?.error || "No platform ready");

      const { data: live, error: lErr } = await supabase.functions.invoke("provision-stream", {
        body: { action: "go_live" },
      });
      if (lErr) throw lErr;
      setStreamId(live.streamId);
      setStartedAt(Date.now());
      setStatus("live");
      toast({ title: "You're live 🔴", description: "Broadcast started on connected platforms." });
    } catch (err: any) {
      setStatus("idle");
      toast({ title: "Couldn't go live", description: err.message, variant: "destructive" });
    }
  };

  const endLive = async () => {
    try {
      await supabase.functions.invoke("provision-stream", { body: { action: "end_live" } });
      setStatus("idle");
      setStreamId(null);
      setStartedAt(null);
      setViewers(0);
      toast({ title: "Stream ended" });
    } catch (err: any) {
      toast({ title: "Failed to end", description: err.message, variant: "destructive" });
    }
  };

  const updateTitle = async () => {
    if (!title.trim()) return;
    setUpdatingTitle(true);
    try {
      const { error } = await supabase.functions.invoke("provision-stream", {
        body: { action: "update_title", title: title.trim() },
      });
      if (error) throw error;
      toast({ title: "Title updated on connected platforms" });
    } catch (err: any) {
      toast({ title: "Couldn't update title", description: err.message, variant: "destructive" });
    } finally {
      setUpdatingTitle(false);
    }
  };

  const announce = () => {
    // Open the Copilot's Social tab so the streamer can post "we're LIVE" hooks.
    window.dispatchEvent(new Event("hyvo:toggle-copilot"));
    toast({ title: "Copilot opened", description: "Use the Post tab to draft an announcement." });
  };

  const isLive = status === "live";

  return (
    <GlassPanel variant="raised" className="p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 grid place-items-center">
            <Radio className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="text-lg font-display font-semibold text-white">One-Click Go Live</div>
            <div className="text-xs text-white/50">Auto-provisioned via OAuth — no stream keys, ever.</div>
          </div>
        </div>
        {isLive && (
          <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border border-destructive/40 text-destructive bg-destructive/10 animate-pulse">
            Live
          </span>
        )}
      </div>

      {/* Live stats */}
      {isLive && (
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 flex items-center gap-3">
            <Users className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">Viewers</div>
              <div className="text-lg font-semibold text-white tabular-nums">{viewers.toLocaleString()}</div>
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 flex items-center gap-3">
            <Timer className="w-4 h-4 text-primary" />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-white/40">Elapsed</div>
              <div className="text-lg font-semibold text-white tabular-nums">{elapsed}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <PlatformChip
          icon={<Twitch className="w-4 h-4" />}
          label="Twitch"
          connected={!!twitchConnection}
          username={twitchConnection?.username ?? undefined}
          onConnect={connectTwitch}
        />
        <PlatformChip
          icon={<Youtube className="w-4 h-4" />}
          label="YouTube"
          connected={!!youtubeConnection}
          username={youtubeConnection?.username ?? undefined}
          onConnect={connectYouTube}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-white/60">Stream title</Label>
        <div className="flex gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Ranked grind — road to Diamond"
            className="bg-white/[0.04] border-white/10"
            disabled={status === "provisioning"}
          />
          {isLive && (
            <Button
              variant="outline"
              onClick={updateTitle}
              disabled={updatingTitle || !title.trim()}
              className="shrink-0 border-white/10"
              title="Push title update to connected platforms"
            >
              {updatingTitle ? <Loader2 className="w-4 h-4 animate-spin" /> : <Pencil className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      {results.length > 0 && !isLive && (
        <div className="space-y-1">
          {results.map((r) => (
            <div key={r.platform} className="flex items-center gap-2 text-xs">
              {r.ready ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />
              )}
              <span className="text-white/80 capitalize">{r.platform}</span>
              <span className="text-white/40">{r.ready ? (r.username ?? "provisioned") : r.error}</span>
            </div>
          ))}
        </div>
      )}

      {!isLive ? (
        <>
          {noConnections && (
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-center">
              <div className="text-sm text-white/80 font-medium mb-1">You're not live yet</div>
              <p className="text-xs text-white/50 mb-3">Connect Twitch or YouTube to go live in one click.</p>
              <div className="flex gap-2 justify-center">
                <Button size="sm" variant="outline" onClick={connectTwitch} className="border-white/10">
                  <Twitch className="w-3.5 h-3.5 mr-1.5" /> Twitch
                </Button>
                <Button size="sm" variant="outline" onClick={connectYouTube} className="border-white/10">
                  <Youtube className="w-3.5 h-3.5 mr-1.5" /> YouTube
                </Button>
              </div>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={goLive}
            disabled={status === "provisioning" || noConnections}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-primary to-[hsl(var(--neon-cyan))] text-white font-semibold shadow-[0_0_28px_-6px_hsl(var(--primary)/0.7)] hover:opacity-95 disabled:opacity-50 transition-all"
          >
            {status === "provisioning" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
            {status === "provisioning" ? "Provisioning…" : noConnections ? "Connect a platform to go live" : "Go Live"}
          </motion.button>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={announce} variant="outline" className="rounded-xl border-white/10">
            <Megaphone className="w-4 h-4 mr-2" /> Announce
          </Button>
          <Button onClick={endLive} variant="destructive" className="rounded-xl">
            <Square className="w-4 h-4 mr-2" /> End stream
          </Button>
        </div>
      )}

      <p className="text-[10px] text-white/40 text-center leading-relaxed">
        We fetch your ingest target from Twitch / YouTube using your OAuth session. Keys never touch your browser.
      </p>
    </GlassPanel>
  );
}

function PlatformChip({
  icon, label, connected, username, onConnect,
}: {
  icon: React.ReactNode; label: string; connected: boolean; username?: string; onConnect: () => void;
}) {
  return (
    <button
      onClick={connected ? undefined : onConnect}
      className={`text-left rounded-xl border p-3 transition-all ${
        connected
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-white/[0.04] border-white/10 hover:border-primary/40 hover:bg-white/[0.06]"
      }`}
    >
      <div className="flex items-center gap-2 text-white text-sm font-medium">
        {icon}
        {label}
        {connected ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto" />
        ) : (
          <PlugZap className="w-3.5 h-3.5 text-white/40 ml-auto" />
        )}
      </div>
      <div className="text-[11px] text-white/50 mt-1 truncate">
        {connected ? username ?? "Connected" : "Click to connect"}
      </div>
    </button>
  );
}
