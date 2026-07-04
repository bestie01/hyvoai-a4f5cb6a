import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Radio, CheckCircle2, Loader2, Twitch, Youtube, PlugZap, AlertTriangle, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel } from "@/components/ui/glass-panel";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePlatformOAuth } from "@/hooks/usePlatformOAuth";

type PlatformResult = { platform: string; ready: boolean; username?: string; error?: string };

export function GoLivePanel() {
  const { toast } = useToast();
  const { twitchConnection, youtubeConnection, connectTwitch, connectYouTube, refreshConnections } = usePlatformOAuth();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "provisioning" | "ready" | "live">("idle");
  const [results, setResults] = useState<PlatformResult[]>([]);
  const [streamId, setStreamId] = useState<string | null>(null);

  useEffect(() => { refreshConnections(); }, [refreshConnections]);

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
      toast({ title: "Stream ended" });
    } catch (err: any) {
      toast({ title: "Failed to end", description: err.message, variant: "destructive" });
    }
  };

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
        {status === "live" && (
          <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border border-destructive/40 text-destructive bg-destructive/10 animate-pulse">
            Live
          </span>
        )}
      </div>

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
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Ranked grind — road to Diamond"
          className="bg-white/[0.04] border-white/10"
          disabled={status === "provisioning" || status === "live"}
        />
      </div>

      {results.length > 0 && (
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

      {status !== "live" ? (
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
      ) : (
        <Button onClick={endLive} variant="destructive" className="w-full rounded-xl">
          <Square className="w-4 h-4 mr-2" /> End stream
        </Button>
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
