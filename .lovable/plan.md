# v2.2.0 Finalization Plan

Audit results: most items are already in place. Only the logo and version strings need actual changes.

## 1. Branding — Replace Purple Logo Tile with Text Wordmark

**File:** `src/components/Navigation.tsx` (lines 28–36)

Currently the header renders a purple gradient square containing the placeholder `93a389d8…webp` next to a "Hyvo.ai" label, which reads as the "purple rectangle" you're seeing.

Change to a clean, premium text-only wordmark:

```tsx
<Link to="/" className="flex items-center gap-2 group" aria-label="Hyvo.ai home">
  <span className="text-2xl md:text-3xl font-display font-extrabold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
    Hyvo<span className="text-foreground">.ai</span>
  </span>
  <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] bg-primary/10 text-primary border-0">
    AI-Powered
  </Badge>
</Link>
```

- Uses `font-display` (Space Grotesk, already in design system) at `font-extrabold` for that premium SaaS feel.
- Gradient on "Hyvo", solid foreground on ".ai" for contrast.
- Links to `/` (Home / Dashboard fallback handled by existing routes).
- Removes the gradient tile + image entirely.

## 2. Routing / Electron 404 — Already Implemented (verify only)

`src/App.tsx` already has:
- HashRouter selected when Electron is detected (lines 63–67).
- Cold-boot hash normalization stripping `file://`, `C:`, `.html`, `\` artifacts (lines 76–84).
- `ElectronRouteGuard` synchronously redirecting invalid paths to `/` (lines 87–101).

`electron/src/index.js` correctly loads `app/index.html` via `mainWindow.loadFile(...)` when packaged.

**No code change required.** The plan is to leave this untouched and confirm in the summary.

## 3. Version Sync to 2.2.0

- `electron/package.json` → `"version": "2.2.0"` (currently 2.1.0).
- `src/hooks/useVersionCheck.tsx` line 5 → `const CURRENT_VERSION = '2.2.0';` (drives the UI footer / About / update banner).
- `package.json` is managed by Lovable and can't be edited directly; the Electron build and runtime use the two files above, so the desktop binary will correctly identify as 2.2.0.

## 4. Vite `base: './'` — Already Set

`vite.config.ts` line 8 already declares `base: './'`. No change needed.

## 5. Out of Scope (deferred)

- "Wise integration" sweep: a repo-wide search returned zero matches in `src/`. Nothing to remove.
- WebP hero asset: still present at `public/lovable-uploads/93a389d8-e3c0-4363-b3f4-63260a76d2e6.webp` (66 KB). Once the Navigation switches to a text logo, this asset will only be used by Hero/Auth/Footer/LoadingScreen, which is fine.

## Files to Edit

1. `src/components/Navigation.tsx` — text wordmark.
2. `electron/package.json` — version 2.2.0.
3. `src/hooks/useVersionCheck.tsx` — `CURRENT_VERSION = '2.2.0'`.

## Deliverable Summary

After approval I will apply the three edits above and report back with a release-ready summary so you can tag `v2.2.0` on GitHub and trigger the desktop build workflow.
