import { motion } from "framer-motion";
import {
  Loader2, Mic, MicOff, Radio, Scissors, SlidersHorizontal, LayoutDashboard, Sparkles,
  MessageSquareQuote, Terminal, Megaphone, Plug, HeartPulse, TrendingUp,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export type CommandId =
  | "live" | "talk" | "clip" | "studio" | "dash" | "destinations"
  | "titles" | "icebreakers" | "commands" | "social" | "sentiment" | "growth";

interface CommandRowProps {
  isLive: boolean;
  micActive: boolean;
  busy?: CommandId | null;
  onRun: (id: CommandId) => void;
  /** Keyboard combo that holds the mic open, e.g. "Ctrl+Shift+V". */
  pttHint?: string;
  /** Pre-flight: destinations ready to receive the broadcast vs configured. */
  readiness?: { ready: number; total: number };
}

type Item = { id: CommandId; label: string; icon: typeof Radio; tone?: "live" | "voice" };

/** Command dock — an icon rail of real tasks, JARVIS style. */
export function CommandRow({ isLive, micActive, busy, onRun, pttHint, readiness }: CommandRowProps) {
  const control: Item[] = [

    { id: "live", label: isLive ? "End broadcast" : "Go live", icon: Radio, tone: "live" },
    { id: "talk", label: micActive ? "Stop listening" : "Talk to Hyvo", icon: micActive ? Mic : MicOff, tone: "voice" },
    { id: "clip", label: "Clip that", icon: Scissors },
    { id: "destinations", label: "Destinations", icon: Plug },
    { id: "studio", label: "Studio", icon: SlidersHorizontal },
    { id: "dash", label: "Dashboard", icon: LayoutDashboard },
  ];

  const ai: Item[] = [
    { id: "titles", label: "Title ideas", icon: Sparkles },
    { id: "icebreakers", label: "Break the silence", icon: MessageSquareQuote },
    { id: "commands", label: "Chat commands", icon: Terminal },
    { id: "social", label: "Go-live post", icon: Megaphone },
    { id: "sentiment", label: "Chat mood", icon: HeartPulse },
    { id: "growth", label: "What next?", icon: TrendingUp },
  ];

  const button = (it: Item) => {
    const active =
      (it.tone === "live" && isLive) || (it.tone === "voice" && micActive);
    return (
      <Tooltip key={it.id}>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            disabled={Boolean(busy)}
            onClick={() => onRun(it.id)}
            aria-label={it.label}
            className={`relative grid h-11 w-11 shrink-0 place-items-center rounded border backdrop-blur-xl transition-colors disabled:opacity-40 ${
              active
                ? "border-[hsl(var(--neon-cyan)/0.7)] bg-[hsl(var(--neon-cyan)/0.14)] text-[hsl(var(--neon-cyan))] shadow-[0_0_24px_hsl(var(--neon-cyan)/0.35)]"
                : "border-border/50 bg-background/40 text-muted-foreground hover:border-[hsl(var(--neon-cyan)/0.6)] hover:text-foreground"
            }`}
          >
            {busy === it.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <it.icon className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="font-mono text-[10px] uppercase tracking-[0.2em]">
          {it.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  const ready = readiness?.ready ?? 0;
  const total = readiness?.total ?? 0;

  return (
    <div className="border border-accent/30 bg-background/85 px-3 py-2 backdrop-blur-2xl">
      <div className="mb-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 font-mono text-[10px] uppercase">
        {readiness && (
          <span
            className={
              ready === 0
                ? "text-warning"
                : ready < total
                  ? "text-accent"
                  : "text-success"
            }
          >
            {ready === 0
              ? "No destination ready — link an account or add a key"
              : `${ready} of ${total} destination${total === 1 ? "" : "s"} ready`}
          </span>
        )}
        {pttHint && (
          <span className={micActive ? "text-[hsl(var(--neon-cyan))]" : "text-muted-foreground/70"}>
            Hold {pttHint} to talk{micActive ? " · mic hot" : ""}
          </span>
        )}
      </div>

      <div className="flex max-w-full items-center justify-center gap-2 overflow-x-auto">
        <div className="flex shrink-0 items-center gap-1.5">{control.map(button)}</div>
        <span className="mx-1 h-8 w-px shrink-0 bg-border/60" />
        <div className="flex shrink-0 items-center gap-1.5">{ai.map(button)}</div>
      </div>
    </div>
  );
}

