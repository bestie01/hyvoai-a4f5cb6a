

# Post-Release Improvements

Now that the desktop release is successful and downloads are live, here are targeted improvements to polish the app across web and desktop.

## Changes

### 1. Download Page — Auto-expand release notes and improve hero

**File**: `src/pages/Download.tsx`

- Auto-expand the "What's New" release notes section by default (remove the collapsible wrapper) so users see what they're downloading
- Add a subtle animated gradient border on the hero download button for more visual impact
- Show "Auto-updates included" trust badge below the hero CTA
- Add a "Latest release" timestamp next to the version badge for clarity

### 2. Changelog Page — Better visual design

**File**: `src/pages/Changelog.tsx`

- Auto-expand download assets for the latest release (index 0) instead of requiring a click
- Add a "scroll to top" floating button when scrolled past the first release
- Improve timeline dot styling with a pulsing animation on the latest release dot
- Add subtle card hover effects with a left border accent color

### 3. Navigation — Add Changelog link and active state

**File**: `src/components/Navigation.tsx`

- Add "Changelog" to the nav items list
- Add active state highlighting — bold/underline the current route's nav link using `useLocation()`

### 4. Hero — Dynamic version from GitHub API

**File**: `src/components/Hero.tsx`

- Replace hardcoded `v2.0.0` badge with a dynamic version fetched via `useGitHubReleases` hook
- This ensures the hero always shows the latest release version without manual updates

### 5. Landing Page — Add download CTA to the CTA section

**File**: `src/components/CTA.tsx`

- Add a secondary "Download Desktop App" button alongside the existing primary CTA
- This gives visitors a direct path to the download page from the bottom of the landing page

## Summary of Files

| File | Change |
|------|--------|
| `src/pages/Download.tsx` | Auto-expand release notes, add trust badge, improve hero CTA |
| `src/pages/Changelog.tsx` | Auto-expand latest assets, scroll-to-top button, timeline polish |
| `src/components/Navigation.tsx` | Add Changelog link, add active route highlighting |
| `src/components/Hero.tsx` | Dynamic version badge from GitHub API |
| `src/components/CTA.tsx` | Add "Download Desktop App" secondary button |

