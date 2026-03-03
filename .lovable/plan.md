

# Improvements: Electron Workflows, Release Config, and Verification

## Current Issues Found

1. **`electron/package.json`** has placeholder GitHub publish config (`"owner": "YOUR_USERNAME"`, `"repo": "hyvo-stream-studio"`) -- must match actual repo `bestie01Your/hyvoai-89ce887a`
2. **`electron-builder.json`** (root) also has wrong publish config (`"owner": "hyvo-app"`) and references a nonexistent `scripts/notarize.js` in `afterSign`
3. **Two duplicate workflows** (`electron-build.yml` and `desktop-release.yml`) do the same thing -- the `desktop-release.yml` uses `npm ci` for the electron dir which will fail since `electron/package-lock.json` likely doesn't exist; should use `npm install`
4. **Chat connection indicator** is already implemented (lines 598-601 in `StreamingApp.tsx`) -- just needs visual verification

## Plan

### 1. Fix `electron/package.json` publish config
Update the `publish` section to use the real GitHub repo:
```json
"owner": "bestie01Your",
"repo": "hyvoai-89ce887a"
```

### 2. Fix root `electron-builder.json` publish config and remove broken `afterSign`
- Update `publish.owner` to `bestie01Your` and `publish.repo` to `hyvoai-89ce887a`
- Remove `"afterSign": "scripts/notarize.js"` (file doesn't exist, will crash the build)

### 3. Consolidate and fix the desktop-release workflow
Keep `desktop-release.yml` as the primary workflow and fix it:
- Change `npm ci` to `npm install` in the electron directory steps (no lock file there)
- Add `--legacy-peer-deps` only for the electron subdirectory if needed (separate dependency tree)
- Add `latest*.yml` to artifact uploads (required for electron-updater auto-updates)

### 4. Remove redundant `electron-build.yml`
Delete `.github/workflows/electron-build.yml` since `desktop-release.yml` covers the same functionality with a cleaner structure.

### 5. Verify chat indicator
Navigate to `/studio` in the browser to confirm the green/yellow/gray dot appears next to the Chat tab.

## Files to Modify

| File | Change |
|------|--------|
| `electron/package.json` | Fix `publish.owner` and `publish.repo` to match real GitHub repo |
| `electron-builder.json` | Fix `publish` config, remove `afterSign` |
| `.github/workflows/desktop-release.yml` | Fix `npm ci` → `npm install` for electron dir, add `latest*.yml` artifacts |
| `.github/workflows/electron-build.yml` | Delete (redundant) |

