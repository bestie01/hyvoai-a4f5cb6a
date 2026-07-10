import { motion } from "framer-motion";
import { RankBadge } from "./RankBadge";
import { RankState, RANKS } from "@/lib/streamerRank";
import { Trophy, Zap, TrendingUp, Users, MessageSquare, Radio } from "lucide-react";
import { CountUp } from "@/components/animations/CountUp";
import { cn } from "@/lib/utils";

interface StreamerRankHUDProps {
  state: RankState;
  metrics: {
    totalStreams: number;
    totalViewers: number;
    peakViewers: number;
    avgEngagement: number;
    totalMessages: number;
  };
}

export function StreamerRankHUD({ state, metrics }: StreamerRankHUDProps) {
  const { current, next, progress, xp, xpRemaining } = state;

  const contributions = [
    { icon: Radio, label: "Streams", value: metrics.totalStreams, xp: metrics.totalStreams * 50 },
    { icon: Users, label: "Total Viewers", value: metrics.totalViewers, xp: metrics.totalViewers },
    { icon: TrendingUp, label: "Peak Viewers", value: metrics.peakViewers, xp: Math.round(metrics.peakViewers * 2.5) },
    { icon: Zap, label: "Engagement", value: `${metrics.avgEngagement.toFixed(1)}%`, xp: Math.round(metrics.avgEngagement * 25) },
    { icon: MessageSquare, label: "Chat", value: metrics.totalMessages, xp: Math.round(metrics.totalMessages * 0.4) },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-950 via-zinc-900/80 to-zinc-950 p-6 backdrop-blur-xl">
      {/* Ambient gradient wash */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at 20% 0%, hsl(${current.accent} / 0.25), transparent 60%), radial-gradient(500px circle at 100% 100%, hsl(${current.accent} / 0.15), transparent 60%)`,
        }}
      />
      {/* Grid */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: badge + identity */}
        <div className="flex items-center gap-5">
          <RankBadge rank={current} size="xl" />
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
              <Trophy className="w-3.5 h-3.5" />
              Hunter Rank
            </div>
            <h3 className="mt-1 text-3xl font-display font-bold text-white">
              {current.name}
            </h3>
            <p className="mt-1 text-sm text-white/60 italic">"{current.tagline}"</p>
            <div className="mt-3 flex items-center gap-2">
              {RANKS.map((r) => (
                <div
                  key={r.tier}
                  className={cn(
                    "h-1.5 w-6 rounded-full transition-all",
                    r.minXp <= xp
                      ? "bg-gradient-to-r " + r.gradient
                      : "bg-white/10",
                  )}
                  title={`${r.tier} — ${r.name}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: XP + progress */}
        <div className="flex-1 w-full lg:pl-6 lg:border-l lg:border-white/10">
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                Total XP
              </div>
              <div
                className="text-3xl font-display font-bold"
                style={{ color: `hsl(${current.accent})` }}
              >
                <CountUp value={xp} className="tabular-nums" />
              </div>
            </div>
            {next ? (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                  Next: Rank {next.tier}
                </div>
                <div className="text-sm text-white/70 tabular-nums">
                  {xpRemaining.toLocaleString()} XP to go
                </div>
              </div>
            ) : (
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300">
                  Max Rank Achieved
                </div>
                <div className="text-sm text-white/70">Shadow Monarch</div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="relative h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden">
            <motion.div
              className={cn("absolute inset-y-0 left-0 bg-gradient-to-r", current.gradient)}
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ boxShadow: `0 0 20px hsl(${current.accent} / 0.8)` }}
            />
            {/* Shimmer */}
            <motion.div
              aria-hidden
              className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ["-100%", "600%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              style={{ mixBlendMode: "overlay" }}
            />
            {/* Segment ticks */}
            {[25, 50, 75].map((p) => (
              <div
                key={p}
                className="absolute top-0 bottom-0 w-px bg-white/20"
                style={{ left: `${p}%` }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-widest text-white/40 tabular-nums">
            <span>Rank {current.tier}</span>
            <span>{Math.round(progress * 100)}%</span>
            <span>{next ? `Rank ${next.tier}` : "MAX"}</span>
          </div>

          {/* XP breakdown */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-2">
            {contributions.map((c) => (
              <div
                key={c.label}
                className="group relative rounded-lg border border-white/10 bg-white/5 p-2.5 hover:border-white/20 hover:bg-white/[0.07] transition-colors"
              >
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-white/50">
                  <c.icon className="w-3 h-3" />
                  {c.label}
                </div>
                <div className="mt-1 text-sm font-semibold text-white tabular-nums">
                  {typeof c.value === "number" ? c.value.toLocaleString() : c.value}
                </div>
                <div
                  className="text-[10px] tabular-nums"
                  style={{ color: `hsl(${current.accent})` }}
                >
                  +{c.xp.toLocaleString()} XP
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
