# Desktop Installer Instructions

## How to Build and Place Installers Here

After building your desktop app with Electron Builder, copy the installers to this directory.

### Step 1: Build the Installers

```bash
# Build web assets first
npm run build
npx cap sync electron

# Navigate to electron directory
cd electron

# Build for your platform
npm run build:win    # Windows
npm run build:mac    # macOS  
npm run build:linux  # Linux
```

### Step 2: Copy Installers Here

After building, copy the installers from `electron/dist/` to this directory:

**Windows:**
```bash
cp "electron/dist/Hyvo Stream Studio Setup 1.0.0.exe" public/downloads/Hyvo-Stream-Studio-Setup-1.0.0.exe
```

**macOS:**
```bash
cp "electron/dist/Hyvo Stream Studio-1.0.0.dmg" public/downloads/Hyvo-Stream-Studio-1.0.0.dmg
```

**Linux:**
```bash
cp "electron/dist/Hyvo Stream Studio-1.0.0.AppImage" public/downloads/Hyvo-Stream-Studio-1.0.0.AppImage
```

### Step 3: Test the Download Page

1. Run your dev server: `npm run dev`
2. Visit: `http://localhost:8080/download`
3. Click the download buttons to test

### File Naming Convention

Use this format for consistency:
- Windows: `Hyvo-Stream-Studio-Setup-{version}.exe`
- macOS: `Hyvo-Stream-Studio-{version}.dmg`
- Linux: `Hyvo-Stream-Studio-{version}.AppImage`

### For Production

For production deployments, consider hosting large installer files on:
- **GitHub Releases** (Free, 2GB per file limit)
- **AWS S3 + CloudFront** (Paid, scalable CDN)
- **DigitalOcean Spaces** (Paid, simple setup)
- **Cloudflare R2** (Paid, cheaper than S3)

Then update the `downloadUrl` in `src/pages/Download.tsx` to point to your CDN URLs.

### Current Files

Place your built installers here:
- [ ] `Hyvo-Stream-Studio-Setup-1.0.0.exe` (Windows)
- [ ] `Hyvo-Stream-Studio-1.0.0.dmg` (macOS)
- [ ] `Hyvo-Stream-Studio-1.0.0.AppImage` (Linux)

### Security Note

⚠️ **For production apps:**
- Code sign your installers
- Use HTTPS for downloads
- Verify checksums
- Consider auto-update mechanisms

See `BUILD_RELEASE.md` for complete code signing instructions.
