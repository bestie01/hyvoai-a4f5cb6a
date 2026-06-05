import { motion } from "framer-motion";

type Status = "good" | "warn" | "bad";

const COLORS: Record<Status, { core: string; ring: string }> = {
  good: { core: "bg-emerald-400", ring: "bg-emerald-400/40" },
  warn: { core: "bg-amber-400", ring: "bg-amber-400/40" },
  bad:  { core: "bg-red-400",    ring: "bg-red-400/40" },
};

interface PulseDotProps {
  status: Status;
  /** 0 = calm (slow pulse), 1 = critical (fast aggressive pulse). Optional. */
  intensity?: number;
}

export function PulseDot({ status, intensity }: PulseDotProps) {
  const c = COLORS[status];
  // Map status → base intensity if not provided
  const i = intensity ?? (status === "good" ? 0.15 : status === "warn" ? 0.55 : 0.9);
  // Faster duration when more critical (2.4s → 0.7s)
  const duration = 2.4 - i * 1.7;
  // Bigger ring when degraded (2.0 → 2.8)
  const peakScale = 2 + i * 0.8;

  return (
    <span className="relative inline-flex w-2.5 h-2.5">
      <motion.span
        className={`absolute inset-0 rounded-full ${c.ring}`}
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: [1, peakScale, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration, ease: "easeOut", repeat: Infinity }}
      />
      <span className={`relative w-2.5 h-2.5 rounded-full ${c.core} shadow-[0_0_6px_currentColor]`} />
    </span>
  );
}

export type { Status as PulseStatus };
