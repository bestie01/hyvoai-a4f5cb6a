# Fix Auth/Stripe + Desktop Polish + Stream Health

## 1. OAuth redirect fix (Google / Discord / Twitch)

**Root cause**: `getRedirectUrl()` in `src/lib/routes.ts` already routes Electron and localhost through `https://hyvoai.lovable.app`, but the success path lands on `/dashboard`. The user-reported 404 is from Supabase's Site URL / provider redirect allowlist still containing `localhost`, plus signups landing on `/` (which can flicker before auth state hydrates).

**Changes**:
- `src/lib/routes.ts` — keep `PRODUCTION_URL = 'https://hyvoai.lovable.app'`, change post-OAuth landing path constant to `/ready-to-stream` (new alias route → Dashboard).
- `src/hooks/useAuth.tsx` — replace `getRedirectUrl('/dashboard')` and `getRedirectUrl('/')` calls (Google, Discord, Twitch, signUp, resetPassword) to use the new `/ready-to-stream` deep-link for OAuth and `/auth/callback` for email recovery.
- `src/App.tsx` — add a `/ready-to-stream` route that renders `Dashboard` (so any stale Supabase config that still points there works), and a tiny `<AuthCallback />` route that calls `supabase.auth.getSession()` then `navigate('/ready-to-stream', { replace: true })` to absorb the hash fragment cleanly (kills the white-flash 404).
- `src/pages/Auth.tsx` — after `onAuthStateChange` sees `SIGNED_IN`, `navigate('/ready-to-stream', { replace: true })`.

**User action required (documented in chat, not code)**: In Supabase Dashboard → Authentication → URL Configuration, set Site URL to `https://hyvoai.lovable.app` and add `https://hyvoai.lovable.app/**` to Additional Redirect URLs. In Google Cloud Console and Discord Dev Portal, set Authorized Redirect URI to `https://fxvvcyjwgxxxezqzucwm.supabase.co/auth/v1/callback` only.

## 2. Stripe Customer Portal fix

**Root cause audit of `supabase/functions/customer-portal/index.ts`**:
- Looks up Stripe customer by `email` only — fails silently if the user signed up with a different email casing or has no Stripe customer yet.
- `return_url` uses request `origin`; Electron sends `file://` or a chrome-extension-like origin → Stripe rejects.
- Errors return 500 with raw message but client `useSubscription.tsx` may swallow them.

**Changes**:
- `supabase/functions/customer-portal/index.ts`:
  - Prefer `stripe_customer_id` from the `subscribers` table (lookup by `user_id`); fall back to email search; if still missing, create a customer and persist it.
  - Force `return_url` to `https://hyvoai.lovable.app/subscription` whenever request origin is not an `*.lovable.app` host (covers Electron + localhost).
  - Wrap Stripe call in try/catch and return structured `{ error, code }` JSON so the client can surface it.
- `src/hooks/useSubscription.tsx` — on `openCustomerPortal`, await invoke, toast the error message if `data.error` is present, and `window.open(data.url, '_blank')` (in Electron use `window.electronAPI.openExternal(url)` if available).
- `src/pages/Subscription.tsx` — show inline error state when portal call fails.

## 3. Desktop UI: custom title bar + splash screen

**Custom title bar (frameless window)**:
- `electron/src/index.js` — set `frame: false`, `titleBarStyle: 'hidden'`, `titleBarOverlay: { color: '#0A0A0F', symbolColor: '#ffffff', height: 36 }` for Windows/Linux; on macOS use `hiddenInset` (already set).
- `electron/src/preload.js` — expose `window.electronAPI.window.{minimize, maximize, close, isMaximized}` IPC bridges.
- New `src/components/desktop/TitleBar.tsx` — 36px tall, `-webkit-app-region: drag`, Hyvo logo + app name on left, three glyph buttons (Minimize / Maximize / Close) on the right with `-webkit-app-region: no-drag`. Liquid-glass dark styling, red hover on Close. Only renders when `window.electronAPI?.isElectron`.
- `src/components/layout/AppShell.tsx` and marketing `Navigation.tsx` — mount `<TitleBar />` at the very top so it's present on every route in Electron.

**Cold-start splash screen**:
- `electron/src/index.js` — create a frameless 420×260 `BrowserWindow` with `transparent: true`, load `electron/splash.html`; show main window only on `did-finish-load`, then close splash.
- `electron/splash.html` — dark `#0A0A0F` background, centered Hyvo logo with a subtle pulse/shimmer animation (CSS keyframes, no external deps).
- `index.html` — add an inline `<style>` boot screen (matching dark bg + logo) inside `#root` so the web build also hides white flash before React hydrates; cleared automatically when React mounts.

## 4. Stream Health overlay on Dashboard

- New `src/components/dashboard/StreamHealthOverlay.tsx`:
  - Floating glass panel, bottom-right, draggable, toggle via a small "Stream Health" pill button in the dashboard header.
  - Three metrics: **FPS**, **Bitrate (kbps)**, **Latency (ms)**.
  - Reads from `useWebRTCStream` / `useLocalRecording` when a stream is active; otherwise shows simulated placeholder values that gently fluctuate (so it always feels alive on the Ready-to-Stream view).
  - Color-coded status dot (green/amber/red) based on thresholds.
  - Persist open/closed + position in `localStorage` (`hyvo.streamHealth.*`).
- `src/pages/Dashboard.tsx` — mount the overlay and a header toggle button. State lives in `useState` + localStorage hook.

## Out of scope
No DB migrations. No new edge functions. No changes to AI features, pricing, or RLS.

## Files

**Created**: `src/components/desktop/TitleBar.tsx`, `src/components/dashboard/StreamHealthOverlay.tsx`, `electron/splash.html`, `src/pages/AuthCallback.tsx`.

**Edited**: `src/lib/routes.ts`, `src/hooks/useAuth.tsx`, `src/App.tsx`, `src/pages/Auth.tsx`, `src/pages/Subscription.tsx`, `src/hooks/useSubscription.tsx`, `src/components/layout/AppShell.tsx`, `src/components/Navigation.tsx`, `src/pages/Dashboard.tsx`, `index.html`, `electron/src/index.js`, `electron/src/preload.js`, `supabase/functions/customer-portal/index.ts`.
