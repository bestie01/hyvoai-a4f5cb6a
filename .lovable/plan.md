

# Improve Download Page with Live GitHub Release Downloads

## Current State
The Download page already fetches releases from `bestie01/hyvoai-a4f5cb6a` via the GitHub API and links to release assets. Since the desktop release is now successful, the page should already show download buttons linked to the real `.exe`, `.dmg`, `.AppImage`, and `.deb` files from GitHub Releases.

## Improvements to Make

### 1. Add download count display
Show how many times each asset has been downloaded (GitHub API provides `download_count` on each asset).

### 2. Add changelog/release notes section
Display the release body/description from the GitHub release so users can see what's new.

### 3. Add system auto-detection
Detect the user's OS and highlight the recommended download, moving it to the top.

### 4. Add a Footer to the Download page
Currently missing — add the shared Footer component.

### 5. Improve "No releases" fallback
Show the BuildStatusCard even when releases exist (as a collapsible build info section), and always show the GitHub Actions link.

### 6. Add file hash/checksum info hint
Add a note about verifying downloads from GitHub for security.

### 7. Polish UI
- Add a subtle "Latest" badge on the auto-detected platform card
- Show the release date (formatted) alongside the version
- Add a Linux installation instruction card (currently only Windows and macOS)

## Files to Modify

| File | Change |
|------|--------|
| `src/hooks/useGitHubReleases.tsx` | Add `download_count` to asset interface, add `releaseDate` and `releaseNotes` to return value |
| `src/pages/Download.tsx` | Auto-detect OS, show recommended platform first, display release notes/changelog, add download counts, add Footer, add Linux install instructions |

## Implementation Details

**OS Detection** — Use `navigator.userAgent` to detect Windows/macOS/Linux and reorder platform cards so the user's OS appears first with a "Recommended for you" badge.

**Release Notes** — Fetch `body` from the GitHub release API response and render it as a collapsible section below the download cards.

**Download Counts** — Display `download_count` per asset as a small "X downloads" label on each platform card.

**Footer** — Import and add the existing `<Footer />` component at the bottom.

**Linux Instructions** — Add a third installation instruction card for Linux alongside Windows and macOS.

