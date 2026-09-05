import { motion } from "framer-motion";
import {
  Loader2, Mic, MicOff, Radio, Scissors, SlidersHorizontal, LayoutDashboard, Sparkles,
  MessageSquareQuote, Terminal, Megaphone, Plug, HeartPulse, TrendingUp,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type CommandId =
  | "live" | "talk" | "clip" | "studio" | "dash" | "destinations"
  | "titles" | "icebreakers" | "commands" | "social" | "sentiment" | "growth";

interface CommandRowProps {
  isLive: boolean;
  micActive: boolean;
  busy?: CommandId | null;
  onRun: (id: CommandId) => void;
}

type Item = { id: CommandId; label: string; icon: typeof Radio; tone?: "live" | "voice" };

/** Command dock — an icon rail of real tasks, JARVIS style. */
export function CommandRow({ isLive, micActive, busy, onRun }: CommandRowProps) {
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
          <motion.button
            type="button"
            disabled={Boolean(busy)}
            onClick={() => onRun(it.id)}
            aria-label={it.label}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.94 }}
            className={`relative grid h-12 w-12 place-items-center rounded-xl border backdrop-blur-xl transition-colors disabled:opacity-40 ${
              active
                ? "border-[hsl(var(--neon-cyan)/0.7)] bg-[hsl(var(--neon-cyan)/0.14)] text-[hsl(var(--neon-cyan))] shadow-[0_0_24px_hsl(var(--neon-cyan)/0.35)]"
                : "border-border/50 bg-background/40 text-muted-foreground hover:border-[hsl(var(--neon-cyan)/0.6)] hover:text-foreground"
            }`}
          >
            {busy === it.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <it.icon className="h-5 w-5" />}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="top" className="font-mono text-[10px] uppercase tracking-[0.2em]">
          {it.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-border/40 bg-background/30 px-4 py-3 backdrop-blur-2xl">
      <div className="flex items-center gap-2.5">{control.map(button)}</div>
      <span className="mx-1 h-9 w-px bg-border/60" />
      <div className="flex items-center gap-2.5">{ai.map(button)}</div>
    </div>
  );
}
