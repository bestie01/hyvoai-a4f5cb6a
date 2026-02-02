import { useState, useCallback, useEffect } from "react";

interface CelebrationState {
  showConfetti: boolean;
  celebrationType: "first-live" | "milestone" | "achievement" | null;
  milestoneValue: number | null;
}

const CELEBRATION_STORAGE_KEY = "dashboard-celebrations";
const VIEWER_MILESTONES = [100, 500, 1000, 5000, 10000, 50000, 100000];

interface CelebrationHistory {
  firstLiveCelebrated: boolean;
  celebratedMilestones: number[];
  lastMilestone: number;
}

export function useDashboardCelebrations() {
  const [celebration, setCelebration] = useState<CelebrationState>({
    showConfetti: false,
    celebrationType: null,
    milestoneValue: null,
  });

  const [history, setHistory] = useState<CelebrationHistory>(() => {
    if (typeof window === "undefined") {
      return { firstLiveCelebrated: false, celebratedMilestones: [], lastMilestone: 0 };
    }
    
    try {
      const stored = localStorage.getItem(CELEBRATION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load celebration history:", e);
    }
    return { firstLiveCelebrated: false, celebratedMilestones: [], lastMilestone: 0 };
  });

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem(CELEBRATION_STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error("Failed to save celebration history:", e);
    }
  }, [history]);

  const triggerConfetti = useCallback((type: "first-live" | "milestone" | "achievement", milestoneValue?: number) => {
    setCelebration({
      showConfetti: true,
      celebrationType: type,
      milestoneValue: milestoneValue || null,
    });
  }, []);

  const resetConfetti = useCallback(() => {
    setCelebration({
      showConfetti: false,
      celebrationType: null,
      milestoneValue: null,
    });
  }, []);

  const celebrateFirstLive = useCallback(() => {
    if (!history.firstLiveCelebrated) {
      triggerConfetti("first-live");
      setHistory(prev => ({ ...prev, firstLiveCelebrated: true }));
      return true;
    }
    return false;
  }, [history.firstLiveCelebrated, triggerConfetti]);

  const checkViewerMilestone = useCallback((currentViewers: number) => {
    // Find the highest milestone reached
    const reachedMilestone = VIEWER_MILESTONES.filter(m => currentViewers >= m).pop();
    
    if (reachedMilestone && !history.celebratedMilestones.includes(reachedMilestone)) {
      triggerConfetti("milestone", reachedMilestone);
      setHistory(prev => ({
        ...prev,
        celebratedMilestones: [...prev.celebratedMilestones, reachedMilestone],
        lastMilestone: reachedMilestone,
      }));
      return reachedMilestone;
    }
    return null;
  }, [history.celebratedMilestones, triggerConfetti]);

  const celebrateAchievement = useCallback((achievementName: string) => {
    triggerConfetti("achievement");
    return achievementName;
  }, [triggerConfetti]);

  const resetCelebrationHistory = useCallback(() => {
    setHistory({ firstLiveCelebrated: false, celebratedMilestones: [], lastMilestone: 0 });
    localStorage.removeItem(CELEBRATION_STORAGE_KEY);
  }, []);

  return {
    celebration,
    history,
    triggerConfetti,
    resetConfetti,
    celebrateFirstLive,
    checkViewerMilestone,
    celebrateAchievement,
    resetCelebrationHistory,
    VIEWER_MILESTONES,
  };
}
