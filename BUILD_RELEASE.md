# Complete Build & Release Guide

## Step-by-Step Release Process

### 1. Prepare for Build

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build web assets
npm run build
```

### 2. Initialize Electron (First Time Only)

```bash
# Add Electron platform
npx cap add electron

# Sync files
npx cap sync electron

# Navigate to electron directory
cd electron

# Install electron dependencies
npm install

# Install electron-builder
npm install --save-dev electron-builder
```

### 3. Configure Electron Build

Create/update `electron/package.json` with build configuration:

```json
{
  "name": "hyvo-stream-studio",
  "version": "1.0.0",
  "description": "Professional streaming studio for content creators",
  "main": "index.js",
  "scripts": {
    "start": "electron .",
    "build:win": "electron-builder --windows",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux",
    "build:all": "electron-builder --windows --mac --linux"
  },
  "build": {
    "appId": "app.lovable.016291d698de4ca99131b756a44a0c02",
    "productName": "Hyvo Stream Studio",
    "directories": {
      "output": "dist"
    },
    "files": [
      "app/**/*",
      "capacitor.config.json",
      "index.js"
    ],
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ],
      "icon": "app/icons/appIcon.png"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.video",
      "icon": "app/icons/appIcon.png",
      "hardenedRuntime": true,
      "gatekeeperAssess": false
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Video",
      "icon": "app/icons/appIcon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "allowElevation": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "Hyvo Stream Studio",
      "perMachine": false,
      "displayLanguageSelector": false
    },
    "dmg": {
      "contents": [
        {
          "x": 130,
          "y": 220
        },
        {
          "x": 410,
          "y": 220,
          "type": "link",
          "path": "/Applications"
        }
      ]
    }
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1"
  }
}
```

### 4. Build Desktop Installers

From the root directory, ensure web assets are built:

```bash
npm run build
npx cap sync electron
```

Then navigate to electron directory and build:

#### Windows

```bash
cd electron
npm run build:win
```

**Output Files:**
- `electron/dist/Hyvo Stream Studio Setup 1.0.0.exe` (~120MB installer)
- `electron/dist/Hyvo Stream Studio 1.0.0.exe` (~115MB portable)

#### macOS

```bash
cd electron
npm run build:mac
```

**Output Files:**
- `electron/dist/Hyvo Stream Studio-1.0.0.dmg` (~125MB)
- `electron/dist/Hyvo Stream Studio-1.0.0-mac.zip` (~120MB)

#### Linux

```bash
cd electron
npm run build:linux
```

**Output Files:**
- `electron/dist/Hyvo Stream Studio-1.0.0.AppImage` (~135MB)
- `electron/dist/hyvo-stream-studio_1.0.0_amd64.deb` (~120MB)

#### All Platforms (requires macOS)

```bash
cd electron
npm run build:all
```

### 5. Test Installers

Before distribution, test each installer:

**Windows:**
- Run the .exe installer
- Check Start Menu shortcut
- Check Desktop shortcut
- Verify app launches correctly
- Test uninstaller

**macOS:**
- Mount the .dmg
- Drag to Applications
- Launch from Applications
- Check for security warnings
- Test first-run experience

**Linux:**
- Make AppImage executable: `chmod +x Hyvo-Stream-Studio-1.0.0.AppImage`
- Run AppImage
- Install .deb: `sudo dpkg -i hyvo-stream-studio_1.0.0_amd64.deb`
- Test launch from application menu

### 6. Prepare for Distribution

#### Copy installers to public directory:

```bash
# From project root
mkdir -p public/downloads

# Copy Windows installer
cp electron/dist/Hyvo\ Stream\ Studio\ Setup\ 1.0.0.exe public/downloads/Hyvo-Stream-Studio-Setup-1.0.0.exe

# Copy macOS installer
cp electron/dist/Hyvo\ Stream\ Studio-1.0.0.dmg public/downloads/Hyvo-Stream-Studio-1.0.0.dmg

# Copy Linux AppImage
cp electron/dist/Hyvo\ Stream\ Studio-1.0.0.AppImage public/downloads/Hyvo-Stream-Studio-1.0.0.AppImage
```

#### Update Download URLs

Update `src/pages/Download.tsx` with actual download URLs:

```typescript
const platforms = [
  {
    name: "Windows",
    icon: Monitor,
    version: "1.0.0",
    size: "120 MB",
    requirements: "Windows 10/11 (64-bit)",
    downloadUrl: "/downloads/Hyvo-Stream-Studio-Setup-1.0.0.exe",
  },
  {
    name: "macOS",
    icon: Apple,
    version: "1.0.0",
    size: "125 MB",
    requirements: "macOS 11.0 or later",
    downloadUrl: "/downloads/Hyvo-Stream-Studio-1.0.0.dmg",
  },
  // ... mobile coming soon
];
```

### 7. Host Files (Production)

For production, host large installer files on a CDN or file hosting service:

**Options:**
1. **GitHub Releases** (Free, up to 2GB per file)
   - Tag a release
   - Upload installers as release assets
   - Get direct download URLs

2. **AWS S3 + CloudFront** (Paid, scalable)
   - Upload to S3 bucket
   - Serve via CloudFront CDN
   - Update URLs in Download.tsx

3. **DigitalOcean Spaces** (Paid, simple)
   - Upload to Spaces
   - Enable CDN
   - Use direct URLs

4. **Cloudflare R2** (Cheaper than S3)
   - Upload files
   - Configure public access
   - Use provided URLs

### 8. Code Signing (Optional but Recommended)

#### Windows

1. Purchase code signing certificate (~$100-300/year)
2. Install certificate
3. Update electron-builder config:

```json
"win": {
  "certificateFile": "path/to/cert.pfx",
  "certificatePassword": "your-password",
  "signingHashAlgorithms": ["sha256"],
  "sign": "./sign.js"
}
```

#### macOS

1. Enroll in Apple Developer Program ($99/year)
2. Create Developer ID Application certificate
3. Update config:

```json
"mac": {
  "identity": "Developer ID Application: Your Name (TEAMID)",
  "hardenedRuntime": true,
  "gatekeeperAssess": false,
  "entitlements": "build/entitlements.mac.plist"
}
```

4. Notarize after building:

```bash
xcrun notarytool submit "Hyvo Stream Studio-1.0.0.dmg" \
  --apple-id "your@email.com" \
  --password "app-specific-password" \
  --team-id "TEAMID" \
  --wait
```

### 9. Auto-Updates (Optional)

Configure electron-updater for automatic updates:

```json
"build": {
  "publish": {
    "provider": "github",
    "owner": "your-username",
    "repo": "hyvo-stream-studio"
  }
}
```

Add update checking code to `electron/index.js`:

```javascript
const { autoUpdater } = require('electron-updater');

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
});
```

### 10. Deploy Web Version

Deploy the web version alongside desktop downloads:

```bash
# Build web version
npm run build

# Deploy to Lovable (or your hosting)
# Click Publish button in Lovable UI
```

## Troubleshooting

### Build Fails on Windows

```bash
# Install Windows Build Tools
npm install --global windows-build-tools

# Or use Visual Studio Build Tools
# Download from: https://visualstudio.microsoft.com/downloads/
```

### Build Fails on macOS

```bash
# Install Xcode Command Line Tools
xcode-select --install

# Accept Xcode license
sudo xcodebuild -license accept
```

### "electron-builder not found"

```bash
cd electron
npm install --save-dev electron-builder
```

### Large File Size

Installers include entire Chromium engine (~100-150MB is normal). To reduce:

1. Enable asar compression
2. Exclude unnecessary files
3. Use `files` whitelist in build config

### Permission Errors on Linux

```bash
# Make AppImage executable
chmod +x Hyvo-Stream-Studio-1.0.0.AppImage

# Fix deb permissions
sudo chown root:root hyvo-stream-studio_1.0.0_amd64.deb
```

## Release Checklist

- [ ] Update version number in `package.json`
- [ ] Update version in `electron/package.json`
- [ ] Build web assets (`npm run build`)
- [ ] Sync to Electron (`npx cap sync electron`)
- [ ] Build Windows installer
- [ ] Build macOS installer
- [ ] Build Linux installer
- [ ] Test each installer
- [ ] Code sign installers (if applicable)
- [ ] Upload to hosting/CDN
- [ ] Update download URLs in code
- [ ] Deploy web version
- [ ] Create GitHub release with notes
- [ ] Announce release

## Support

For issues during build:
- Check [Electron Builder docs](https://www.electron.build/)
- Check [Capacitor Electron docs](https://capacitorjs.com/docs/electron)
- Review [Electron docs](https://www.electronjs.org/docs)
- Post in Lovable Discord community

## Security Notes

- Never commit code signing certificates
- Store passwords in environment variables
- Use `.gitignore` for sensitive files
- Enable CSP in production
- Keep Electron updated for security patches
