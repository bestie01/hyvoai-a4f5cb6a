## Hyvo.ai Audit & Hardening Plan

I read the codebase. Important note up front: there is **no Wise integration** anywhere in the project — payments are 100% Stripe via the existing `create-checkout`, `customer-portal`, `stripe-webhook`, `pause-subscription`, `resume-subscription` edge functions. I will not invent a Wise integration. If you actually want Wise added, tell me and I'll plan it as a separate feature.

The Windows desktop build is **Electron** (`electron/` folder, `electron-builder`, GitHub Releases auto-update). I'll treat it as such.

To avoid an "AI gets overwhelmed" mega-change, I'll deliver this in **3 staged commits**, each independently reviewable.

---

### Stage 1 — Integration & Auth Audit (backend correctness)

1. **Stripe end-to-end check**
   - Verify `create-checkout`, `customer-portal`, `stripe-webhook`, `pause-subscription`, `resume-subscription` all read `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` correctly and return CORS headers on every response (including errors).
   - Confirm `stripe-webhook` signature verification is enforced and `verify_jwt = false` (already correct in `config.toml`).
   - Add structured error logging + `safeErrorResponse` usage where missing.

2. **Auth flow hardening**
   - `useAuth.tsx` already uses `onAuthStateChange` + `getSession`. Audit ordering and add a guard so `setLoading(false)` only fires once both have resolved (avoids flashing protected routes).
   - Add a lightweight `RequireAuth` wrapper for `/dashboard`, `/studio`, `/settings`, `/profile`, `/schedule`, `/growth`, `/community`, `/create` — currently any unauthenticated user can hit them and pages handle it inconsistently.
   - Confirm `getRedirectUrl()` works for both Electron (uses `https://hyvoai.lovable.app`) and web.

3. **AI / connector endpoints sanity pass**
   - Walk every edge function in `supabase/functions/` and confirm: required secret present (`LOVABLE_API_KEY`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `TWITCH_API_KEY`, `RESEND_API_KEY`), CORS headers on all branches, input validated with Zod, no `service_role` key leaks to the client.
   - Fix any function returning a plain `Error` without CORS (causes silent failures in the browser).

4. **Schema/RLS spot-check**
   - Run the Supabase linter and address anything critical (RLS off, overly-permissive policies). No schema change unless required.

---

### Stage 2 — Stability, Error Boundaries, Electron polish

1. **Per-route error boundaries**
   - Wrap each lazy route in `App.tsx` with the existing `ErrorBoundary` so one page crashing doesn't blank the whole app. Add a friendly reload + "report" CTA.
   - Add a global `unhandledrejection` + `error` listener that toasts a user-friendly message instead of failing silently.

2. **API failure UX**
   - Create a tiny `useApiCall` helper (wraps `supabase.functions.invoke`) that auto-toasts on failure with the function name and a retry button. Apply it where chat send / OAuth / Stripe checkout currently swallow errors.

3. **Electron / Windows build**
   - `electron/package.json` `main` is `src/index.js` — confirm path matches the actual file (`electron/src/index.js`). Already correct.
   - Tighten `ElectronRouteGuard` in `App.tsx`: also normalize the hash on cold boot (e.g. `#/C:/...` → `#/`) and log the resolved path in dev only.
   - Wire `electron/src/preload.js` to expose `onUpdateStatus` so the existing Updates tab in Settings reflects real download progress (currently the bridge is incomplete).
   - Bump `electron/package.json` to match the next GitHub release tag so the auto-updater stops thinking it's "1.0.0".
   - Verify the `electron-builder` `nsis` config produces a working Windows installer (icon paths, `oneClick:false`, code-signing left disabled — flagged as a manual step below).

4. **Link & dead-button sweep**
   - Grep for `href="#"`, empty `onClick`, and `<Button>` without handlers across `src/components` and `src/pages`. Wire or remove. Verify nav routes in `src/lib/routes.ts` all resolve to a registered route in `App.tsx`.

---

### Stage 3 — Performance & UI/UX polish

1. **Performance**
   - Audit lazy-loaded route bundles; add `React.lazy` to heavy non-route components still imported eagerly (`StreamPreview`, `ProfessionalAudioMixer`, `AIThumbnailGenerator`, etc.) where they're not on the critical path.
   - Replace any remaining `<img>` for hero/marketing assets with `loading="lazy"` + explicit width/height to stop CLS.
   - Add `react-query` `staleTime` defaults so dashboard widgets stop refetching on every focus.

2. **UI/UX consistency pass**
   - Standardize page padding (`container mx-auto px-4 sm:px-6 lg:px-8`), card spacing, and heading sizes across `Dashboard`, `Studio`, `Growth`, `Community`, `Settings`.
   - Normalize empty states (use one shared `<EmptyState>` component) and loading skeletons.
   - Tighten the `LiveChatPanel` send bar: disabled tooltip explains *why* sending isn't available (no broadcast / not connected / missing scope), instead of a silent disabled button.
   - Polish `PlatformConnector` cards with consistent badge styles and a single "Reconnect" affordance when scopes are missing.
   - Mobile sweep at 384px (the viewport you're on right now): fix any horizontal scroll, ensure bottom nav doesn't overlap content.

3. **Vibe / professional polish**
   - Subtle motion on primary CTAs (already have `MagneticButton` — apply consistently on Hero + Pricing).
   - Consistent focus rings for a11y.
   - Replace any remaining `console.log` with `console.debug` gated on `import.meta.env.DEV`.

---

### Out of scope (will NOT touch unless you ask)
- Adding a Wise payment provider (none exists today).
- Schema migrations beyond what the linter requires.
- Code-signing certificates for Windows/macOS (manual key purchase needed).
- Publishing a new GitHub release tag (you control the repo).

### Manual actions you'll likely need after Stage 1–3
- **Supabase dashboard**: confirm Google + Twitch OAuth providers are enabled with valid client IDs/secrets; add `https://hyvoai.lovable.app/studio` and `https://hyvoai.lovable.app/dashboard` to redirect URLs.
- **Stripe dashboard**: confirm the webhook endpoint points at `https://fxvvcyjwgxxxezqzucwm.supabase.co/functions/v1/stripe-webhook` and the signing secret matches `STRIPE_WEBHOOK_SECRET`.
- **GitHub**: tag a new release (e.g. `v2.2.0`) so the desktop auto-updater picks up these fixes.
- **Code signing** (optional but recommended) for the Windows `.exe` to remove SmartScreen warnings.

### Deliverables per stage
After each stage I'll list: files changed, what was fixed, and anything that needs manual follow-up. If any stage uncovers something bigger (e.g. a broken table, missing RLS policy, real bug in a flow), I'll stop and surface it before continuing.

Approve and I'll start with **Stage 1 (Integration & Auth)**.