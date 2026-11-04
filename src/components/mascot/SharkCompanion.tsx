import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import shark from "@/assets/hyvo-shark.png";
import { MascotEvent, MascotEventType, onMascotEvent } from "@/lib/mascot-events";
import { usePlanLimits } from "@/hooks/usePlanLimits";

const MOODS: Record<MascotEventType, { label: string; className: string }> = {
  celebrate: { label: "Hype", className: "text-success" },
  alert: { label: "Alert", className: "text-destructive" },
  info: { label: "Note", className: "text-accent" },
};

/**
 * Hyvo's shark companion: a small floating mascot that lives in the corner of
 * the app. It idles with a gentle bob, celebrates stream moments (kills,
 * viewer spikes), shakes on alerts, and on click shows its mini panel with
 * today's AI budget and the last event it saw.
 */
export function SharkCompanion() {
  const { remaining, limits, unlimited } = usePlanLimits();
  const [event, setEvent] = useState<MascotEvent | null>(null);
  const [mood, setMood] = useState<MascotEventType>("info");
  const [bubble, setBubble] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const off = onMascotEvent((e) => {
      setEvent(e);
      setMood(e.type);
      setBubble(e.text);
      timers.current.forEach(clearTimeout);
      timers.current = [
        window.setTimeout(() => setBubble(null), 4500),
        window.setTimeout(() => setMood("info"), 5000),
      ];
    });
    return () => {
      off();
      timers.current.forEach(clearTimeout);
    };
  }, []);

  const moodAnim =
    mood === "celebrate"
      ? { y: [0, -18, 0, -10, 0], rotate: [0, -8, 8, -5, 0], scale: [1, 1.15, 1, 1.08, 1], transition: { duration: 1.1 } }
      : mood === "alert"
        ? { x: [0, -5, 5, -4, 4, 0], transition: { duration: 0.5 } }
        : { y: [0, -4, 0], transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <div className="hyvo-shark fixed bottom-4 left-4 z-40 flex items-end gap-2 print:hidden">
      <AnimatePresence>
        {(bubble || open) && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="mb-1 max-w-[220px] rounded-2xl rounded-bl-sm border border-accent/30 bg-background/90 px-3 py-2 text-xs shadow-lg backdrop-blur-xl"
          >
            {open ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 font-mono text-[10px] uppercase text-accent"><Sparkles className="h-3 w-3" /> Hyvo buddy</span>
                  <button aria-label="Close" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-3 w-3" /></button>
                </div>
                <p className="text-foreground">
                  AI actions today:{" "}
                  <span className="font-semibold">{unlimited ? "Unlimited" : `${remaining} of ${limits.aiDaily} left`}</span>
                </p>
                <p className="text-muted-foreground">Plan: {limits.label}</p>
                {event && <p className={`text-[11px] ${MOODS[event.type].className}`}>Last moment: {event.text}</p>}
                {!unlimited && remaining === 0 && (
                  <a href="/pricing" className="inline-block font-medium text-accent underline-offset-2 hover:underline">Upgrade for unlimited AI</a>
                )}
              </div>
            ) : (
              <span className={MOODS[mood].className}>{bubble}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label="Hyvo shark companion"
        animate={moodAnim}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        className="relative shrink-0 cursor-pointer rounded-full focus-ring"
      >
        <img src={shark} alt="" width={64} height={64} className="h-12 w-12 sm:h-16 sm:w-16 drop-shadow-[0_0_12px_rgba(59,130,246,0.45)]" />
        {mood === "celebrate" && (
          <motion.span
            initial={{ opacity: 0.9, scale: 0.6 }}
            animate={{ opacity: 0, scale: 1.6 }}
            transition={{ duration: 0.9 }}
            className="pointer-events-none absolute inset-0 rounded-full bg-success/40"
          />
        )}
        {mood === "alert" && (
          <span className="pointer-events-none absolute inset-0 rounded-full bg-destructive/30 blur-md" />
        )}
      </motion.button>
    </div>
  );
}
