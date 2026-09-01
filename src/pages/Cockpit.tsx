import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Cpu } from "lucide-react";
import { Seo } from "@/components/Seo";
import { CoreOrb } from "@/components/cockpit/CoreOrb";
import { SystemRail } from "@/components/cockpit/SystemRail";
import { LiveRail } from "@/components/cockpit/LiveRail";
import { PlatformNodes } from "@/components/cockpit/PlatformNodes";
import { CommandRow } from "@/components/cockpit/CommandRow";
import { BootSequence } from "@/components/cockpit/BootSequence";
import { useHyvoAgent } from "@/hooks/useHyvoAgent";
import { useRealPlatformStats } from "@/hooks/useRealPlatformStats";
import { usePlatformOAuth } from "@/hooks/usePlatformOAuth";
import { useVersionCheck } from "@/hooks/useVersionCheck";
import { executeHyvoAction } from "@/lib/hyvo/actions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BOOT_KEY = "hyvo-cockpit-booted";

/** Desktop-only JARVIS command center. Every readout is wired to real data. */
export default function Cockpit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booting, setBooting] = useState(() => sessionStorage.getItem(BOOT_KEY) !== "1");
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const { status, micActive, toggleListening, supported } = useHyvoAgent();
  const { twitchStats, youtubeStats, startPolling, stopPolling } = useRealPlatformStats();
  const { twitchConnection, youtubeConnection } = usePlatformOAuth();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    const platforms: ("twitch" | "youtube")[] = [];
    if (twitchConnection?.isConnected) platforms.push("twitch");
    if (youtubeConnection?.isConnected) platforms.push("youtube");
    if (platforms.length) startPolling(platforms, 30_000);
    return () => stopPolling();
  }, [twitchConnection?.isConnected, youtubeConnection?.isConnected, startPolling, stopPolling]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setParallax({
        x: (e.clientX / window.innerWidth - 0.5) * 14,
        y: (e.clientY / window.innerHeight - 0.5) * 14,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const live = useMemo(() => {
    const t = twitchStats;
    const y = youtubeStats;
    return {
      isLive: Boolean(t?.isLive || y?.isLive),
      viewers: (t?.viewers ?? 0) + (y?.viewers ?? 0),
      followers: (t?.followers ?? 0) + (y?.followers ?? 0),
      title: t?.title || y?.title || "",
    };
  }, [twitchStats, youtubeStats]);

  const run = useCallback(
    async (action: "go_live" | "end_stream" | "clip") => {
      if (!userId) {
        toast({ title: "Sign in required", variant: "destructive" });
        return;
      }
      setBusy(true);
      try {
        const res = await executeHyvoAction(
          { action, parameters: action === "clip" ? { label: "Cockpit clip" } : {}, speak: "" } as never,
          { userId, streamId: null },
        );
        toast({ title: res.speak, variant: res.ok ? "default" : "destructive" });
      } finally {
        setBusy(false);
      }
    },
    [userId, toast],
  );

  const finishBoot = useCallback(() => {
    sessionStorage.setItem(BOOT_KEY, "1");
    setBooting(false);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <Seo title="Hyvo Command Center" description="The Hyvo desktop cockpit — live stream telemetry, platform links and voice control in one screen." path="/cockpit" />

      <AnimatePresence>{booting && <BootSequence onDone={finishBoot} />}</AnimatePresence>

      {/* Ambient mesh */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(var(--neon-cyan)/0.12),transparent_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.25)_1px,transparent_1px)] [background-size:56px_56px] opacity-30" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-5 py-8">
        <header className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span className="inline-flex items-center gap-2 text-[hsl(var(--neon-cyan))]">
            <ShieldCheck className="h-3.5 w-3.5" /> Status: Secure
          </span>
          <span>Hyvo-AI protocol active</span>
        </header>

        <div className="grid flex-1 items-center gap-6 lg:grid-cols-[260px_1fr_260px]">
          <motion.div style={{ x: parallax.x * -0.4, y: parallax.y * -0.4 }}>
            <SystemRail />
          </motion.div>

          <motion.div style={{ x: parallax.x, y: parallax.y }} className="flex flex-col items-center gap-5">
            <CoreOrb status={status} micActive={micActive} onToggle={toggleListening} disabled={!supported} />
            {!supported && (
              <p className="text-xs text-muted-foreground">Voice control needs a Chromium-based desktop build.</p>
            )}
            <PlatformNodes
              twitchConnected={Boolean(twitchConnection?.isConnected)}
              youtubeConnected={Boolean(youtubeConnection?.isConnected)}
            />
          </motion.div>

          <motion.div style={{ x: parallax.x * -0.4, y: parallax.y * -0.4 }}>
            <LiveRail isLive={live.isLive} viewers={live.viewers} followers={live.followers} title={live.title} />
          </motion.div>
        </div>

        <CommandRow
          isLive={live.isLive}
          micActive={micActive}
          busy={busy}
          onGoLive={() => run(live.isLive ? "end_stream" : "go_live")}
          onTalk={toggleListening}
          onClip={() => run("clip")}
          onStudio={() => navigate("/studio")}
          onDashboard={() => navigate("/dashboard")}
        />
      </div>
    </div>
  );
}
