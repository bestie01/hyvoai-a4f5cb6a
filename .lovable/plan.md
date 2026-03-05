

# Fix: Windows Build — Two Remaining Issues

## Problems (from build log screenshot)

1. **Invalid PNG file**: `public/app-icon-1024.png` is still not a valid PNG, so the `png-to-ico` path is skipped and the fallback runs
2. **ImageMagick `convert` fails on Windows**: The fallback uses `convert` which on Windows runners either doesn't exist or conflicts with a Windows system utility (`convert.exe` is a disk conversion tool). Error: `Invalid Parameter - 256x256`
3. **NSIS config references `.png`**: In `electron/package.json` lines 58-60, `installerIcon`, `uninstallerIcon`, and `installerHeaderIcon` all point to `app/icons/appIcon.png` — NSIS requires `.ico`

## Fixes

### 1. Workflow: Replace ImageMagick fallback with `magick` (modern ImageMagick on Windows)

On `windows-latest` runners, ImageMagick 7 is installed as `magick`, not `convert`. But more reliably, we should use PowerShell to download a simple `.ico` or generate one via npm. The simplest fix: use `npx png-to-ico` with the uploaded user image, and if that fails, download a generic icon.

**File: `.github/workflows/desktop-release.yml`** — Replace the "Copy web build to electron" step (lines 40-54) with:

```yaml
      - name: Copy web build to electron
        run: |
          mkdir -p electron/app
          mkdir -p electron/app/icons
          cp -r dist/* electron/app/
          cp public/app-icon-1024.png electron/app/icons/appIcon.png
          npm install --global png-to-ico
          png-to-ico public/app-icon-1024.png > electron/app/icons/appIcon.ico || {
            echo "png-to-ico failed, generating fallback ico via magick"
            magick -size 256x256 xc:"#6366f1" -fill white -gravity center \
              -pointsize 80 -annotate 0 "H" electron/app/icons/appIcon.ico
          }
        shell: bash
```

Key change: use `magick` instead of `convert` for Windows compatibility, and use `||` fallback instead of `if/grep`.

### 2. Fix NSIS icon references in `electron/package.json`

**File: `electron/package.json`** — Change lines 58-60 from `.png` to `.ico`:

```json
"nsis": {
  "oneClick": false,
  "allowToChangeInstallationDirectory": true,
  "installerIcon": "app/icons/appIcon.ico",
  "uninstallerIcon": "app/icons/appIcon.ico",
  "installerHeaderIcon": "app/icons/appIcon.ico"
}
```

### 3. Save uploaded logo as `public/app-icon-1024.png`

The user uploaded a valid Hyvo logo PNG (`ChatGPT_Image_Mar_5_2026_05_21_01_PM-2.png`). Copy it to `public/app-icon-1024.png` so the build has a real PNG to convert.

## Files to Modify

| File | Change |
|------|--------|
| `public/app-icon-1024.png` | Replace with uploaded Hyvo logo |
| `electron/package.json` | Change NSIS icon refs from `.png` to `.ico` |
| `.github/workflows/desktop-release.yml` | Fix fallback: use `magick` instead of `convert`, simplify logic |

