import { motion } from "framer-motion";
import { Mic, MicOff, Radio, Scissors, SlidersHorizontal, LayoutDashboard } from "lucide-react";

interface CommandRowProps {
  isLive: boolean;
  micActive: boolean;
  busy?: boolean;
  onGoLive: () => void;
  onTalk: () => void;
  onStudio: () => void;
  onClip: () => void;
  onDashboard: () => void;
}

/** Primary desktop command deck — every button is wired to a real action. */
export function CommandRow({ isLive, micActive, busy, onGoLive, onTalk, onStudio, onClip, onDashboard }: CommandRowProps) {
  const items = [
    { id: "live", label: isLive ? "End stream" : "Go live", icon: Radio, onClick: onGoLive, primary: true },
    { id: "talk", label: micActive ? "Stop listening" : "Talk to Hyvo", icon: micActive ? Mic : MicOff, onClick: onTalk },
    { id: "clip", label: "Clip that", icon: Scissors, onClick: onClip },
    { id: "studio", label: "Studio", icon: SlidersHorizontal, onClick: onStudio },
    { id: "dash", label: "Dashboard", icon: LayoutDashboard, onClick: onDashboard },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5">
      {items.map((it) => (
        <motion.button
          key={it.id}
          type="button"
          disabled={busy}
          onClick={it.onClick}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
            it.primary
              ? "bg-gradient-to-r from-primary to-[hsl(var(--neon-cyan))] text-primary-foreground shadow-[0_0_24px_hsl(var(--primary)/0.35)]"
              : "border border-border/50 bg-background/40 text-foreground hover:border-[hsl(var(--neon-cyan)/0.5)]"
          }`}
        >
          <it.icon className="h-4 w-4" />
          {it.label}
        </motion.button>
      ))}
    </div>
  );
}
