

# Fix: package-lock.json Out of Sync

## Root Cause
After the Capacitor version changes (`@capacitor/device` and `@capacitor/geolocation` downgraded to `^7.0.0`), the `package-lock.json` was not fully regenerated to match. `npm ci` in CI requires an exact match between the two files.

## Solution
Make a trivial edit to `package.json` that triggers Lovable's package manager to regenerate `package-lock.json`. The simplest approach: bump the project version from `"0.0.0"` to `"1.0.0"` (which is accurate given you tagged v1.0.0). This forces a full lock file rebuild.

## Files to Modify

| File | Change |
|------|--------|
| `package.json` | Change `"version": "0.0.0"` to `"version": "1.0.0"` to trigger lock file regeneration |

After this change, Lovable will regenerate `package-lock.json` with the correct resolved versions for all dependencies, and `npm ci` will pass.

