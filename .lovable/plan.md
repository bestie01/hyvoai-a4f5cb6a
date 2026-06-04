# Hyvo.ai Premium Overhaul Plan

A focused four-part pass: design system, navigation, the Create page, and a global polish sweep. No backend / DB / business-logic changes.

---

## 1. Unified Premium Design System & Image Fixes

**Tokens (`src/index.css` + `tailwind.config.ts`)**
- Promote the existing dark theme to the **default root** (cyberpunk-minimalist). Keep light tokens under `.light` only.
- Lock a single radius scale: `--radius: 12px` → enforce `rounded-xl` as the standard, `rounded-2xl` for hero panels.
- Standard spacing: page `p-6`, card `p-5`, section gap `gap-6`.
- Add neon accent tokens: `--neon-cyan`, `--neon-magenta`, `--neon-violet`, plus `--glow-cyan/magenta/violet` shadow tokens. All HSL.
- Promote `liquid-glass-panel` / `liquid-glass-mesh` to first-class utilities (backdrop-blur 30px, 1px hairline border `hsl(var(--border)/0.6)`, inner highlight).

**Reusable primitives**
- New `src/components/ui/glass-panel.tsx` — wraps `Card` with the glass + neon-border variant (`variant: "default" | "neon" | "raised"`).
- New `src/components/ui/SmartImage.tsx` — `<img>` with: lazy loading, `decoding="async"`, explicit `width/height` to kill CLS, `onError` fallback to a branded SVG placeholder, optional skeleton shimmer while loading.

**Image audit**
- Sweep every `<img>` and `background-image` reference. Replace broken/placeholder paths with `SmartImage`. Use the existing `hyvo-logo.png` + `placeholder.svg` as fallbacks. Add explicit dimensions everywhere.
- Hero / marketing pages: confirm assets resolve; swap any 404 → branded gradient SVG.

---

## 2. Seamless Navigation & Architecture

**Router map (single source of truth in `src/lib/routes.ts`)**
```text
Public:   /  /download  /pricing  /auth  /changelog  /native/*
App:      /dashboard (= /ready-to-stream)
          /studio  /create  /schedule  /growth  /community
          /profile  /settings  /subscription  /subscription-success
```
- Remove duplicate `/studio` entry in `ROUTES` (currently listed twice).
- Add a `group` field (`"main" | "create" | "account"`) so the sidebar can render section headers + active-group highlighting.

**Transitions (`src/components/animations/PageTransition.tsx`)**
- Upgrade to a layered fade+slide (8px y, 200ms, easeOut) with `mode="wait"`. Honor `prefers-reduced-motion`.
- Wrap only the in-shell `<Routes>` so marketing pages don't double-animate with their own hero motion.

**Sidebar (`HyvoSidebar.tsx`)**
- Active state already exists via `NavLink`; add a left neon accent bar (2px, `--neon-cyan`) and subtle glow on the active item.
- When a user is on `/create/*`, auto-expand a "Create" sub-group showing the wizard step labels (Setup → Media → Stream Keys → Review).
- Collapsed state keeps icon + tooltip (already done); add active-route ring even when collapsed.

---

## 3. Feature-Complete `/create` Page

Rebuild `src/pages/StreamCreator.tsx` as a 4-step wizard. Pure frontend — config is stashed in `localStorage` (`hyvo.draftStream`) and handed off to `/ready-to-stream` via router state.

**Wizard steps**
1. **Setup** — Stream title, description, category tag picker (chips), scheduled vs. go-live-now toggle, date/time picker when scheduled.
2. **Media** — Drag-and-drop thumbnail upload zone (uses existing `useNativeFileSystem` / plain `<input type=file>`), live preview tile (16:9), optional AI title/thumbnail suggestion buttons (already wired hooks).
3. **Stream Config** — Quality switch (720p/1080p/1440p/4K), bitrate slider, FPS (30/60), platforms multi-select (Twitch / YouTube / Custom RTMP), per-platform stream-key reveal/regenerate toggle.
4. **Review & Launch** — Read-only summary card, "Save as Draft" (localStorage) and "Send to Studio" (navigates to `/ready-to-stream` with state).

**Shared wizard chrome**
- New `src/components/create/WizardShell.tsx` — stepper header, progress bar, Back/Next footer, validation gating.
- Animated step transitions (slide 16px x, 180ms).
- Each step in its own file under `src/components/create/steps/`.

**Hand-off**
- `useEffect` on `Dashboard` reads `location.state.draftStream` (or localStorage) and pre-populates the Ready-to-Stream "Stream Setup" card with a toast: "Loaded draft from Create".

---

## 4. Global Page Audit & Polish

Apply the new `GlassPanel` + token rules to:
- **Settings** — replace raw `Card` with `GlassPanel`, group tabs in a sticky glass header, fix any unstyled `Input` borders (use `bg-white/5 border-white/10 focus:border-primary/60`).
- **Studio (`StreamingApp`)** — confirm bleed layout still works; restyle floating panels to glass + neon border.
- **Subscription / Billing** — premium tier cards with neon glow on current plan, consistent CTA buttons.
- **Profile, Schedule, Growth, Community** — same primitives, no raw web borders, consistent page header (`PageHeader` component) and padding.
- Replace any leftover `border border-gray-*` / `bg-white` with semantic tokens.

---

## Technical Notes

**Files created**
- `src/components/ui/glass-panel.tsx`
- `src/components/ui/SmartImage.tsx`
- `src/components/create/WizardShell.tsx`
- `src/components/create/steps/{SetupStep,MediaStep,StreamConfigStep,ReviewStep}.tsx`
- `src/lib/draftStream.ts` (typed localStorage helpers)

**Files edited**
- `src/index.css`, `tailwind.config.ts` — token + utility additions
- `src/lib/routes.ts` — dedupe + `group` field
- `src/components/animations/PageTransition.tsx` — refined motion
- `src/components/layout/HyvoSidebar.tsx` — active accent + Create sub-group
- `src/pages/StreamCreator.tsx` — rewritten as wizard host
- `src/pages/Dashboard.tsx` — read draft hand-off
- `src/pages/{Settings,Subscription,Profile,Schedule,Growth,Community,StreamingApp}.tsx` — polish pass (visual only)

**Out of scope**
- No DB migrations, no edge functions, no auth/Stripe changes, no new npm packages, no AI feature additions.
- Marketing landing page content unchanged (visual tokens only).

**Risk**
- StreamCreator rewrite is the biggest change; existing AI title/thumbnail features get re-mounted inside the Media step, not removed.
