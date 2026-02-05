
# Comprehensive Improvements Plan

This plan covers four key enhancements: Dashboard Skeleton Loaders, PWA Support, Mobile Bottom Navigation, and Keyboard Shortcuts Integration.

---

## 1. Dashboard Skeleton Loaders

### What We're Building
Polished loading states for Dashboard stats cards and analytics charts that match the liquid glass aesthetic.

### Files to Create/Modify

**Create: `src/components/ui/dashboard-skeleton.tsx`**
- `StatCardSkeleton`: Matches the 4 stat cards layout with icon placeholder, text lines
- `ChartSkeleton`: Matches the Recharts containers with animated gradient
- `FeatureCardSkeleton`: Matches AI features cards
- All components use liquid glass styling with shimmer animation

**Modify: `src/components/dashboard/DashboardMain.tsx`**
- Replace `"..."` text loading state with proper skeleton components
- Wrap stat cards grid with conditional skeleton rendering when `loading` is true
- Add skeleton fallbacks for AI features and schedule sections

**Modify: `src/components/dashboard/ProStreamAnalytics.tsx`**
- Add loading prop passed from parent
- Show chart skeletons during data fetch

### Implementation Details
```text
+---------------------------------------------+
|  LOADING STATE                              |
|  +--------+ +--------+ +--------+ +--------+|
|  |shimmer | |shimmer | |shimmer | |shimmer ||
|  |  card  | |  card  | |  card  | |  card  ||
|  +--------+ +--------+ +--------+ +--------+|
|                                             |
|  +------------------------------------------+
|  |  Chart Skeleton (gradient shimmer)       |
|  +------------------------------------------+
+---------------------------------------------+
```

---

## 2. PWA Support

### What We're Building
Full Progressive Web App with service worker, offline capability, and install prompt.

### Files to Create/Modify

**Modify: `vite.config.ts`**
- Import and configure `vite-plugin-pwa` (already installed)
- Add manifest configuration with app icons, theme colors, and display settings
- Configure service worker with workbox for caching strategies

**Create: `public/pwa-192x192.png` and `public/pwa-512x512.png`**
- Required PWA icon sizes (can use existing app-icon-1024.png as source)

**Modify: `index.html`**
- Add PWA meta tags (`theme-color`, `apple-mobile-web-app-capable`)
- Add apple touch icon link

**Create: `src/components/PWAInstallPrompt.tsx`**
- Capture `beforeinstallprompt` event
- Show install banner/button for eligible users
- Track installation state

**Create: `src/hooks/usePWA.tsx`**
- Handle service worker registration
- Detect if app is installed
- Manage install prompt flow
- Handle offline/online status

**Modify: `src/App.tsx`**
- Add PWAInstallPrompt component
- Add offline indicator when connection is lost

### PWA Manifest Configuration
```text
Name: Hyvo.ai
Short Name: Hyvo
Theme Color: #8b5cf6 (primary purple)
Background: #0A0A0F (dark theme)
Display: standalone
Orientation: portrait
Start URL: /dashboard
```

---

## 3. Mobile Bottom Navigation

### What We're Building
A fixed bottom navigation bar for mobile Dashboard users, appearing only on screens < 768px.

### Files to Create/Modify

**Create: `src/components/dashboard/MobileBottomNav.tsx`**
- Fixed bottom navigation bar (height: 64px)
- 5 nav items: Home, Studio, Analytics, Community, More
- Active state indicator with liquid glass styling
- Haptic feedback on tap (using existing useHaptics hook)
- Safe area padding for iOS notch devices

**Modify: `src/pages/Dashboard.tsx`**
- Import and render MobileBottomNav
- Add bottom padding to main content on mobile to prevent overlap

**Modify: `src/components/dashboard/DashboardSidebar.tsx`**
- Hide sidebar completely on mobile (already partially done)
- Ensure no conflict with bottom nav

### Layout
```text
Mobile View (< 768px):
+---------------------------+
|  Header                   |
+---------------------------+
|                           |
|  Main Content             |
|  (with bottom padding)    |
|                           |
+---------------------------+
| Home | Studio | + | Chat | More |  <- Bottom Nav
+---------------------------+
```

### Features
- Subtle backdrop blur effect
- Bounce animation on tap
- Badge indicators for notifications
- "Go Live" center button with pulse effect

---

## 4. Keyboard Shortcuts Integration

### Current State
- `KeyboardShortcutsModal.tsx` exists with shortcuts defined
- Has internal keyboard listener for `?` key
- Has floating button in bottom-left corner
- `useHotkeys.tsx` exists for registering custom hotkeys

### What We're Improving
Make shortcuts work globally across the app, integrate with existing hotkeys system.

### Files to Modify

**Modify: `src/App.tsx`**
- Import and render `KeyboardShortcutsModal` globally (move from individual pages)
- Ensure it's available on all routes

**Create: `src/hooks/useGlobalHotkeys.tsx`**
- Centralized hook that registers all app-wide shortcuts
- Uses existing `useHotkeys` system
- Implements actual actions for each shortcut:
  - `Ctrl+H`: Navigate to Dashboard
  - `Ctrl+,`: Navigate to Settings
  - `Ctrl+Shift+L`: Toggle streaming (navigate to /studio)
  - `Esc`: Close any open modal

**Modify: `src/components/KeyboardShortcutsModal.tsx`**
- Keep the `?` key listener
- Add visual indicator showing currently pressed keys
- Improve accessibility with proper focus management

**Modify: `src/pages/Dashboard.tsx`**
- Remove any duplicate KeyboardShortcutsModal if present
- Register Dashboard-specific hotkeys

### Global Shortcuts Summary
| Shortcut | Action |
|----------|--------|
| ? | Show shortcuts modal |
| Esc | Close modal/cancel |
| Ctrl+H | Go to Dashboard |
| Ctrl+, | Open Settings |
| Ctrl+Shift+L | Go to Studio |
| 1-9 | Switch scenes (in Studio) |

---

## Implementation Priority

| Feature | Effort | Impact | Priority |
|---------|--------|--------|----------|
| Dashboard Skeletons | Low | High | 1st |
| Keyboard Shortcuts | Low | Medium | 2nd |
| PWA Support | Medium | High | 3rd |
| Mobile Bottom Nav | Medium | High | 4th |

---

## Technical Notes

### Dependencies
- `vite-plugin-pwa`: Already installed, needs configuration
- No new dependencies required

### Browser Support
- PWA: Chrome, Edge, Safari (iOS 11.3+), Firefox
- Service Worker: All modern browsers
- Bottom Nav: All browsers, uses CSS safe-area-inset

### Testing Recommendations
1. Test skeleton loaders with network throttling
2. Test PWA install on mobile Chrome/Safari
3. Test bottom nav on various mobile devices
4. Test keyboard shortcuts with screen readers

---

## Files Summary

### New Files (6)
1. `src/components/ui/dashboard-skeleton.tsx`
2. `src/components/PWAInstallPrompt.tsx`
3. `src/hooks/usePWA.tsx`
4. `src/components/dashboard/MobileBottomNav.tsx`
5. `src/hooks/useGlobalHotkeys.tsx`
6. `public/pwa-192x192.png` (asset)

### Modified Files (7)
1. `src/components/dashboard/DashboardMain.tsx`
2. `src/components/dashboard/ProStreamAnalytics.tsx`
3. `vite.config.ts`
4. `index.html`
5. `src/App.tsx`
6. `src/pages/Dashboard.tsx`
7. `src/components/KeyboardShortcutsModal.tsx`
