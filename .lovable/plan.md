

# Fix Desktop App 404 + Verify Web Pages

## Problem

The screenshot shows the Electron desktop app displaying "Oops! Page not found" (404). This happens because the app uses `BrowserRouter`, which relies on the browser history API. Under Electron's `file://` protocol, the initial pathname is something like `/C:/Users/.../app/index.html` instead of `/`, so no route matches and it falls through to the catch-all 404 route.

The `base: './'` fix from earlier solved asset loading (no more black screen), but routing still breaks because `BrowserRouter` cannot resolve paths under `file://`.

## Solution

Use `HashRouter` when running inside Electron and `BrowserRouter` for the web. Hash-based routing (`/#/`, `/#/download`, etc.) works correctly under `file://` because the hash is handled entirely client-side.

## Changes

### 1. Detect Electron environment (`src/App.tsx`)

- Check `navigator.userAgent` for "Electron" string
- Conditionally render `HashRouter` (Electron) or `BrowserRouter` (web)
- Extract route definitions into a shared component to avoid duplication

### 2. Update version constant (`src/hooks/useVersionCheck.tsx`)

- Change `CURRENT_VERSION` from `'1.0.0'` to `'2.1.0'` so the update banner doesn't show for users already on the latest version. This also fixes the misleading "Current: v1.0.0" display in the desktop app's update banner.

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Use `HashRouter` when `navigator.userAgent` contains "Electron", otherwise `BrowserRouter` |
| `src/hooks/useVersionCheck.tsx` | Update `CURRENT_VERSION` to `'2.1.0'` |

## Impact

- Desktop app: Routes will work correctly, landing page loads instead of 404
- Web app: No change, continues using `BrowserRouter` as before
- Update banner: Won't falsely show "v2.1.0 available" when user is already on v2.1.0

