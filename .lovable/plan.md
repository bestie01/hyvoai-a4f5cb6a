
# Hyvo.ai — Standalone Desktop App Conversion

## 1. Persistent App Shell (`AppShell` layout)

Create `src/components/layout/AppShell.tsx`: full-height flex layout with a fixed left sidebar + content area. No marketing headers, no footer.

- **Sidebar (`HyvoSidebar`)**: replaces the small icon-only blocks currently in `DashboardSidebar`.
  - Top: real Hyvo.ai wordmark + logo (use `/public/hyvo-logo.png`, not the gradient `PlayCircle` placeholder).
  - Sections: Dashboard, Studio (Ready to Stream), Schedule, Growth, Community, Subscription, Settings, Profile.
  - Collapsible (icon-only state preserved). Active route highlight via `NavLink`.
  - Bottom: user avatar/email, Sign Out, app version (from `useVersionCheck`).
- **Custom title bar area**: thin top strip showing "Hyvo.ai Studio" + live status pill (from current Studio header). In Electron, leaves room for native traffic-lights via `titleBarStyle`.

Wrap all authenticated routes in `App.tsx` with `<AppShell>`:
`/dashboard, /studio, /schedule, /growth, /community, /create, /profile, /settings, /subscription, /subscription-success`.

Public marketing routes (`/`, `/pricing`, `/download`, `/changelog`, `/auth`, `/native/*`) stay outside the shell — but in Electron, the cold-boot guard will redirect `/` → `/dashboard` (or `/auth` if logged out) so the desktop binary never lands on the website.

## 2. In-App Subscription View

New route `/subscription` rendered inside `AppShell`:
- Reuses existing `Pricing.tsx` plan logic (cards, Stripe checkout, promo code) but stripped of the public `Navigation` / `Footer`.
- Adds current-plan summary, renewal date, pause/resume, "Manage Billing" (customer portal) — all already wired in `useSubscription`.
- Old `/pricing` public page kept for marketing site only.

Sidebar links to `/subscription`; `RequirePro` redirects upgrade prompts there instead of `/pricing` when running in Electron.

## 3. Fix Subscription Activation After Checkout

Two problems found:

**A. Webhook only picks up `status:"active"` subscriptions.** When Stripe finalizes via `checkout.session.completed`, the sub may briefly be `incomplete` or `trialing`. Switch to `stripe.subscriptions.retrieve(session.subscription)` and accept `active|trialing`.

**B. No client refresh after returning from Stripe.** `SubscriptionSuccess.tsx` doesn't force `check-subscription` to re-run, and `useSubscription` only polls every 5 min.

Fixes:
- `supabase/functions/stripe-webhook/index.ts`: in `checkout.session.completed`, fetch subscription by `session.subscription` directly; treat `active`/`trialing` as subscribed; always upsert by `user_id` when present (more reliable than email for guest checkouts).
- `useSubscription`: also refetch on `window` focus and on `visibilitychange`; expose `refreshSubscription` already used by `SubscriptionSuccess`.
- `SubscriptionSuccess.tsx`: on mount, call `refreshSubscription()` in a 1s/3s/8s retry chain until `isPaid` flips, then route to `/dashboard` with a success toast. No manual refresh required.
- Ensure `create-checkout` always sets `metadata.user_id` and `client_reference_id` so the webhook can match without email.

## 4. Studio = "Ready to Stream" Cockpit

Redesign `src/pages/StreamingApp.tsx` to feel like OBS/Discord:

- Edge-to-edge, no card padding around the whole page; fills viewport inside `AppShell`.
- Three-pane layout:
  - **Left rail (compact)**: Scenes, Sources, Audio mixer, Hotkeys — collapsible accordions, dense.
  - **Center**: large `StreamPreview` (16:9, fills available space) with floating overlay controls (Go Live, Record, Mute, Camera). Status bar underneath: bitrate, FPS, dropped frames, CPU (from `StreamHealthMonitor`).
  - **Right rail**: Live chat (`LiveChatPanel`) tab + AI tools tab (Highlights, Captions, Game Coach) + Viewers/Polls.
- Top strip: stream title (inline-editable), platform connect chips (Twitch / YouTube), LIVE badge, timer.
- Removes the giant "Hyvo.ai Studio" h1 banner — the shell already brands it.
- Connect-platform flow stays (current Dialog), but accessible from a small chip rather than dominating the header.

## 5. Brand Identity Enforcement

- Replace every gradient-square `PlayCircle` placeholder logo (sidebar, headers) with the real Hyvo.ai wordmark + glyph from `/public/hyvo-logo.png`.
- Audit `DashboardSidebar`, `Navigation`, `StreamingApp` headers for purple-square placeholders → swap to the brand mark.
- Confirm color tokens in `index.css` are unchanged (Liquid Glass aesthetic preserved).

## 6. Desktop / Routing Hygiene

- `App.tsx` already uses `HashRouter` for Electron + `base: './'`. Confirm and:
  - Add Electron cold-boot redirect: if logged in → `/dashboard`, else `/auth`. Never land on `/` (marketing).
  - Hide `Navigation` (top web nav) and `Footer` from any route while in Electron.
  - `getRedirectUrl` for OAuth already points to `https://hyvoai.lovable.app` — keep.
- All in-app links use `<NavLink>` / `useNavigate`, never `<a href>` to external paths.

## Files to add / change

```text
NEW   src/components/layout/AppShell.tsx
NEW   src/components/layout/HyvoSidebar.tsx
NEW   src/components/layout/AppTitleBar.tsx
NEW   src/pages/Subscription.tsx          (in-app billing view)
EDIT  src/App.tsx                         (wrap auth routes in AppShell, add /subscription, Electron landing redirect)
EDIT  src/pages/StreamingApp.tsx          (3-pane cockpit redesign, remove inner header)
EDIT  src/pages/Dashboard.tsx             (drop its own sidebar — uses AppShell now)
EDIT  src/pages/SubscriptionSuccess.tsx   (retry refreshSubscription, auto-route)
EDIT  src/hooks/useSubscription.tsx       (focus/visibility refetch)
EDIT  src/components/auth/RequirePro.tsx  (redirect to /subscription in app)
EDIT  src/lib/routes.ts                   (add Subscription route, reorder for sidebar)
EDIT  supabase/functions/stripe-webhook/index.ts   (retrieve sub by id, accept trialing, upsert by user_id)
EDIT  supabase/functions/create-checkout/index.ts  (ensure user_id metadata + client_reference_id)
```

## Out of scope (this pass)

- No design-token changes (Liquid Glass + Inter/Space Grotesk preserved).
- No Stripe product/price changes.
- No new AI features — existing ones are just re-homed in the new right rail.
- Marketing site (`/`, `/pricing`, `/download`) stays as-is for the web build; Electron simply skips it.
