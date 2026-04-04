

# Verify & Improve Download + Changelog Pages

## Verification Status
The GitHub API now returns **200** with v2.0.0 release data including 7+ assets (Windows .exe, macOS .dmg/.zip, Linux .deb/.AppImage). Both pages should be fully functional.

## Design Improvements

### Download Page (`src/pages/Download.tsx`)

1. **Bigger, bolder primary download button** — For the user's detected OS, show a large hero-style download button above the platform grid (not just a sorted card). Include version, file size, and a one-click download.

2. **Cleaner platform cards** — Simplify card layout: remove gradient backgrounds, use cleaner borders, larger icons, and more whitespace. Show platform icon + name + version + size + download button only.

3. **System requirements section** — Move requirements out of cards into a compact table/grid below the download section.

4. **Total download count** — Show aggregated download count across all assets in the hero section.

5. **Remove "Web App Recommended" card prominence** — Keep it but make it secondary (outline card below downloads), since the user wants desktop downloads front-and-center.

6. **Better release notes rendering** — Parse markdown bullet points from release body into proper list items instead of raw `whitespace-pre-wrap`.

### Changelog Page (`src/pages/Changelog.tsx`)

7. **Better markdown rendering** — Parse release body markdown (headers, bullets, bold) into proper HTML elements instead of plain text with `whitespace-pre-wrap`.

8. **Total downloads per release** — Show sum of all asset downloads next to the release date.

9. **Sticky "Back to top" button** — For long changelogs.

10. **Platform icons on assets** — Show Windows/macOS/Linux icons next to each downloadable file based on file extension.

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Download.tsx` | Hero download CTA for detected OS, cleaner card design, markdown parsing, reorder sections |
| `src/pages/Changelog.tsx` | Markdown rendering, platform icons on assets, download count badges, back-to-top |

## Technical Details

- Parse markdown release notes using simple regex (split on `\n`, detect `##`, `- `, `**`) — no new dependencies needed.
- Detect platform from asset filename: `.exe` = Windows, `.dmg`/`mac` = macOS, `.deb`/`.AppImage` = Linux.
- Hero CTA: detect OS → find matching asset → show "Download for [OS]" button with size badge.

