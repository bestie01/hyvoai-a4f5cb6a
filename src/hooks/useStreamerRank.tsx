import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  RankMetricsInput,
  RankState,
  RankTier,
  rankFromMetrics,
} from "@/lib/streamerRank";

const STORAGE_KEY = "hyvo.rank.lastTier.v1";

export function useStreamerRank(metrics: RankMetricsInput | null | undefined) {
  const { user } = useAuth();
  const storageKey = user ? `${STORAGE_KEY}:${user.id}` : STORAGE_KEY;

  const state: RankState = useMemo(
    () =>
      rankFromMetrics(
        metrics ?? {
          totalStreams: 0,
          totalViewers: 0,
          peakViewers: 0,
          avgEngagement: 0,
          totalMessages: 0,
        },
      ),
    [metrics],
  );

  const [rankUp, setRankUp] = useState<{ from: RankTier; to: RankTier } | null>(null);

  useEffect(() => {
    if (!metrics) return;
    if (typeof window === "undefined") return;

    const previous = window.localStorage.getItem(storageKey) as RankTier | null;
    const currentTier = state.current.tier;

    if (!previous) {
      window.localStorage.setItem(storageKey, currentTier);
      return;
    }

    if (previous !== currentTier) {
      // Only celebrate promotions, not manual demotions (data resets).
      const prevIdx = ["E", "D", "C", "B", "A", "S", "SS"].indexOf(previous);
      const currIdx = ["E", "D", "C", "B", "A", "S", "SS"].indexOf(currentTier);
      if (currIdx > prevIdx) {
        setRankUp({ from: previous, to: currentTier });
      }
      window.localStorage.setItem(storageKey, currentTier);
    }
  }, [metrics, state.current.tier, storageKey]);

  const dismissRankUp = () => setRankUp(null);

  return { state, rankUp, dismissRankUp };
}
