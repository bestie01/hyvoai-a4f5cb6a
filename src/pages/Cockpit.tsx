import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, Cpu } from "lucide-react";
import { Seo } from "@/components/Seo";
import { HudFrame } from "@/components/cockpit/HudFrame";
import { CoreOrb } from "@/components/cockpit/CoreOrb";
import { VoiceStrip } from "@/components/cockpit/VoiceStrip";
import { SystemRail } from "@/components/cockpit/SystemRail";
import { LiveRail } from "@/components/cockpit/LiveRail";
import { PlatformNodes } from "@/components/cockpit/PlatformNodes";
import { CommandRow, type CommandId } from "@/components/cockpit/CommandRow";
import { CommandConsole, type ConsoleResult } from "@/components/cockpit/CommandConsole";
import { DestinationsDialog } from "@/components/cockpit/DestinationsDialog";
import { BootSequence } from "@/components/cockpit/BootSequence";
import { ActivityFeed } from "@/components/cockpit/ActivityFeed";
import { useHyvoAgent } from "@/hooks/useHyvoAgent";
import { useLiveChat } from "@/hooks/useLiveChat";
import { useRealPlatformStats } from "@/hooks/useRealPlatformStats";
import { usePlatformOAuth } from "@/hooks/usePlatformOAuth";
import { useStreamDestinations } from "@/hooks/useStreamDestinations";
import { useVersionCheck } from "@/hooks/useVersionCheck";
import { executeHyvoAction, logHyvoEvent } from "@/lib/hyvo/actions";
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
  sentiment: "Chat mood",
  growth: "What should I do next",
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

  const {
    status, micActive, toggleListening, supported,
    transcript, lastReply, ask, settings,
  } = useHyvoAgent();
  const { messages: chatMessages } = useLiveChat();
  const { twitchStats, youtubeStats, startPolling, stopPolling } = useRealPlatformStats();
  const { twitchConnection, youtubeConnection } = usePlatformOAuth();
  const { destinations } = useStreamDestinations();
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

  // Subtle parallax — paused while the mic is hot so the HUD stays readable.
  useEffect(() => {
    if (micActive) {
      setParallax({ x: 0, y: 0 });
      return;
    }
    const onMove = (e: MouseEvent) => {
      setParallax({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [micActive]);

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

  /** Pre-flight: how many destinations can actually receive the broadcast. */
  const readiness = useMemo(() => {
    const ids = new Set<string>();
    destinations.forEach((d) => {
      if (d.is_enabled && d.stream_key) ids.add(d.platform);
    });
    if (twitchConnection?.isConnected) ids.add("twitch");
    if (youtubeConnection?.isConnected) ids.add("youtube");
    const configured = new Set<string>(destinations.map((d) => d.platform));
    if (twitchConnection?.isConnected) configured.add("twitch");
    if (youtubeConnection?.isConnected) configured.add("youtube");
    return { ready: ids.size, total: configured.size };
  }, [destinations, twitchConnection?.isConnected, youtubeConnection?.isConnected]);

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

  const runSentiment = useCallback(async () => {
    const recent = chatMessages.slice(-60).map((m) => ({ username: m.username, message: m.message }));
    if (recent.length === 0) throw new Error("No chat captured yet — connect a platform and wait for messages.");
    const { data, error: fnError } = await supabase.functions.invoke("ai-chat-analysis", {
      body: { messages: recent },
    });
    if (fnError) throw new Error(fnError.message || "Chat analysis unavailable.");
    if (data?.error) throw new Error(data.error);
    const a = (data?.analysis ?? data) as Record<string, unknown>;
    const items = Object.entries(a)
      .filter(([, v]) => typeof v === "string" || typeof v === "number")
      .map(([k, v]) => ({ tag: k.replace(/_/g, " "), text: String(v) }));
    return { title: LABELS.sentiment, items: items.length ? items : [{ text: "Chat looks steady — nothing notable." }] };
  }, [chatMessages]);

  const runGrowth = useCallback(async () => {
    const { data, error: fnError } = await supabase.functions.invoke("ai-predictive-analytics", { body: {} });
    if (fnError) throw new Error(fnError.message || "Growth insights unavailable.");
    if (data?.error) throw new Error(data.error);
    const items = [
      ...((data?.recommendations ?? []) as { title: string; description: string; impact?: string }[]).map((r) => ({
        tag: r.impact,
        text: `${r.title} — ${r.description}`,
      })),
      ...((data?.insights ?? []) as string[]).map((t) => ({ text: t })),
    ];
    return { title: LABELS.growth, items: items.length ? items : [{ text: "Not enough stream history yet." }] };
  }, []);

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
        } else if (id === "sentiment") {
          setResult(await runSentiment());
        } else if (id === "growth") {
          setResult(await runGrowth());
        } else {
          setResult(await runCopilot(id as "icebreakers" | "commands" | "social"));
        }
        if (userId && id !== "live" && id !== "clip") {
          void logHyvoEvent({ userId, streamId: null }, { kind: "ai", summary: `${LABELS[id] ?? id} generated` });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Command failed.";
        setError(message);
        toast({ title: message, variant: "destructive" });
      } finally {
        setBusy(null);
      }
    },
    [busy, live.isLive, navigate, runAction, runCopilot, runGrowth, runSentiment, runTitles, toggleListening, toast, userId],
  );

  const finishBoot = useCallback(() => {
    sessionStorage.setItem(BOOT_KEY, "1");
    setBooting(false);
  }, []);

  const pttHint = `Ctrl+Shift+${(settings?.push_to_talk_key || "V").toUpperCase()}`;

  return (
    <div className="relative h-screen overflow-hidden bg-background">
      <Seo title="Hyvo Command Center" description="The Hyvo desktop cockpit — live stream telemetry, platform links and voice control in one screen." path="/cockpit" />

      <AnimatePresence>{booting && <BootSequence onDone={finishBoot} />}</AnimatePresence>

      <HudFrame />

      <div className="relative flex h-full flex-col gap-4 px-5 py-4">
        <header className="flex shrink-0 items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          <span className="inline-flex items-center gap-2 text-[hsl(var(--neon-cyan))]">
            <ShieldCheck className="h-3.5 w-3.5" /> Status: Secure
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/40 px-2.5 py-1">
            <Cpu className="h-3 w-3 text-[hsl(var(--neon-cyan))]" />
            Build <span className="text-foreground">v{currentVersion}</span>
            <span className="hidden text-muted-foreground/70 sm:inline">· {isDesktop ? "Desktop" : "Web"}</span>
          </span>
          <span>Hyvo-AI protocol active</span>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[320px_1fr_320px]">
          {/* Left — diagnostics + activity */}
          <motion.div
            style={{ x: parallax.x * -0.3, y: parallax.y * -0.3 }}
            className="flex min-h-0 flex-col gap-4 overflow-hidden"
          >
            <SystemRail />
            <div className="min-h-0 flex-1">
              <ActivityFeed />
            </div>
          </motion.div>

          {/* Center — core, voice, destinations ring */}
          <motion.div
            style={{ x: parallax.x, y: parallax.y }}
            className="flex min-h-0 flex-col items-center justify-center gap-5 overflow-y-auto py-2"
          >
            <CoreOrb status={status} micActive={micActive} onToggle={toggleListening} disabled={!supported} />
            <VoiceStrip status={status} transcript={transcript} lastReply={lastReply} onAsk={(t) => void ask(t)} />
            {!supported && (
              <p className="text-xs text-muted-foreground">Voice control needs a Chromium-based desktop build.</p>
            )}
            <PlatformNodes
              twitchConnected={Boolean(twitchConnection?.isConnected)}
              youtubeConnected={Boolean(youtubeConnection?.isConnected)}
              onOpenDestinations={() => setDestOpen(true)}
            />
          </motion.div>

          {/* Right — live telemetry */}
          <motion.div
            style={{ x: parallax.x * -0.3, y: parallax.y * -0.3 }}
            className="min-h-0 overflow-y-auto"
          >
            <LiveRail isLive={live.isLive} viewers={live.viewers} followers={live.followers} title={live.title} />
          </motion.div>
        </div>

        <div className="shrink-0 space-y-3">
          <CommandRow
            isLive={live.isLive}
            micActive={micActive}
            busy={busy}
            onRun={onRun}
            pttHint={pttHint}
            readiness={readiness}
          />

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
      </div>

      <DestinationsDialog open={destOpen} onOpenChange={setDestOpen} />
    </div>
  );
}
