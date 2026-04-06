

# Fix Black Screen in Desktop App + Design Improvements

## Problem 1: Black Screen in Electron Desktop App

The screenshot shows the Electron app displaying a completely black/empty window. The root cause is that **Vite's `base` config defaults to `/`**, which produces absolute asset paths like `/assets/index-abc123.js`. When Electron loads the built files via `file://` protocol, these absolute paths resolve to the filesystem root and fail silently, resulting in a blank screen.

**Fix**: Set `base: './'` in `vite.config.ts` so all asset paths become relative (e.g., `./assets/index-abc123.js`), which works correctly under `file://`.

Additionally, the Electron main process loads from `../app/index.html` but the GitHub Actions workflow copies `dist/*` into `electron/app/`. This path is correct, but without `base: './'`, the HTML file references broken absolute paths.

## Problem 2: Design Clarity Improvements

Enhance the overall design for both web and desktop with cleaner layouts, better visual hierarchy, and polished UI.

## Changes

### 1. Fix Electron Black Screen (`vite.config.ts`)

Add `base: './'` to the Vite config. This single change fixes the blank window in the packaged Electron app while remaining compatible with the web deployment (Vercel handles relative paths fine).

### 2. Improve Index/Landing Page (`src/pages/Index.tsx`)

- Add a subtle gradient background overlay for depth
- Improve section spacing and transitions between sections

### 3. Improve Navigation (`src/components/Navigation.tsx`)

- Ensure nav has proper backdrop blur and contrast for readability on both light/dark themes
- Add "Download" link to main nav if not already present

### 4. Improve Hero Section (`src/components/Hero.tsx`)

- Tighten copy, improve button contrast and sizing
- Add version badge linking to changelog

### 5. Electron Main Process Polish (`electron/src/index.js`)

- Add `show: false` + `ready-to-show` pattern (already exists, good)
- Add a fallback: if `loadFile` fails, show an error dialog instead of a black screen
- Log the actual file path being loaded for easier debugging

### 6. Desktop Release Workflow Update (`.github/workflows/desktop-release.yml`)

- Ensure `npm run build` uses the new `base: './'` (automatic from vite.config.ts change)

## Files to Modify

| File | Change |
|------|--------|
| `vite.config.ts` | Add `base: './'` to fix Electron blank screen |
| `electron/src/index.js` | Add error handling for loadFile failure, log loaded path |
| `src/pages/Index.tsx` | Improve section spacing and visual flow |
| `src/components/Navigation.tsx` | Add Download link, improve backdrop styling |
| `src/components/Hero.tsx` | Add version badge, improve CTA button design |

## Impact

- **Desktop app**: Black screen is fixed — the app will load correctly when packaged
- **Web app**: No negative impact — relative paths work on Vercel
- **Next release**: After merging and tagging a new version, the rebuilt desktop app will display the full UI

