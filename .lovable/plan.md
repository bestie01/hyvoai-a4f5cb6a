

# Add /changelog Page + Download Page Verification

## 1. New Hook: `useAllGitHubReleases`

Create `src/hooks/useAllGitHubReleases.tsx` that fetches ALL releases (not just latest) from `https://api.github.com/repos/bestie01/hyvoai-a4f5cb6a/releases` (no `/latest` suffix). Returns an array of releases with tag, name, body, date, and assets.

## 2. New Page: `src/pages/Changelog.tsx`

A full changelog page with:
- Navigation + Footer
- Hero section with version timeline header
- Each release rendered as a card with:
  - Version badge + release date
  - Full release notes (markdown-rendered via `whitespace-pre-wrap`)
  - Collapsible download assets section per release showing file name, size, and download link
  - Link to the GitHub release page
- Loading and empty states
- Animated with framer-motion (consistent with Download page style)

## 3. Route Registration

Add `/changelog` route to `src/App.tsx` (lazy loaded).

## 4. Navigation Links

- Add "Changelog" link to the Footer's resources section
- Add a "View Full Changelog" link on the Download page's release notes section pointing to `/changelog`

## Files to Create/Modify

| File | Change |
|------|--------|
| `src/hooks/useAllGitHubReleases.tsx` | New hook fetching all releases from GitHub API |
| `src/pages/Changelog.tsx` | New changelog page with full release history |
| `src/App.tsx` | Add lazy `/changelog` route |
| `src/components/Footer.tsx` | Add Changelog link to resources |
| `src/pages/Download.tsx` | Add "View Full Changelog" link in release notes section |

