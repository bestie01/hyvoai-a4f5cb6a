## Production Polish Plan: Visual Harmony, SEO, & Security

### 1. Visual Harmonization (Uniform UI/UX)

**Centralized tokens** — `src/index.css`
- Lock dark mode to `bg #0B0B0F` (`--background: 240 9% 5%`), surfaces `#18181B/50` with backdrop-blur, borders `zinc-800`.
- Add semantic tokens: `--surface`, `--surface-glass`, `--surface-border`, `--radius: 0.75rem` (12px), unified `--ring` (neon cyan @ 60% alpha) for global focus.
- Standardize typography scale (`text-display`, `text-h1–h4`, `text-body`, `text-caption`) using existing Inter/Space Grotesk/JetBrains Mono.

**Shared primitives**
- Promote `GlassPanel` as THE container — refactor `Card` variants to delegate to it.
- Update `button.tsx`, `input.tsx`, `slider.tsx`, `switch.tsx`, `select.tsx`, `textarea.tsx`, `dialog.tsx`, `tabs.tsx` in `src/components/ui/` to use `rounded-xl`, the unified focus ring, and zinc-800 borders.
- Add a `PageContainer` wrapper (`px-6 md:px-10 py-8 max-w-7xl`) and replace ad-hoc page paddings.

**Page sweep** — apply `PageContainer` + `GlassPanel` to:
`Dashboard.tsx`, `StreamCreator.tsx`, `StreamingApp.tsx` (Studio), `Settings.tsx`, `Profile.tsx`, `Subscription.tsx`, `Schedule.tsx`, `Growth.tsx`, `Community.tsx`, `Changelog.tsx`, `native/*`.
- Strip inline `bg-*`, `border-white/*`, raw `rounded-*` overrides; keep only semantic tokens.

### 2. SEO Enhancement

**Dynamic head per route** — react-helmet-async already installed (`HelmetProvider` in `main.tsx`, `Seo.tsx` exists).
- Create `src/lib/seo-config.ts` with per-route metadata map (title, description, OG image, JSON-LD type).
- Drop `<Seo />` into every public/page-level route (currently used inconsistently). Auto-derive canonical from `useLocation`.
- Add a `<RouteSeo />` helper that reads from the map by `pathname` so new routes only need a config entry.

**Premium OG cards**
- Generate one branded 1200×630 OG image (`public/og-default.jpg`) — dark Hyvo gradient + wordmark + tagline.
- Per-feature OG variants: `og-pricing.jpg`, `og-create.jpg`, `og-studio.jpg`, `og-download.jpg` (imagegen, premium tier for legible text).
- Add `og:image:width/height`, `og:site_name`, `twitter:creator`, `twitter:card=summary_large_image`.
- Sitewide JSON-LD already has Organization + WebSite; add `SoftwareApplication` schema (price, ratings placeholder, OS support) on `/` and `/download`.

**Sitemap/robots audit** — confirm `public/sitemap.xml` lists all public routes (`/`, `/pricing`, `/download`, `/changelog`, `/community`, `/auth`); robots.txt already correct.

### 3. Security Hardening

**Electron IPC sender validation** — `electron/src/index.js`
- Add `validateSender(event)` helper checking `event.senderFrame.url` starts with `file://` (packaged) or `http://localhost:5173` (dev); reject otherwise.
- Wrap every `ipcMain.handle(...)` callback with the validator. Affects: `save-recording`, `register-hotkey`, `window-*`, `open-external`, `check-for-updates`, `install-update`, etc.
- `open-external`: tighten allowlist to known hosts (stripe.com, supabase.co, twitch.tv, youtube.com, hyvoai.lovable.app, github.com).
- `BrowserWindow.webPreferences`: add `sandbox: true`, `webSecurity: true`, `allowRunningInsecureContent: false`; intercept `setWindowOpenHandler` to deny all `window.open`.

**Content Security Policy**
- Add CSP `<meta http-equiv>` to `index.html`:  
  `default-src 'self'; script-src 'self' 'wasm-unsafe-eval' https://cdn.gpteng.co https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com; frame-src https://js.stripe.com; media-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'`
- Add Electron `session.defaultSession.webRequest.onHeadersReceived` enforcing the same CSP for packaged builds.

**Supabase RLS optimization** — single migration:
- Re-write policies on `profiles`, `subscribers`, `stream_settings`, `device_sessions`, `social_connections`, `referrals`, `stream_schedules`, and other user-scoped tables to use `(select auth.uid()) = user_id` instead of bare `auth.uid()` — initPlan caching avoids per-row re-evaluation.
- Run `supabase--linter` afterward to confirm no new advisories.

### Files Touched
- **New**: `src/lib/seo-config.ts`, `src/components/RouteSeo.tsx`, `src/components/layout/PageContainer.tsx`, `public/og-default.jpg` (+ variants).
- **Edited**: `src/index.css`, `tailwind.config.ts`, `src/components/ui/{button,input,slider,switch,select,textarea,dialog,tabs,card}.tsx`, all listed page files, `index.html`, `electron/src/index.js`, `electron/src/preload.js` (no API change but tightening).
- **Migration**: RLS policy refactor across user-scoped tables.

### Open Questions
1. **OG branding**: generate 5 unique OG images (default + pricing/create/studio/download), or one default-only?
2. **External URL allowlist**: only the hosts I listed above, or do you need others (e.g., Discord, custom OAuth providers)?
3. **CSP `connect-src`**: any third-party analytics/APIs beyond Supabase + Stripe to whitelist (e.g., ElevenLabs, OpenAI proxies)? Edge functions go through Supabase so they're covered.