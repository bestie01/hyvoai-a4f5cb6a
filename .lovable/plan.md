# Premium Improvements Plan

## 1. Desktop Title Bar & Window Controls

**`electron/src/index.js`**
- Add window state persistence using `electron-store` (or simple JSON file at `app.getPath('userData')/window-state.json`) — keep no new deps; use `fs` + JSON file to avoid install bloat.
- On startup: read saved `{x, y, width, height, maximized}` and apply to `BrowserWindow` (validate against available displays so off-screen coords fall back to defaults).
- Listen for `resize`, `move`, `maximize`, `unmaximize`, `close` → debounce-save to disk (300ms).

**`src/components/desktop/TitleBar.tsx`**
- Add hover/active scale + color transitions on Minimize/Maximize/Close buttons (`active:scale-95`, smoother `transition-all duration-150`, red glow on close hover).
- Add subtle ripple on click via a small inline span using framer-motion `whileTap`.
- Verify it mounts above `AppShell` cleanly with no double-border (audit `src/App.tsx` layout wrapper).

## 2. 'Ready to Stream' Interface Polish

**`src/components/layout/HyvoSidebar.tsx`**
- Introduce a `collapsed` state persisted to `localStorage` (`hyvo.sidebar.collapsed`).
- When collapsed: 64px rail, icons only, tooltips on hover; non-essential items (Settings, Profile, Community, Changelog) collapse first.
- Auto-collapse by default on `/ready-to-stream` and `/dashboard` routes to maximize cockpit space.
- Add toggle chevron at top.

**`src/components/dashboard/StreamHealthOverlay.tsx`**
- Replace static dot with `PulseDot` component: animated ring using framer-motion (`scale 1 → 1.6`, opacity fade, infinite) — color-tied to status (emerald / amber / red).
- Pulse speed scales inversely with health (faster pulse when degraded).
- Add a thin animated sparkline strip under each metric showing last 20 samples (lightweight SVG polyline).
- Keep simulated drift behavior, but expose `useStreamHealth()` hook so real WebRTC stats can plug in later without touching the overlay.

## 3. Production-Grade Security Hardening

**`supabase/functions/stripe-webhook/index.ts`** (audit + harden)
- Confirm `stripe.webhooks.constructEventAsync(rawBody, signature, STRIPE_WEBHOOK_SECRET)` is used (NOT `JSON.parse` of body).
- Read raw body with `await req.text()` before any parsing.
- Reject with 400 when `stripe-signature` header is missing or verification throws.
- Add structured logging of `event.id` + `event.type` only — never log full payload.
- Ensure function is deployed with `verify_jwt = false` in `supabase/config.toml` (webhooks come from Stripe, not authenticated users) and validate via signature only.

**`src/integrations/supabase/client.ts`**
- Configure auth for 30-day persistent sessions in Electron/desktop:
  - `persistSession: true` (already set), `autoRefreshToken: true` (already set), add `storageKey: 'hyvo.auth.v1'`.
  - Use `localStorage` on web; on Electron use a wrapper that writes to `localStorage` (Electron renderer has it) — but also mirror token to `electronAPI.secureStore` if exposed (no-op fallback for now).
- Note: actual session lifetime is governed by Supabase JWT settings. Document for the user that they need to set "JWT expiry" to refresh-token-backed 30 days in Supabase dashboard (Auth → Settings → JWT expiry = 3600s + refresh token rotation; refresh tokens default to long-lived).

## 4. Code Optimization & Fluidity

**`vite.config.ts`**
- Add `build.rollupOptions.output.manualChunks` splitting: `react`, `supabase`, `framer-motion`, `recharts`, `radix-ui`, `lucide`.
- Enable `build.cssCodeSplit: true`, `build.reportCompressedSize: false` (faster builds), `build.chunkSizeWarningLimit: 1200`.
- Keep `base: './'` for Electron.

**Lazy routes — `src/App.tsx`**
- Convert heavy route imports (Dashboard, StreamingApp, StreamCreator, Subscription, Native* pages, AI pages) to `React.lazy()` + `<Suspense fallback={<RouteFallback />}>`.
- Keep `Index`, `Auth`, `NotFound` eager.

**Boot splash hand-off — `index.html` + `src/main.tsx`**
- Replace abrupt removal with crossfade: splash fades out (300ms) while `#root` fades in (300ms) using `opacity` transition.
- Mount `<App />` first, then in `requestIdleCallback` (fallback to `setTimeout 50ms`) trigger `boot-splash.classList.add('hide')` and set `#root` opacity to 1.
- Match splash background to app background (`#0A0A0F`) so there is zero color flash.
- Electron splash window (`electron/splash.html`): increase overlap delay from 200ms → 350ms and add inner opacity transition for the same crossfade effect when handing off to main window.

## Out of Scope
- No new DB tables or migrations (security work is code-only in the webhook function).
- No changes to AI features, pricing, or RLS.
- No new npm dependencies.

## Files
**Created:** `src/components/dashboard/PulseDot.tsx`, `src/hooks/useStreamHealth.tsx`, `src/components/RouteFallback.tsx`.
**Edited:** `electron/src/index.js`, `electron/splash.html`, `src/components/desktop/TitleBar.tsx`, `src/components/layout/HyvoSidebar.tsx`, `src/components/dashboard/StreamHealthOverlay.tsx`, `supabase/functions/stripe-webhook/index.ts`, `supabase/config.toml`, `src/integrations/supabase/client.ts`, `vite.config.ts`, `src/App.tsx`, `src/main.tsx`, `index.html`.

## Manual Action
- In Supabase Dashboard → Auth → Settings: confirm "Refresh token rotation" enabled and "Refresh token reuse interval" ≥ 10s for the 30-day session experience.
