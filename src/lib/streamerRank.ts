// Streamer Rank system — Solo Leveling / Hunter-style tiers driven by real analytics.
// XP is deterministic from the user's aggregated stream metrics so ranks never desync.

export type RankTier = "E" | "D" | "C" | "B" | "A" | "S" | "SS";

export interface RankDefinition {
  tier: RankTier;
  name: string;
  minXp: number;
  // Tailwind gradient stops for the badge frame + text glow.
  gradient: string;
  glow: string;
  accent: string; // hsl color for particle / ring accents
  tagline: string;
}

export const RANKS: RankDefinition[] = [
  {
    tier: "E",
    name: "Novice Hunter",
    minXp: 0,
    gradient: "from-zinc-500 to-zinc-700",
    glow: "shadow-[0_0_24px_rgba(161,161,170,0.35)]",
    accent: "220 9% 60%",
    tagline: "The awakening begins.",
  },
  {
    tier: "D",
    name: "Rising Streamer",
    minXp: 500,
    gradient: "from-emerald-400 to-teal-600",
    glow: "shadow-[0_0_28px_rgba(52,211,153,0.45)]",
    accent: "160 84% 55%",
    tagline: "Signal detected.",
  },
  {
    tier: "C",
    name: "Established Creator",
    minXp: 2_000,
    gradient: "from-sky-400 to-blue-600",
    glow: "shadow-[0_0_32px_rgba(56,189,248,0.55)]",
    accent: "199 89% 60%",
    tagline: "Consistent broadcast presence.",
  },
  {
    tier: "B",
    name: "Elite Broadcaster",
    minXp: 6_000,
    gradient: "from-cyan-300 to-indigo-500",
    glow: "shadow-[0_0_36px_rgba(34,211,238,0.6)]",
    accent: "187 92% 65%",
    tagline: "Elite frequency locked in.",
  },
  {
    tier: "A",
    name: "Ascended Streamer",
    minXp: 15_000,
    gradient: "from-fuchsia-400 to-cyan-500",
    glow: "shadow-[0_0_44px_rgba(34,211,238,0.7)]",
    accent: "180 92% 60%",
    tagline: "Reality bends to your channel.",
  },
  {
    tier: "S",
    name: "Sovereign",
    minXp: 40_000,
    gradient: "from-amber-300 via-cyan-300 to-blue-500",
    glow: "shadow-[0_0_52px_rgba(56,189,248,0.85)]",
    accent: "48 100% 62%",
    tagline: "Monarch of the airwaves.",
  },
  {
    tier: "SS",
    name: "Shadow Monarch",
    minXp: 100_000,
    gradient: "from-cyan-200 via-blue-400 to-fuchsia-500",
    glow: "shadow-[0_0_64px_rgba(103,232,249,1)]",
    accent: "190 100% 70%",
    tagline: "Arise. The realm is yours.",
  },
];

export interface RankMetricsInput {
  totalStreams: number;
  totalViewers: number;
  peakViewers: number;
  avgEngagement: number; // percentage 0-100
  totalMessages: number;
}

export interface RankState {
  xp: number;
  current: RankDefinition;
  next: RankDefinition | null;
  progress: number; // 0..1 within the current tier
  xpIntoTier: number;
  xpForNextTier: number; // absolute XP needed for next tier
  xpRemaining: number;
  index: number;
}

/**
 * Deterministic XP curve.
 * Weighted so early milestones feel rewarding while late-game requires sustained growth.
 */
export function computeXp(m: RankMetricsInput): number {
  const streams = m.totalStreams * 50;
  const viewers = m.totalViewers * 1;
  const peak = m.peakViewers * 2.5;
  const engagement = m.avgEngagement * 25;
  const chat = m.totalMessages * 0.4;
  return Math.max(0, Math.round(streams + viewers + peak + engagement + chat));
}

export function getRankState(xp: number): RankState {
  let idx = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXp) {
      idx = i;
      break;
    }
  }
  const current = RANKS[idx];
  const next = RANKS[idx + 1] ?? null;
  const xpIntoTier = xp - current.minXp;
  const span = next ? next.minXp - current.minXp : 1;
  const progress = next ? Math.min(1, xpIntoTier / span) : 1;

  return {
    xp,
    current,
    next,
    progress,
    xpIntoTier,
    xpForNextTier: next ? next.minXp : current.minXp,
    xpRemaining: next ? Math.max(0, next.minXp - xp) : 0,
    index: idx,
  };
}

export function rankFromMetrics(m: RankMetricsInput): RankState {
  return getRankState(computeXp(m));
}
