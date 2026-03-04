

# Fix: Invalid `public/app-icon-1024.png` for Windows Build

## Problem
The Windows build fails because `public/app-icon-1024.png` exists but is not a valid PNG file. The `png-to-ico` tool cannot convert it, causing the NSIS installer build to fail. The file is likely corrupt or in the wrong format despite having a `.png` extension.

## Fix

### Option A: Replace the icon file
Replace `public/app-icon-1024.png` with a valid 1024×1024 PNG image. You can:
1. Re-export your app icon from your design tool as a proper PNG
2. Upload a new valid PNG file to `public/app-icon-1024.png`

### Option B: Add a validation step to the workflow
Add a file validation step before the conversion in `.github/workflows/desktop-release.yml` to catch this early and provide a clear error:

```yaml
- name: Validate icon file
  run: file public/app-icon-1024.png
  shell: bash
```

## Recommendation
The simplest fix is to **re-upload a valid 1024×1024 PNG icon** to `public/app-icon-1024.png`. Once the file is a real PNG, the `png-to-ico` conversion and the full Windows build will succeed. You can upload a new image directly in Lovable or commit one via Git.

