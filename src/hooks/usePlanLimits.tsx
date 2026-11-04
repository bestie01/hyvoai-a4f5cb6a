import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";
import {
  PLAN_LIMITS,
  PlanLimits,
  PlanTier,
  resolveTier,
  aiQuotaSnapshot,
  consumeAi as consumeAiAction,
} from "@/lib/plan-limits";

/** Plan restrictions + today's AI budget for the signed-in user. */
export function usePlanLimits() {
  const { user } = useAuth();
  const { subscription, isPaused, loading } = useSubscription();
  const subscribed = Boolean(subscription.subscribed) && !isPaused;
  const tier: PlanTier = resolveTier(subscription.subscription_tier, subscribed);
  const limits: PlanLimits = PLAN_LIMITS[tier];
  const [used, setUsed] = useState(0);

  useEffect(() => {
    setUsed(aiQuotaSnapshot(user?.id ?? null, limits.aiDaily).used);
  }, [user?.id, tier, limits.aiDaily]);

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
