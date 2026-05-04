# Stage 3 — Premium UI/UX & Performance

## 1. Design Language & Consistency

**Token unification (`src/index.css`, `tailwind.config.ts`)**
- Audit `--radius` usage — buttons currently use `rounded-md` (0.375rem) while cards use `rounded-2xl`. Standardize on three tiers: `sm` (inputs/buttons = `--radius`), `md` (cards = `--radius-lg`), `lg` (panels = `--radius-xl`).
- Consolidate shadow scale (`--shadow-soft/medium/large/xl`) and apply consistently — replace ad-hoc `shadow-lg` calls in `dashboard/*`, `streaming/*`.
- Add `--hover-lift` and `--press-scale` CSS variables so all interactive surfaces share the same motion vocabulary.

**Component audit**
- `Button` (src/components/ui/button.tsx) — already has `active:scale-[0.98]`. Extend `hero`/`accent` variants with `--shadow-medium` rest state and `--glow-primary` on hover.
- `Card`, `Input`, `Select`, `Dialog` — verify all use `rounded-[var(--radius-lg)]`, `border-border/60`, and the same focus ring (`ring-primary/40`).
- Replace remaining hard-coded hex/`bg-white/5` in `dashboard/DashboardMain.tsx`, `LiveChatPanel.tsx`, `PlatformConnector.tsx` with `bg-card/60` + `liquid-glass-panel` utility.

**Typography & spacing**
- Define `.section` (py-16 md:py-24), `.stack-sm/md/lg` (vertical rhythm 8/16/24px) utilities in `index.css`.
- Apply to Dashboard widget grid (currently inconsistent gap-4/gap-6) and Studio side panels (cluttered chat header).
- Tighten heading scale: h1 `text-4xl md:text-5xl`, h2 `text-2xl md:text-3xl`, body `text-base leading-relaxed`.

**Dark mode contrast**
- Bump `--foreground` from `220 15% 95%` to `95%+` and audit `--muted-foreground` against background (currently borderline 4.1:1 — push to ≥4.5:1 WCAG AA).
- Soften `--border` in dark mode to `240 10% 18%` for cleaner card edges.
- Re-tune `--primary` glow opacity (0.35 → 0.25) so panels feel less "neon-burned".

## 2. Micro-interactions & Transitions

**Page transitions**
- Wrap `<AppRoutes>` (`src/App.tsx`) with the existing `PageTransition` (`src/components/animations/PageTransition.tsx`) — currently unused. Provides 200ms fade with `AnimatePresence`.
- Respect `prefers-reduced-motion` via Framer's `useReducedMotion`.

**Loading states**
- Replace `<LoadingScreen />` Suspense fallback with route-specific skeletons:
  - Dashboard route → `DashboardSkeletonGrid` (already exists in `dashboard-skeleton.tsx`).
  - Studio route → new `StudioSkeleton.tsx` (chat + preview + controls placeholders).
  - Pricing/Profile/Settings → generic `PageSkeleton.tsx`.
- Eliminate layout shift in `StreamAnalytics`, `RealtimeDashboard` by reserving min-heights on widgets.

**Button & form feedback**
- Already have `isLoading`/`isSuccess` props on `Button`. Wire them into `useApiCall` consumers (Stripe checkout, chat send) so submits show the success check briefly.
- Add `RippleEffect` (already exists) to primary CTAs in `Hero`, `CTA`, `Pricing`.
- Form success: Confetti burst on first subscription, gentle scale-in on settings save.

## 3. Performance & Asset Polish

**Image optimization**
- `public/lovable-uploads/93a389d8…png` — 1.4 MB. Convert to WebP (~150 KB target) and add `<picture>` fallback wherever it's referenced.
- `public/app-icon-1024.png` (570 KB) — only needed by Electron build; remove from Vite public bundle by moving to `electron/app/icons/`.
- `src/assets/hero-dashboard.jpg` (116 KB) is fine — add `loading="lazy"` + `decoding="async"` everywhere except above-the-fold Hero (already `loading="eager"`).
- Add `width`/`height` attributes to all `<img>` to prevent CLS.

**Bundle check**
- Audit `package.json` heavy deps: `framer-motion`, `recharts`, `@capacitor/*`, `lucide-react`. Already lazy-loading routes — extend to:
  - `Confetti` and `ParticleSystem` → dynamic import on first trigger.
  - `recharts` → already only in dashboard (lazy via route).
  - Tree-shake `lucide-react` imports — verified per-icon imports are used (good).
- Add `manualChunks` in `vite.config.ts` to split `react-vendor`, `radix`, `charts`, `framer` into separate chunks for better caching.
- Verify `@capacitor/electron` stays in `devDependencies` (per memory rule).

**Empty state polish**
- Upgrade `EmptyState` (`src/components/ui/empty-state.tsx`):
  - Add optional `illustration` prop (custom SVG) replacing the plain Lucide icon circle.
  - Add subtle `animate-pulse` glow ring around illustration.
  - Ship 4 reusable SVG illustrations: `no-streams`, `no-chat`, `no-analytics`, `no-schedule` in `src/components/illustrations/`.
- Update consumers in Dashboard, Schedule, LiveChatPanel, Analytics.

## Performance Scorecard (targets)

| Metric | Current (est.) | Target |
|---|---|---|
| LCP (home) | ~2.4s | < 1.8s |
| CLS | ~0.12 | < 0.05 |
| Initial JS | ~480 KB gz | < 350 KB gz |
| Largest image | 1.4 MB PNG | < 200 KB WebP |
| Dark-mode contrast | 4.1:1 | ≥ 4.5:1 AA |

## Files to be modified / created

Created: `src/components/illustrations/{NoStreams,NoChat,NoAnalytics,NoSchedule}.tsx`, `src/components/ui/StudioSkeleton.tsx`, `src/components/ui/PageSkeleton.tsx`.
Edited: `src/index.css`, `tailwind.config.ts`, `vite.config.ts`, `src/App.tsx`, `src/components/ui/{button,empty-state,card,input}.tsx`, `src/components/Hero.tsx`, `src/components/CTA.tsx`, dashboard widgets, `LiveChatPanel.tsx`.

## Notes & manual actions
- WebP conversion will be done in-build via a one-off script (`/tmp/convert.js`) since Vite has no built-in image pipeline.
- Desktop build: changes to `vite.config.ts` `manualChunks` are safe for Electron (`base: './'` preserved per memory rule).
- No design tokens that the user previously rejected will be reintroduced (per memory).

Awaiting approval to implement.