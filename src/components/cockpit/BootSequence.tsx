import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LINES = [
  "INITIALISING HYVO CORE…",
  "LINKING PLATFORM NODES…",
  "CALIBRATING VOICE INTERFACE…",
  "STATUS: SECURE",
];

/** Short cockpit boot scan. Runs once per session, then gets out of the way. */
export function BootSequence({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= LINES.length) {
      const t = setTimeout(onDone, 420);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 340);
    return () => clearTimeout(t);
  }, [step, onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background"
    >
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="h-24 w-24 rounded-full border border-[hsl(var(--neon-cyan)/0.5)] shadow-[0_0_60px_hsl(var(--neon-cyan)/0.35)]"
      />
      <div className="w-64 space-y-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <AnimatePresence>
          {LINES.slice(0, step).map((l) => (
            <motion.p key={l} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
              {l}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
      <div className="h-px w-64 overflow-hidden bg-border/50">
        <motion.div
          className="h-full bg-[hsl(var(--neon-cyan))]"
          initial={{ width: "0%" }}
          animate={{ width: `${(step / LINES.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}
