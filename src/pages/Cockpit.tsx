import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Cpu } from "lucide-react";
import { Seo } from "@/components/Seo";
import { CoreOrb } from "@/components/cockpit/CoreOrb";
import { SystemRail } from "@/components/cockpit/SystemRail";
import { LiveRail } from "@/components/cockpit/LiveRail";
import { PlatformNodes } from "@/components/cockpit/PlatformNodes";
import { CommandRow, type CommandId } from "@/components/cockpit/CommandRow";
import { CommandConsole, type ConsoleResult } from "@/components/cockpit/CommandConsole";
import { DestinationsDialog } from "@/components/cockpit/DestinationsDialog";
import { BootSequence } from "@/components/cockpit/BootSequence";
import { useHyvoAgent } from "@/hooks/useHyvoAgent";
import { useRealPlatformStats } from "@/hooks/useRealPlatformStats";
import { usePlatformOAuth } from "@/hooks/usePlatformOAuth";
import { useVersionCheck } from "@/hooks/useVersionCheck";
import { executeHyvoAction } from "@/lib/hyvo/actions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BOOT_KEY = "hyvo-cockpit-booted";

const LABELS: Record<string, string> = {
  titles: "Title ideas",
  icebreakers: "Break the silence",
  commands: "Chat commands",
  social: "Go-live post",
  live: "Broadcast control",
  clip: "Clip that",
};

/** Desktop-only JARVIS command center. Every readout is wired to real data. */
export default function Cockpit() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [booting, setBooting] = useState(() => sessionStorage.getItem(BOOT_KEY) !== "1");
  const [busy, setBusy] = useState<CommandId | null>(null);
  const [result, setResult] = useState<ConsoleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [destOpen, setDestOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const { status, micActive, toggleListening, supported } = useHyvoAgent();
  const { twitchStats, youtubeStats, startPolling, stopPolling } = useRealPlatformStats();
  const { twitchConnection, youtubeConnection } = usePlatformOAuth();
  const { currentVersion, isDesktop } = useVersionCheck();

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
      game: (t as { game?: string } | null)?.game || "",
    };
  }, [twitchStats, youtubeStats]);

  const runAction = useCallback(
    async (action: "go_live" | "end_stream" | "clip", id: CommandId) => {
      if (!userId) {
        setError("Sign in required to control your broadcast.");
        return;
      }
      const res = await executeHyvoAction(
        { action, parameters: action === "clip" ? { label: "Cockpit clip" } : {}, speak: "" } as never,
        { userId, streamId: null },
      );
      toast({ title: res.speak, variant: res.ok ? "default" : "destructive" });
      if (!res.ok) {
        setError(res.speak || "Command failed.");
        return;
      }
      setResult({ title: LABELS[id] ?? "Done", items: [{ text: res.speak || "Done." }] });
    },
    [userId, toast],
  );

  const runCopilot = useCallback(
    async (mode: "icebreakers" | "commands" | "social") => {
      const { data, error: fnError } = await supabase.functions.invoke("stream-copilot", {
        body: {
          mode,
          streamTitle: live.title || undefined,
          game: live.game || undefined,
          audience: live.viewers ? `${live.viewers} live viewers` : undefined,
        },
      });
      if (fnError) throw new Error(fnError.message || "Copilot unavailable.");
      if (data?.error) throw new Error(data.error);

      if (mode === "icebreakers") {
        const items = (data?.icebreakers ?? []).map((i: { text: string; tag?: string }) => ({
          text: i.text,
          tag: i.tag,
        }));
        return { title: LABELS.icebreakers, items };
      }
      if (mode === "commands") {
        const items = (data?.commands ?? []).map((c: { trigger: string; response: string; mood?: string }) => ({
          text: `${c.trigger} → ${c.response}`,
          tag: c.mood,
        }));
        return { title: LABELS.commands, items };
      }
      const items = [
        data?.twitter && { text: data.twitter as string, tag: "X" },
        data?.discord && { text: data.discord as string, tag: "Discord" },
        Array.isArray(data?.hashtags) && data.hashtags.length && {
          text: (data.hashtags as string[]).join(" "),
          tag: "Tags",
        },
      ].filter(Boolean) as { text: string; tag?: string }[];
      return { title: LABELS.social, items };
    },
    [live.title, live.game, live.viewers],
  );

  const runTitles = useCallback(async () => {
    const { data, error: fnError } = await supabase.functions.invoke("ai-title-generator", {
      body: {
        game: live.game || live.title || "Live stream",
        theme: live.title || "engaging gameplay",
        targetAudience: "gaming enthusiasts",
      },
    });
    if (fnError) throw new Error(fnError.message || "Title generator unavailable.");
    if (data?.error) throw new Error(data.error);
    const items = ((data?.titles ?? []) as string[]).map((t) => ({ text: t }));
    return { title: LABELS.titles, items };
  }, [live.game, live.title]);

  const onRun = useCallback(
    async (id: CommandId) => {
      if (busy) return;

      if (id === "talk") return toggleListening();
      if (id === "studio") return navigate("/studio");
      if (id === "dash") return navigate("/dashboard");
      if (id === "destinations") return setDestOpen(true);

      setBusy(id);
      setError(null);
      setResult(null);
      try {
        if (id === "live") {
          await runAction(live.isLive ? "end_stream" : "go_live", id);
        } else if (id === "clip") {
          await runAction("clip", id);
        } else if (id === "titles") {
          setResult(await runTitles());
        } else {
          setResult(await runCopilot(id as "icebreakers" | "commands" | "social"));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Command failed.";
        setError(message);
        toast({ title: message, variant: "destructive" });
      } finally {
        setBusy(null);
      }
    },
    [busy, live.isLive, navigate, runAction, runCopilot, runTitles, toggleListening, toast],
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
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border/50 bg-background/40">
            <Cpu className="h-3 w-3 text-[hsl(var(--neon-cyan))]" />
            Build <span className="text-foreground">v{currentVersion}</span>
            <span className="hidden sm:inline text-muted-foreground/70">· {isDesktop ? "Desktop" : "Web"}</span>
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
              onOpenDestinations={() => setDestOpen(true)}
            />
          </motion.div>

          <motion.div style={{ x: parallax.x * -0.4, y: parallax.y * -0.4 }}>
            <LiveRail isLive={live.isLive} viewers={live.viewers} followers={live.followers} title={live.title} />
          </motion.div>
        </div>

        <CommandRow isLive={live.isLive} micActive={micActive} busy={busy} onRun={onRun} />

        <CommandConsole
          running={busy ? LABELS[busy] ?? null : null}
          result={result}
          error={error}
          onClear={() => {
            setResult(null);
            setError(null);
          }}
        />
      </div>

      <DestinationsDialog open={destOpen} onOpenChange={setDestOpen} />
    </div>
  );
}
