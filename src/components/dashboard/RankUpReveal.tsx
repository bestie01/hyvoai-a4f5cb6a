import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { RANKS, RankTier } from "@/lib/streamerRank";
import { RankBadge } from "./RankBadge";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RankUpRevealProps {
  from: RankTier | null;
  to: RankTier | null;
  onDismiss: () => void;
}

export function RankUpReveal({ from, to, onDismiss }: RankUpRevealProps) {
  const open = !!(from && to);
  const toRank = to ? RANKS.find((r) => r.tier === to)! : null;
  const fromRank = from ? RANKS.find((r) => r.tier === from)! : null;

  // Auto dismiss after 8s
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onDismiss, 8000);
    return () => clearTimeout(t);
  }, [open, onDismiss]);

  return (
    <AnimatePresence>
      {open && toRank && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onDismiss}
          />

          {/* Radial burst */}
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: `radial-gradient(circle at center, hsl(${toRank.accent} / 0.35), transparent 55%)`,
            }}
          />

          {/* Light rays */}
          <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 14 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute left-1/2 top-1/2 origin-left h-[2px]"
                style={{
                  width: "60vmax",
                  background: `linear-gradient(90deg, hsl(${toRank.accent} / 0.6), transparent)`,
                  transform: `rotate(${(360 / 14) * i}deg)`,
                }}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: [0, 1, 0.4], scaleX: [0, 1, 1] }}
                transition={{ duration: 1.6, delay: 0.2 + i * 0.03 }}
              />
            ))}
          </div>

          {/* Content */}
          <motion.div
            className="relative z-10 w-[min(92vw,560px)] text-center"
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 18, stiffness: 180 }}
          >
            <button
              onClick={onDismiss}
              className="absolute -top-4 -right-4 w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>

            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs uppercase tracking-[0.4em] text-white/80 backdrop-blur"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: `hsl(${toRank.accent})` }} />
              Rank Up
            </motion.div>

            <motion.h1
              className="mt-6 text-6xl md:text-7xl font-display font-black tracking-tight bg-gradient-to-br bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, hsl(${toRank.accent}), white 60%, hsl(${toRank.accent}))`,
                filter: `drop-shadow(0 0 24px hsl(${toRank.accent} / 0.7))`,
              }}
              initial={{ opacity: 0, letterSpacing: "0.4em" }}
              animate={{ opacity: 1, letterSpacing: "-0.02em" }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              ARISE
            </motion.h1>

            {/* Badges: from -> to */}
            <div className="mt-8 flex items-center justify-center gap-6">
              {fromRank && (
                <motion.div
                  initial={{ opacity: 1, scale: 1 }}
                  animate={{ opacity: 0.35, scale: 0.75 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                >
                  <RankBadge rank={fromRank} size="lg" animated={false} />
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.4, rotate: -12 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1.1, type: "spring", damping: 12, stiffness: 200 }}
              >
                <RankBadge rank={toRank} size="xl" />
              </motion.div>
            </div>

            <motion.div
              className="mt-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <div className="text-xs uppercase tracking-[0.4em] text-white/50">
                You have ascended to
              </div>
              <div
                className="mt-1 text-2xl font-display font-bold"
                style={{ color: `hsl(${toRank.accent})` }}
              >
                Rank {toRank.tier} — {toRank.name}
              </div>
              <p className="mt-1 text-sm text-white/60 italic">"{toRank.tagline}"</p>
            </motion.div>

            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.7 }}
            >
              <Button
                onClick={onDismiss}
                size="lg"
                className="bg-white text-black hover:bg-white/90 font-semibold tracking-wide"
              >
                Continue the Hunt
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
