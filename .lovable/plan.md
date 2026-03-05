

# Fix: Windows Build — JPEG Masquerading as PNG

## Root Cause

The file `public/app-icon-1024.png` has a `.png` extension but is actually a **JPEG** file. The `file` command on CI detects it as "JPEG image data", so `png-to-ico` fails, the `magick` fallback fails on Windows (ImageMagick not reliably available), and the build exits with code 4.

Lovable's text-based file tools cannot create valid binary PNG files. The icon visible in the preview looks correct visually, but the underlying format is JPEG, not PNG.

## Plan

### 1. Fix the workflow to convert JPEG-to-PNG first, then PNG-to-ICO

Instead of relying on a valid PNG being committed, add a step that uses ImageMagick (`magick` on Windows runners) to **re-encode** the source file as a true PNG before converting to ICO. This handles both JPEG and PNG inputs. If `magick` is unavailable, use `npx sharp-cli` (a Node.js image tool) as fallback.

**File: `.github/workflows/desktop-release.yml`** — Replace the "Copy web build to electron" step (lines 40-51):

```yaml
      - name: Copy web build to electron
        run: |
          mkdir -p electron/app
          mkdir -p electron/app/icons
          cp -r dist/* electron/app/

          # Ensure we have a valid PNG regardless of source format
          echo "Source icon format:"
          file public/app-icon-1024.png

          # Install sharp-cli to handle any image format
          npm install --global sharp-cli

          # Convert source to guaranteed PNG (works for JPEG, WebP, etc.)
          npx sharp -i public/app-icon-1024.png -o electron/app/icons/appIcon.png --format png

          # Convert PNG to ICO for Windows
          npm install --global png-to-ico
          png-to-ico electron/app/icons/appIcon.png > electron/app/icons/appIcon.ico

          echo "Generated icon files:"
          file electron/app/icons/appIcon.png
          file electron/app/icons/appIcon.ico
        shell: bash

      - name: Verify icon files exist
        run: |
          if [ ! -f electron/app/icons/appIcon.ico ]; then
            echo "ERROR: appIcon.ico was not generated. Cannot build Windows installer."
            exit 1
          fi
          if [ ! -f electron/app/icons/appIcon.png ]; then
            echo "ERROR: appIcon.png was not generated."
            exit 1
          fi
        shell: bash
```

### 2. Remove the "Validate icon file" step (line 36-38)

Replace it with the verification step above which is more actionable.

### 3. No changes needed to `electron/package.json`

The NSIS icon references already point to `.ico` (fixed in prior edit). Mac/Linux still use `.png` which will now be a real PNG after the `sharp` conversion.

## Files to Modify

| File | Change |
|------|--------|
| `.github/workflows/desktop-release.yml` | Replace icon copy/convert step with `sharp-cli` conversion + `png-to-ico`, add verification step, remove old validate step |

## Why This Works

- `sharp-cli` is a Node.js tool (no OS dependency) that reads JPEG/PNG/WebP and outputs a guaranteed-format PNG
- `png-to-ico` then gets a real PNG and produces a valid `.ico`
- Build fails fast with a clear error if either step fails
- macOS and Linux builds are unaffected (they only need the `.png` which is also fixed)

