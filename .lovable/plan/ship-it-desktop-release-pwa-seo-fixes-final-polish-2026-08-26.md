# Ship It: Desktop Release, PWA/SEO Fixes & Final Polish

Verified current state: the GitHub Actions release workflow and Electron config are in place, but I found three real breakages to fix before anything ships.

## 1. Desktop App Release via GitHub Releases

**Fix what's broken first:**
- `electron-builder.json` (root) contains a **trailing comma = invalid JSON** and is legacy (the workflow uses `electron/package.json`'s `build` config). Delete it to avoid electron-builder picking up a broken config.
- **Version mismatch**: root `package.json` is `1.0.0`, `electron/package.json` is `2.2.0`. Sync both to `2.2.0` so release tags match app versions.
- Verify `electron/src/index.js` loads correctly, auto-updater points at `bestie01/hyvoai-a4f5cb6a`, and the workflow's icon pipeline (`sharp-cli` → PNG → ICO) matches existing assets (`public/app-icon-1024.png` exists ✓).

**Trigger the release:** I can't push git tags from here, so after everything is verified you run one command (or use Actions → "Desktop App Release" → Run workflow with version `2.2.0`):
```bash
git tag v2.2.0 && git push origin v2.2.0
```
This builds Windows (.exe), macOS (.dmg/.zip), and Linux (.AppImage/.deb) installers and publishes them to GitHub Releases, which the Download page and auto-updater already read.

## 2. PWA & Web App Fixes

- **Missing manifest**: `index.html` links `/manifest.webmanifest` but the file **doesn't exist** (404, breaks "install as app"). Create `public/manifest.webmanifest` with name, icons (`/app-icon-1024.png`), `display: standalone`, and theme/background colors matching the dark UI.
- **Purple purge**: `theme-color` is `#8b5cf6` (purple) and the boot splash uses purple gradients — replace with the brand blue/cyan (`#3B82F6` / cyan glows) per the established palette.

## 3. SEO Fixes

- Add `<lastmod>` dates to `public/sitemap.xml` so crawlers get freshness signals.
- Confirm every public route in `ROUTE_SEO` renders via `RouteSeo` (single H1, canonical self-referencing, og:url correct).
- Fix `twitter:site` (`@lovable_dev` → `@hyvoai`).
- After publishing, run the SEO scan and resolve whatever it flags.

## 4. Continue & Verify the Hyvo Co-Pilot

- Confirm `HyvoDock` renders on authenticated routes and the Settings → Co-Pilot tab saves preferences.
- Visually verify the new JARVIS hero on the landing page (screenshot check).
- Full typecheck + build must pass clean.

## Technical Notes

- No code changes to the workflow file unless verification reveals a failure path; the pipeline already handles icon conversion and multi-OS builds.
- The root `electron-builder.json` deletion is safe: the workflow runs electron-builder from `./electron`, which reads `electron/package.json` → `build`.
- Release assets appear on the Download page automatically via the existing `useGitHubReleases` hook once the GitHub Release is published.
