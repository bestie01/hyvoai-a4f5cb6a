import { motion } from "framer-motion";
import { RankDefinition } from "@/lib/streamerRank";
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: RankDefinition;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  className?: string;
}

const SIZES = {
  sm: { box: "w-10 h-10", text: "text-lg", ring: "inset-[-3px]" },
  md: { box: "w-16 h-16", text: "text-2xl", ring: "inset-[-4px]" },
  lg: { box: "w-24 h-24", text: "text-4xl", ring: "inset-[-6px]" },
  xl: { box: "w-40 h-40", text: "text-7xl", ring: "inset-[-8px]" },
};

export function RankBadge({ rank, size = "md", animated = true, className }: RankBadgeProps) {
  const s = SIZES[size];

  return (
    <div className={cn("relative inline-flex items-center justify-center", s.box, className)}>
      {/* Outer rotating conic ring */}
      {animated && (
        <motion.div
          aria-hidden
          className={cn("absolute rounded-2xl opacity-70 blur-[2px]", s.ring)}
          style={{
            background: `conic-gradient(from 0deg, hsl(${rank.accent}) 0%, transparent 40%, hsl(${rank.accent}) 80%, transparent 100%)`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Frame */}
      <div
        className={cn(
          "relative w-full h-full rounded-2xl bg-gradient-to-br p-[2px]",
          rank.gradient,
          rank.glow,
        )}
      >
        <div className="relative w-full h-full rounded-[14px] bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center overflow-hidden">
          {/* Diagonal HUD lines */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 8px)",
            }}
          />
          {/* Corner brackets */}
          <span className="absolute top-1 left-1 w-2 h-2 border-t border-l border-white/60" />
          <span className="absolute top-1 right-1 w-2 h-2 border-t border-r border-white/60" />
          <span className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-white/60" />
          <span className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/60" />

          {/* Tier letter */}
          <span
            className={cn(
              "relative font-display font-black tracking-tighter bg-gradient-to-br bg-clip-text text-transparent drop-shadow-[0_0_12px_currentColor]",
              rank.gradient,
              s.text,
            )}
            style={{ color: `hsl(${rank.accent})` }}
          >
            {rank.tier}
          </span>

          {/* Scanline sweep */}
          {animated && (
            <motion.div
              aria-hidden
              className="absolute inset-x-0 h-[2px] bg-white/40 blur-[1px]"
              initial={{ top: "0%" }}
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
