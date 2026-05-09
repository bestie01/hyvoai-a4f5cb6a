# Desktop App Polish: Auth Fixes + Pro Badge + Subscription Management

## 1. Fix Auth 404 / localhost redirect

**Problem**: Google/Discord OAuth lands on `localhost:3000/...` and 404s. Root cause is two-fold:
- `getRedirectUrl()` returns `window.location.origin` on web, which becomes `http://localhost:3000` during local dev preview, and Supabase's Site URL setting determines the final landing page.
- `useAuth.signInWithTwitch` redirects to `/studio` instead of `/dashboard`.

**Code changes**:
- `src/lib/routes.ts` → `getRedirectUrl()`: always return the production URL (`https://hyvoai.lovable.app${path}`) when not running on a `*.lovable.app` preview domain or Electron, so OAuth never hands Supabase a `localhost` callback. Detection: if `window.location.hostname` is `localhost`/`127.0.0.1` OR Electron → use production URL. Otherwise use current origin (so real lovable preview/published domains keep working).
- `src/hooks/useAuth.tsx` → change all three OAuth providers (`signInWithTwitch`, `signInWithGoogle`, `signInWithDiscord`) to redirect to `/dashboard`.
- Add a small `/auth/callback` handling: not needed — Supabase strips the hash and `RequireAuth` will already pass through to `/dashboard`. But `Auth.tsx` already listens to `onAuthStateChange`; verify it routes to `/dashboard` after `SIGNED_IN` and add it if missing.

**Manual user steps (called out in chat after implementation)**:
- Supabase Dashboard → Authentication → URL Configuration: Site URL = `https://hyvoai.lovable.app`, Additional Redirect URLs include `https://hyvoai.lovable.app/**` and any preview domain.
- Google Cloud Console + Discord Developer Portal: ensure Authorized Redirect URIs include `https://fxvvcyjwgxxxezqzucwm.supabase.co/auth/v1/callback`.

## 2. Pro Badge in Sidebar

- `src/components/layout/HyvoSidebar.tsx`: import `useSubscription`, render a small `Pro` (or `Year One`) chip next to the user's email at the bottom when `isPaid && !isPaused`. Uses existing `ProBadge` style (gold gradient + Crown icon) but inline-sized.
- Sidebar already re-renders whenever `useSubscription` state changes, so cancel/resume from the Stripe portal will flip the badge automatically once `checkSubscription` runs (focus listener already wired in the hook).

## 3. Enhanced Subscription Page

**`supabase/functions/check-subscription/index.ts`**:
- Also accept `trialing` status (currently only `active`).
- Return additional fields: `current_period_end` (already as `subscription_end`), `cancel_at_period_end`, `payment_status` (`active|past_due|canceled|trialing`), `current_period_start`.
- Persist `payment_status` to `subscribers` table (column already exists).

**`src/hooks/useSubscription.tsx`**:
- Extend `SubscriptionData` with `cancel_at_period_end?: boolean` and `current_period_start?: string | null`.
- Expose `willCancel = cancel_at_period_end` and `renewalDate = subscription_end`.

**`src/pages/Subscription.tsx`** — redesign current-plan card to a 3-column summary:
- **Plan**: tier name + Pro badge.
- **Renewal**: formatted `subscription_end` ("Renews Jan 14, 2026" or "Cancels Jan 14, 2026" if `cancel_at_period_end`).
- **Status**: pill — Active / Trialing / Past Due / Paused / Canceling.
- Primary CTA: **"Manage Subscription"** → calls `openCustomerPortal()` (existing `customer-portal` edge function works). Keep Pause/Resume secondary.
- Add a `useEffect` that calls `refreshSubscription()` once the window regains focus after the portal opens (already handled by hook — verify focus listener fires).

**`supabase/functions/customer-portal/index.ts`**:
- Set `return_url` to `https://hyvoai.lovable.app/subscription` (use request origin if it's a `*.lovable.app` host, else the production URL — never `localhost`).

## 4. Core Dashboard

Already done in the previous loop — `/studio` is `bleed` inside `AppShell`. No changes here unless QA finds gaps; flag only.

## Files touched

- EDIT `src/lib/routes.ts`
- EDIT `src/hooks/useAuth.tsx`
- EDIT `src/hooks/useSubscription.tsx`
- EDIT `src/components/layout/HyvoSidebar.tsx`
- EDIT `src/pages/Subscription.tsx`
- EDIT `supabase/functions/check-subscription/index.ts`
- EDIT `supabase/functions/customer-portal/index.ts`

## Out of scope

- No DB schema changes — `subscribers.payment_status` and `subscription_end` already exist.
- No Stripe webhook changes — webhook was already hardened in the prior loop.
- No new auth providers; only redirect fixes.
- Marketing site untouched.
