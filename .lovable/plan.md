# Hyvo.ai Next-Level Streaming Engine

Builds on the existing wizard, sidebar, glass tokens, and `stripe-webhook` work. Scope is strictly frontend + one new edge function (`ai-title-generator` already exists — we'll just call it). No schema changes.

---

## 1. Next-Level Navigation & Immersive Animations

`**src/components/animations/PageTransition.tsx**`

- Add a `direction`-aware variant: forward navigation slides left (`x: 24 → 0`), back slides right, sibling tabs crossfade only. Use `useLocation` history depth tracked in a small `useNavStack` hook (`sessionStorage`-backed) to determine direction.
- Wrap content in `motion.div` with `layout` so cards that share `layoutId` (sidebar active pill, hero card) morph between routes.

`**src/components/layout/HyvoSidebar.tsx**`

- Replace per-item color highlight with a single `motion.div` `layoutId="sidebar-active-pill"` so the active glow slides between items.
- Auto-collapse rule: already collapses on `/studio`. Extend to `/create` and `/ready-to-stream` while keeping a hover-to-peek floating panel (Radix `HoverCard`).
- Audit `ROUTES` + sidebar entries against `App.tsx` routes; remove any dead links, ensure every entry resolves.

---

## 2. Real Account Sync & Live Streaming Core

**Account sync (frontend only, reads existing data):**

- `src/components/dashboard/DashboardHeader.tsx` + `src/components/layout/HyvoSidebar.tsx`: pull `user.user_metadata.full_name | email`, `avatar_url`, and `useSubscription().isPro` to render a real avatar + name + "PRO" badge chip (gradient ring when Pro). Fallback to initials avatar.
- `src/pages/Profile.tsx`: ensure displayed fields read from `profiles` table via existing query; show Stripe plan name + renewal date from `useSubscription`.

**Streaming core on `/ready-to-stream` (Dashboard.tsx):**

- New `src/components/streaming/IngestPanel.tsx`:
  - Displays RTMP **Server URL** (`rtmps://ingest.hyvo.live/live` placeholder constant) and a **Stream Key** masked field with copy / regenerate / reveal controls. Key persisted per-user in `localStorage` (`hyvo.streamKey`) generated client-side via `crypto.randomUUID()` — flagged clearly as a dev-mode key until a real ingest service is wired.
  - "OBS Quick-Setup" card with copy-all button.
- New `src/components/streaming/StreamCanvasPreview.tsx`:
  - `<video>` + `<canvas>` pair. Tabs: **Local Camera** (uses existing `useCamera` / `getUserMedia`), **Screen Share** (`getDisplayMedia`), **Test Pattern** (animated canvas SMPTE-style bars so the preview is never empty).
  - Audio meter using existing `AudioMeter.tsx`.
  - "Go Live" button stub that toggles a `streaming` state and emits to `StreamHealthOverlay`.

---

## 3. Create Wizard Completion

Existing `WizardShell` + 4 steps stay. Upgrades only:

- `**SetupStep.tsx**`: add category tag selector (chip multi-select, suggested chips: Gaming, IRL, Music, Coding, Just Chatting, Art), keep title/description.
- `**MediaStep.tsx**`: replace file input with a real drag-and-drop zone (`onDragOver` / `onDrop`, image preview, 5MB guard, stored as data URL in draft).
- `**StreamConfigStep.tsx**`: add bitrate slider (2000–8000 kbps) bound to `draft.bitrate`, fps toggle 30/60, quality select already present.
- `**ReviewStep.tsx**`: show thumbnail, all chips, ingestion summary.
- On finish: `navigate("/ready-to-stream", { state: { draftStream } })` (already does this) — Dashboard reads state and **prefills `IngestPanel` title + tags**.

---

## 4. Native Desktop Power Features

**Stream Health Overlay (`StreamHealthOverlay.tsx` + `PulseDot.tsx`):**

- Compute a single `health` score from fps/bitrate/latency; pass it to `PulseDot` which already maps to good/warn/bad.
- Make `PulseDot` ring **animation speed dynamic**: pass `intensity` prop (0–1); shorter `duration` + larger `scale` when degraded. Already 70% done — extend the SPEED map to a continuous function.
- Wire a global `window.dispatchEvent("hyvo:stream-metrics", { fps, bitrate, latency })` from `StreamCanvasPreview` so the overlay reflects the actual preview when running, otherwise falls back to simulated drift.

**AI Title & Tag Generator (Create page):**

- New `src/components/create/AITitleHelper.tsx` mounted inside `SetupStep`.
- Inputs: game/category + mood chips (Hype, Chill, Competitive, Educational).
- Calls existing `ai-title-generator` edge function via `supabase.functions.invoke`. If response shape differs, adapt; otherwise add a thin request body `{ category, mood, description }` and render 3 suggestion cards — clicking one fills `draft.title` and appends suggested tags.
- Loading + error states; gated behind `isPro` consistent with the rest of `/create`.

---

## Technical Notes

- No DB migrations, no new tables, no new secrets.
- New files:
  - `src/hooks/useNavStack.ts`
  - `src/components/streaming/IngestPanel.tsx`
  - `src/components/streaming/StreamCanvasPreview.tsx`
  - `src/components/create/AITitleHelper.tsx`
- Edited files: `PageTransition.tsx`, `HyvoSidebar.tsx`, `Dashboard.tsx`, `DashboardHeader.tsx`, `Profile.tsx`, `StreamHealthOverlay.tsx`, `PulseDot.tsx`, `SetupStep.tsx`, `MediaStep.tsx`, `StreamConfigStep.tsx`, `ReviewStep.tsx`, `lib/routes.ts` (if dead links found).
- Constants for RTMP ingest URL live in `src/lib/constants.ts`.
- Out of scope: real RTMP relay backend, real video transcoding, multi-platform restream wiring (already partially handled by `multi-stream-relay` function — left untouched).

---

## Open Questions

1. **RTMP ingest URL** — **Keep the** `rtmps://ingest.hyvo.live/live` **placeholder constant.** Since you don't have a live cloud-transcoding server running yet, treating this as a high-fidelity client-side environment is the smartest choice. Lovable will build the logic to look for this variable in a central `src/lib/constants.ts` file. When you do eventually deploy an OBS media server (like Node-Media-Server or AWS IVS), you will only have to change that single line of text to hook the entire app up to your live servers.
2. **AI title generator** — **Reuse the existing** `ai-title-generator` **edge function.** There is no need to deploy a brand new function and write redundant backend code. We will simply pass the `{ category, mood, description }` payload to your current function using `supabase.functions.invoke('ai-title-generator', { body: ... })`. Lovable can easily write the frontend logic to parse the text output into those 3 clean suggestion cards.