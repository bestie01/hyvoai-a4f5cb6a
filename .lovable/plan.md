
## Plan: Fix Desktop “Oops” Screen + Make Streaming Connections, Navigation, and Updates Production-Ready

### What I found
- The desktop app already tries to use `HashRouter`, but the Electron detection is fragile and there are still Electron-unsafe paths/links in the app.
- The current platform connection flow is not fully wired:
  - `social_connections` only allows `youtube` in the migration, but the UI expects `twitch` and `youtube`
  - `usePlatformOAuth` reads connection rows, but nothing in the current app writes provider tokens into that table
  - `live-chat` and `platform-stats` use inconsistent platform names (`google` vs `youtube`)
  - streaming hooks still rely on manual stream keys and simulated viewer counts
- Auto-updates are partly implemented in Electron, but the renderer UI still behaves like a web download prompt instead of a native desktop updater.
- Navigation is split across multiple components with inconsistent active-state logic.

## Implementation plan

### 1. Fix the desktop app routing permanently
Update Electron + router integration so the packaged app always lands on the real home route instead of `NotFound`.

**Changes**
- Harden Electron detection in `src/App.tsx` using `window.electronAPI?.isElectron` instead of only user-agent sniffing
- Keep `HashRouter` for Electron, `BrowserRouter` for web
- Add a startup guard so Electron normalizes empty/stale paths to `#/`
- Update Electron main process to load the app in a hash-safe way and avoid stale file-path route states
- Replace raw internal anchors like the one in `src/pages/NotFound.tsx` with router-aware navigation

### 2. Make Twitch/YouTube account linking actually usable
Turn the current partial OAuth UI into a real connection system users can rely on.

**Changes**
- Add/fix a migration so `social_connections` supports both `twitch` and `youtube` consistently
- Standardize platform naming everywhere: no more `google` in some places and `youtube` in others
- Add a real token persistence flow after OAuth so connected accounts are stored in `social_connections`
- Refresh/read tokens from one shared source of truth
- Update `usePlatformOAuth`, `platform-stats`, and `live-chat` to use the same schema and platform values
- Show clear states in the UI: Connected, Needs reconnect, Expired token, Not connected

**Important desktop note**
- OAuth redirects based on `window.location.origin` are not safe for packaged Electron (`file://...`)
- I will switch auth/link flows to an environment-aware redirect strategy so web keeps working and desktop users can still connect accounts reliably

### 3. Make streaming features trustworthy instead of partly simulated
Improve the studio so users can actually use Twitch/YouTube features with confidence.

**Changes**
- Separate two modes clearly:
  - Account-linked mode for platform data/chat/stats
  - Manual stream-key mode for RTMP publishing
- Remove misleading “real” behavior where viewer counts are still simulated
- Use real connected-platform stats when available, and show honest fallback messaging when not
- Improve the connection panel so users know exactly what each connection enables:
  - Twitch/YouTube account connection
  - Stream key configuration
  - Live stats/chat availability

### 4. Rebuild navigation into one consistent system
Make navigation feel polished across website, dashboard, studio, mobile, and desktop.

**Changes**
- Create one shared route/nav config used by:
  - `src/components/Navigation.tsx`
  - `src/components/dashboard/DashboardSidebar.tsx`
  - `src/components/dashboard/MobileBottomNav.tsx`
  - page headers/back buttons where relevant
- Replace local fake active states with URL-based matching
- Improve nested route highlighting (not just exact matches)
- Make dashboard header back/forward actually navigate instead of only showing toasts
- Ensure desktop and web both use the same route logic cleanly

### 5. Finish native auto-update UX
Keep auto-updates so users do not need to redownload installers manually, and make that visible in the app.

**Changes**
- Keep existing `electron-updater` wiring and release workflow
- Add renderer-side listeners for:
  - checking
  - update available
  - download progress
  - ready to restart
  - error
- Add a proper Updates section in Settings:
  - current app version
  - latest version
  - check now button
  - update status/progress
  - restart to install CTA when ready
- Make the web banner stay web-focused, and the desktop app use native update UI instead of GitHub-download messaging
- Remove hardcoded version drift by sourcing the running app version from Electron when available

## Files likely to change
- `src/App.tsx`
- `src/pages/NotFound.tsx`
- `electron/src/index.js`
- `electron/src/preload.js`
- `src/hooks/useAuth.tsx`
- `src/hooks/usePlatformOAuth.tsx`
- `src/hooks/useRealPlatformStats.tsx`
- `src/hooks/useTwitchStream.tsx`
- `src/hooks/useYouTubeStream.tsx`
- `src/components/streaming/PlatformConnector.tsx`
- `src/components/StreamAnalytics.tsx`
- `src/components/Navigation.tsx`
- `src/components/dashboard/DashboardSidebar.tsx`
- `src/components/dashboard/MobileBottomNav.tsx`
- `src/components/UpdateBanner.tsx`
- `src/pages/Settings.tsx`
- `supabase/functions/platform-stats/index.ts`
- `supabase/functions/live-chat/index.ts`
- `supabase/migrations/...` for `social_connections` fixes

## Technical details
- Main routing fix: Electron-safe route bootstrapping + router-aware internal links
- OAuth fix: environment-aware redirect URLs, consistent platform enum values, real persistence into `social_connections`
- Navigation fix: shared route metadata + path-prefix active matching
- Update fix: native desktop update state in renderer using existing preload IPC
- Studio UX fix: remove misleading simulated “real” status and distinguish linked-account features from stream-key publishing

## Expected result
- No more desktop “Oops! Page not found” on launch
- Users can connect Twitch/YouTube in a predictable way
- Navigation feels consistent and professional across all surfaces
- Desktop users receive updates inside the app without needing to redownload manually
- The app is clearer about what works on web vs desktop and what each connection unlocks
