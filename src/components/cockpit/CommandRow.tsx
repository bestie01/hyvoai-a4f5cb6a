import { motion } from "framer-motion";
import { Loader2, Mic, MicOff, Radio, Scissors, SlidersHorizontal, LayoutDashboard, Sparkles, MessageSquareQuote, Terminal, Megaphone, Plug } from "lucide-react";

export type CommandId =
  | "live" | "talk" | "clip" | "studio" | "dash" | "destinations"
  | "titles" | "icebreakers" | "commands" | "social";

interface CommandRowProps {
  isLive: boolean;
  micActive: boolean;
  busy?: CommandId | null;
  onRun: (id: CommandId) => void;
}

/** Primary desktop command deck — every button runs a real task. */
export function CommandRow({ isLive, micActive, busy, onRun }: CommandRowProps) {
  const primary = [
    { id: "live" as const, label: isLive ? "End stream" : "Go live", icon: Radio, primary: true },
    { id: "talk" as const, label: micActive ? "Stop listening" : "Talk to Hyvo", icon: micActive ? Mic : MicOff },
    { id: "clip" as const, label: "Clip that", icon: Scissors },
    { id: "destinations" as const, label: "Destinations", icon: Plug },
    { id: "studio" as const, label: "Studio", icon: SlidersHorizontal },
    { id: "dash" as const, label: "Dashboard", icon: LayoutDashboard },
  ];

  const ai = [
    { id: "titles" as const, label: "Title ideas", icon: Sparkles },
    { id: "icebreakers" as const, label: "Break the silence", icon: MessageSquareQuote },
    { id: "commands" as const, label: "Chat commands", icon: Terminal },
    { id: "social" as const, label: "Go-live post", icon: Megaphone },
  ];

  const render = (items: { id: CommandId; label: string; icon: any; primary?: boolean }[]) =>
    items.map((it) => (
      <motion.button
        key={it.id}
        type="button"
        disabled={Boolean(busy)}
        onClick={() => onRun(it.id)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
          it.primary
            ? "bg-gradient-to-r from-primary to-[hsl(var(--neon-cyan))] text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.35)]"
            : "border border-border/50 bg-background/40 text-foreground hover:border-[hsl(var(--neon-cyan)/0.5)]"
        }`}
      >
        {busy === it.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <it.icon className="h-4 w-4" />}
        {it.label}
      </motion.button>
    ));

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="flex flex-wrap items-center justify-center gap-2.5">{render(primary)}</div>
      <div className="flex flex-wrap items-center justify-center gap-2.5">{render(ai)}</div>
    </div>
  );
}
