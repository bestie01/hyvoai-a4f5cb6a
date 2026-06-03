import { motion } from "framer-motion";

type Status = "good" | "warn" | "bad";

const COLORS: Record<Status, { core: string; ring: string }> = {
  good: { core: "bg-emerald-400", ring: "bg-emerald-400/40" },
  warn: { core: "bg-amber-400", ring: "bg-amber-400/40" },
  bad:  { core: "bg-red-400",    ring: "bg-red-400/40" },
};

const SPEED: Record<Status, number> = { good: 2.2, warn: 1.4, bad: 0.9 };

export function PulseDot({ status }: { status: Status }) {
  const c = COLORS[status];
  const duration = SPEED[status];
  return (
    <span className="relative inline-flex w-2.5 h-2.5">
      <motion.span
        className={`absolute inset-0 rounded-full ${c.ring}`}
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration, ease: "easeOut", repeat: Infinity }}
      />
      <span className={`relative w-2.5 h-2.5 rounded-full ${c.core} shadow-[0_0_6px_currentColor]`} />
    </span>
  );
}

export type { Status as PulseStatus };
