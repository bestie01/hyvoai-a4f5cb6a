import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";
import {
  PLAN_LIMITS,
  PlanLimits,
  PlanTier,
  aiQuotaSnapshot,
  consumeAi as consumeAiAction,
} from "@/lib/plan-limits";

/** Plan restrictions + today's AI budget for the signed-in user. */
export function usePlanLimits() {
  const { user } = useAuth();
  const { subscription, isPaused, loading } = useSubscription();
  const subscribed = Boolean(subscription.subscribed) && !isPaused;
  const tier: PlanTier = resolveTierKey(subscription.subscription_tier, subscribed);
  const limits: PlanLimits = PLAN_LIMITS[tier];
  const [used, setUsed] = useState(0);

  useEffect(() => {
    setUsed(aiQuotaSnapshot(user?.id ?? null, limits.aiDaily).used);
  }, [user?.id, tier]);

  const consumeAi = useCallback(() => {
    const result = consumeAiAction(user?.id ?? null, limits);
    setUsed(result.used);
    return result;
  }, [user?.id, limits]);

  const unlimited = limits.aiDaily === Infinity;
  const remaining = unlimited ? Infinity : Math.max(0, limits.aiDaily - used);

  return {
    tier,
    limits,
    used,
    remaining,
    unlimited,
    canUseAI: remaining > 0,
    consumeAi,
    loading,
  };
}

function resolveTierKey(tier: string | null | undefined, subscribed: boolean): PlanTier {
  // local re-export to keep the hook self-contained
  const { resolveTier } = require("@/lib/plan-limits") as typeof import("@/lib/plan-limits");
  return resolveTier(tier, subscribed);
}
