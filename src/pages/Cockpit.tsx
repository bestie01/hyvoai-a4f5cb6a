import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ShieldCheck, Cpu, Settings2, Radio, Volume2, VolumeX, Activity, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import cockpitBackdrop from "@/assets/cockpit-command-center.jpg";
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
import { QuickPresets } from "@/components/cockpit/QuickPresets";
import { useHyvoAgent } from "@/hooks/useHyvoAgent";
import { useHyvoBackground } from "@/hooks/useHyvoBackground";
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
  const {
    status, micActive, toggleListening, supported,
    transcript, lastReply, ask, settings, update, speak, stopVoice,
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
  const liveSession = live.isLive;
  useHyvoBackground({ enabled: liveSession && settings.autonomy !== "off", speak, settings });

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
      if (action === "go_live" || action === "end_stream") {
        if (action === "go_live" && readiness.ready === 0) {
          setDestOpen(true);
          setError("Connect Twitch or YouTube before starting a broadcast.");
          return;
        }
        navigate("/studio");
        setResult({ title: "Broadcast control", items: [{ text: "Open the studio to review your camera and start or end your broadcast." }] });
        return;
      }
      if (!live.isLive) {
        setError("Start a broadcast before saving a live highlight.");
        return;
      }
      const res = await executeHyvoAction(
        { action, parameters: { label: "Cockpit highlight" }, speak: "", confident: true },
        { userId, streamId: null },
      );
      toast({ title: res.speak, variant: res.ok ? "default" : "destructive" });
      if (!res.ok) {
        setError(res.speak || "Command failed.");
        return;
      }
      setResult({ title: LABELS[id] ?? "Done", items: [{ text: res.speak || "Done." }] });
    },
    [userId, toast, readiness.ready, navigate, live.isLive],
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
    <div className="relative isolate flex h-[calc(100dvh-2.25rem)] min-h-[590px] flex-col overflow-hidden bg-background text-foreground">
      <Seo title="Hyvo Command Center" description="The Hyvo desktop cockpit — live stream telemetry, platform links and voice control in one screen." path="/cockpit" />
      <AnimatePresence>{booting && <BootSequence onDone={finishBoot} />}</AnimatePresence>
      <img src={cockpitBackdrop} width={1792} height={1024} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-90" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/75 via-background/10 to-background/95" />
      <HudFrame />
      <div className="relative flex min-h-0 flex-1 flex-col px-3 pb-3 pt-3 sm:px-5 xl:px-8">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-accent/20 pb-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2"><span className="font-display text-xl font-bold text-foreground sm:text-2xl">HYVO<span className="text-accent">.AI</span></span><span className="hidden font-mono text-[10px] uppercase text-accent/80 sm:inline">/ Broadcast intelligence</span></div>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">Your live streaming command center</p>
          </div>
          <div className="hidden items-center gap-5 font-mono text-[10px] uppercase text-muted-foreground md:flex">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-success" /> Encrypted session</span>
            <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-accent" /> v{currentVersion} · {isDesktop ? "Desktop" : "Web preview"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent" title={settings.voice_enabled ? "Mute Hyvo" : "Unmute Hyvo"} aria-label={settings.voice_enabled ? "Mute Hyvo" : "Unmute Hyvo"} onClick={() => { stopVoice(); void update({ voice_enabled: !settings.voice_enabled }); }}>{settings.voice_enabled ? <Volume2 /> : <VolumeX />}</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent" title="Settings" aria-label="Settings" onClick={() => navigate("/settings")}><Settings2 /></Button>
          </div>
        </header>
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto py-4 lg:grid-cols-[minmax(215px,270px)_minmax(0,1fr)_minmax(215px,270px)] lg:overflow-hidden xl:gap-6">
          <aside className="order-2 flex min-h-[270px] flex-col gap-3 lg:order-1 lg:min-h-0">
            <div className="flex items-center gap-2 border-b border-accent/30 pb-2 font-mono text-[10px] uppercase text-accent"><Activity className="h-3.5 w-3.5" /> System diagnostics <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-success" /></div>
            <SystemRail />
            <div className="min-h-[150px] flex-1"><ActivityFeed /></div>
          </aside>
          <section className="order-1 flex min-h-[410px] flex-col items-center justify-between gap-3 lg:order-2 lg:min-h-0" aria-label="Hyvo voice co-pilot">
            <div className="flex items-center gap-2 border border-accent/30 bg-background/65 px-3 py-1 font-mono text-[10px] uppercase text-accent backdrop-blur-xl"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> HYVO co-pilot / {live.isLive ? "On air" : "Ready"}</div>
            <div className="min-h-[170px] flex-1"><CoreOrb status={status} micActive={micActive} onToggle={toggleListening} disabled={!supported} /></div>
            <div className="w-full max-w-xl space-y-3">
              <QuickPresets
                isLive={live.isLive}
                busy={Boolean(busy)}
                onTitles={() => onRun("titles" as CommandId)}
                onClip={() => onRun("clip" as CommandId)}
                onShoutout={(n) => void ask(`Give a shoutout to ${n} in chat: twitch.tv/${n}`)}
              />
              <VoiceStrip status={status} transcript={transcript} lastReply={lastReply} onAsk={(t) => void ask(t)} />
              {!supported && <p className="text-center text-xs text-muted-foreground">Voice control is unavailable. Type a command instead.</p>}
              <PlatformNodes twitchConnected={Boolean(twitchConnection?.isConnected)} youtubeConnected={Boolean(youtubeConnection?.isConnected)} onOpenDestinations={() => setDestOpen(true)} />
            </div>
          </section>
          <aside className="order-3 flex min-h-[270px] flex-col gap-3 lg:min-h-0">
            <div className="flex items-center gap-2 border-b border-accent/30 pb-2 font-mono text-[10px] uppercase text-accent"><Radio className="h-3.5 w-3.5" /> Live broadcast <span className="ml-auto text-muted-foreground">{live.isLive ? "Transmitting" : "Standby"}</span></div>
            <LiveRail isLive={live.isLive} viewers={live.viewers} followers={live.followers} title={live.title} />
            <Button variant="outline" className="w-full border-accent/40 bg-background/60 text-accent hover:bg-accent/10" onClick={() => navigate("/studio")}>Open studio <ArrowUpRight className="ml-auto" /></Button>
          </aside>
        </div>
        <div className="shrink-0 space-y-2">
          <CommandRow
            isLive={live.isLive}
            micActive={micActive}
            busy={busy}
            onRun={onRun}
            pttHint={pttHint}
            readiness={readiness}
          />

          {(busy || result || error) && <div className="max-h-44 overflow-y-auto"><CommandConsole running={busy ? LABELS[busy] ?? null : null} result={result} error={error} onClear={() => { setResult(null); setError(null); }} /></div>}
        </div>
      </div>

      <DestinationsDialog open={destOpen} onOpenChange={setDestOpen} />
    </div>
  );
}
