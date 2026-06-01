## SEO Improvement Plan

Address the failing SEO findings without changing app functionality. All edits are head-meta, static files, and a sitemap generator.

### 1. Shorten and brand the sitewide title (index.html)
- Shorten `<title>` to ≤60 chars: `Hyvo.ai — AI Streaming Assistant for YouTube & Twitch`.
- Keep the existing meta description (under 160 chars).
- Add `<link rel="canonical" href="https://hyvoai.lovable.app/" />`.
- Add `<meta property="og:url" content="https://hyvoai.lovable.app/" />`.
- Add Organization + WebSite JSON-LD blocks.

### 2. Per-route head with react-helmet-async
- Install `react-helmet-async`.
- Wrap app in `<HelmetProvider>` in `src/main.tsx`.
- Add a small `<Seo />` helper component (`src/components/Seo.tsx`) for title, description, canonical, og:title/description/url, optional JSON-LD.
- Drop `<Seo />` into the main public routes with unique copy:
  - `/` (Index)
  - `/pricing` (with FAQPage JSON-LD built from existing FAQ data)
  - `/download` (with SoftwareApplication JSON-LD)
  - `/community`, `/growth`, `/changelog`, `/auth`, `/native`
- Remove the duplicate `<link rel="canonical">` problem by letting each route own its own canonical (sitewide one stays in index.html as fallback for `/`).

### 3. Sitemap + robots
- Create `scripts/generate-sitemap.ts` listing all public routes (`/`, `/pricing`, `/download`, `/community`, `/growth`, `/changelog`, `/auth`, `/native` + sub-pages).
- Wire `predev` and `prebuild` npm scripts to run it via `bunx tsx`.
- Update `public/robots.txt` to append `Sitemap: https://hyvoai.lovable.app/sitemap.xml`.

### 4. /llms.txt
- Add `public/llms.txt` with a Hyvo.ai summary and links to main pages.

### 5. Accessibility / content fixes (from scan)
- `src/pages/Auth.tsx`: change H1 to "Sign in to Hyvo.ai"; add `aria-label` to Google/Discord/Twitch social-login buttons.
- `src/components/Navigation.tsx`: add `aria-label="Notifications"` to the bell button.
- `src/pages/native/NativeHub.tsx` and `src/pages/native/CameraFeatures.tsx`: add `aria-label="Go back"` to back buttons.
- Expand alt text on NativeFeatures demo images.

### 6. LCP performance pass
- In `src/components/Hero.tsx`: ensure the hero image (if present) has explicit `width`/`height`, no `loading="lazy"`, and `fetchpriority="high"`.
- Confirm Google Fonts `<link>` in `index.html` already uses `display=swap` (it does) — no change needed.

### Out of scope
- No business-logic, auth, Stripe, or DB changes.
- Google Search Console connector + META verification will be offered as a follow-up (requires user OAuth approval).

### Files touched
- `index.html`
- `src/main.tsx`
- `src/components/Seo.tsx` (new)
- `src/pages/Index.tsx`, `Pricing.tsx`, `Download.tsx`, `Community.tsx`, `Growth.tsx`, `Changelog.tsx`, `Auth.tsx`, `native/NativeHub.tsx`, `native/CameraFeatures.tsx`
- `src/components/Navigation.tsx`, `src/components/Hero.tsx`, `src/components/NativeFeatures.tsx`
- `scripts/generate-sitemap.ts` (new), `package.json`
- `public/robots.txt`, `public/llms.txt` (new)
