

# Fix Capacitor Peer Dependency Conflict + Improvements

## Root Cause Confirmed

In `package.json`, two Capacitor packages are on major version 8 while the rest are on 7:

- `@capacitor/device`: `^8.0.0` (requires `@capacitor/core >=8.0.0`)
- `@capacitor/geolocation`: `^8.0.0` (requires `@capacitor/core >=8.0.0`)
- `@capacitor/core`: `^7.4.2`

This creates an unresolvable peer dependency tree, causing `npm ci` to fail.

## Fix

Downgrade the two v8 packages to v7 to align with all other Capacitor packages:

**File: `package.json`**
- Line 18: `"@capacitor/device": "^8.0.0"` → `"@capacitor/device": "^7.0.0"`
- Line 21: `"@capacitor/geolocation": "^8.0.0"` → `"@capacitor/geolocation": "^7.0.0"`

No other changes needed. All Capacitor packages will then be on major version 7.

## Improvements (from previous plan, not yet done)

Additionally, the following quick improvements will be applied alongside the fix:

1. **Twitch IRC reconnection logic** -- Add automatic reconnect with exponential backoff in `src/hooks/useTwitchIRC.tsx` when the WebSocket disconnects
2. **Connection status indicator** in `src/pages/StreamingApp.tsx` -- Show a small colored dot (green/yellow/red) next to the chat panel header indicating WebSocket connection state
3. **CTA update** in `src/components/CTA.tsx` -- Change the primary CTA button to link to `/studio` for a "Try the Studio" action instead of a generic signup

## Files to Modify

| File | Change |
|------|--------|
| `package.json` | Downgrade `@capacitor/device` and `@capacitor/geolocation` to `^7.0.0` |
| `src/hooks/useTwitchIRC.tsx` | Add reconnection logic with backoff |
| `src/pages/StreamingApp.tsx` | Add connection status indicator |
| `src/components/CTA.tsx` | Update CTA to link to `/studio` |

