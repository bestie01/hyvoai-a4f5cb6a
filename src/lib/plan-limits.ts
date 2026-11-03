// Central plan restrictions for Hyvo. Each tier sets what it allows, with the
// AI budget the tightest: the number of AI actions (copilot replies, command
// intents, title/sentiment/growth runs) a plan gets per calendar day.
export type PlanTier = "free" | "starter" | "pro" | "yearone";

export interface PlanLimits {
  tier: PlanTier;
  label: string;
  /** AI actions per calendar day. Infinity = unlimited. */
  aiDaily: number;
  /** Simultaneous streaming destinations. */
  maxDestinations: number;
  multiPlatform: boolean;
  growthDashboard: boolean;
  sceneManager: boolean;
  recording: boolean;
  customBranding: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    tier: "free",
    label: "Free",
    aiDaily: 15,
    maxDestinations: 1,
    multiPlatform: false,
    growthDashboard: false,
    sceneManager: false,
    recording: false,
    customBranding: false,
  },
  starter: {
    tier: "starter",
    label: "Starter",
    aiDaily: 60,
    maxDestinations: 3,
    multiPlatform: false,
    growthDashboard: false,
    sceneManager: false,
    recording: true,
    customBranding: false,
  },
  pro: {
    tier: "pro",
    label: "Pro",
    aiDaily: Infinity,
    maxDestinations: 16,
    multiPlatform: true,
    growthDashboard: true,
    sceneManager: true,
    recording: true,
    customBranding: true,
  },
  yearone: {
    tier: "yearone",
    label: "Year One",
    aiDaily: Infinity,
    maxDestinations: 16,
    multiPlatform: true,
    growthDashboard: true,
    sceneManager: true,
    recording: true,
    customBranding: true,
  },
};

export function resolveTier(tier: string | null | undefined, subscribed: boolean): PlanTier {
  if (!subscribed) return "free";
  switch ((tier || "").toLowerCase()) {
    case "starter":
      return "starter";
    case "pro":
      return "pro";
    case "year one":
    case "yearone":
    case "year_one":
      return "yearone";
    default:
      return "free";
  }
}

export interface QuotaResult {
  ok: boolean;
  remaining: number;
  limit: number;
  used: number;
  message?: string;
}

const dayKey = () => new Date().toISOString().slice(0, 10);
const storageKey = (userKey: string) => `hyvo-ai-quota-${userKey}`;

function readUsed(userKey: string): number {
  try {
    const raw = JSON.parse(localStorage.getItem(storageKey(userKey)) || "null");
    return raw && raw.date === dayKey() ? raw.used || 0 : 0;
  } catch {
    return 0;
  }
}

/** Read today's usage without consuming. */
export function aiQuotaSnapshot(userKey: string | null, limit: number): QuotaResult {
  const used = userKey ? readUsed(userKey) : 0;
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);
  return { ok: remaining > 0, remaining, limit, used };
}

/**
 * Spend one AI action for a user on a plan. Counter lives in localStorage,
 * scoped per user and per UTC day. Server edge functions still require auth;
 * this is the product-level budget gate.
 */
export function consumeAi(userKey: string | null, limits: PlanLimits): QuotaResult {
  if (!userKey) {
    return {
      ok: false,
      remaining: 0,
      limit: limits.aiDaily,
      used: 0,
      message: "Sign in to use Hyvo's AI.",
    };
  }
  if (limits.aiDaily === Infinity) {
    return { ok: true, remaining: Infinity, limit: Infinity, used: readUsed(userKey) };
  }
  const used = readUsed(userKey);
  if (used >= limits.aiDaily) {
    return {
      ok: false,
      remaining: 0,
      limit: limits.aiDaily,
      used,
      message: `You've used all ${limits.aiDaily} AI actions for today on the ${limits.label} plan — upgrade to Pro for unlimited AI.`,
    };
  }
  const nextUsed = used + 1;
  try {
    localStorage.setItem(storageKey(userKey), JSON.stringify({ date: dayKey(), used: nextUsed }));
  } catch {
    /* storage unavailable — allow the action */
  }
  return {
    ok: true,
    remaining: Math.max(0, limits.aiDaily - nextUsed),
    limit: limits.aiDaily,
    used: nextUsed,
  };
}
