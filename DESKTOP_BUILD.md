# Desktop App Build Guide for Hyvo Stream Studio

This guide explains how to build Hyvo Stream Studio as a desktop application using Electron via Capacitor.

## Prerequisites

- Node.js (v18 or higher)
- Git
- NPM or Yarn
- For macOS builds: Xcode Command Line Tools
- For Windows builds: Windows Build Tools (optional, improves compatibility)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd hyvo-stream-assist
npm install
```

### 2. Add Electron Platform (First Time Only)

```bash
npx cap add electron
```

### 3. Build Web Assets

```bash
npm run build
```

### 4. Sync to Electron

```bash
npx cap sync electron
```

### 5. Run Desktop App in Development

```bash
npx cap open electron
```

This opens the Electron project. Then run:

```bash
cd electron
npm install
npm start
```

## Building Production Installers

### Setup Electron Builder (First Time)

Navigate to the electron directory and ensure electron-builder is installed:

```bash
cd electron
npm install --save-dev electron-builder
```

### Configure electron/package.json

Add these build scripts to `electron/package.json`:

```json
{
  "scripts": {
    "build:win": "electron-builder --windows",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux"
  },
  "build": {
    "appId": "app.lovable.016291d698de4ca99131b756a44a0c02",
    "productName": "Hyvo Stream Studio",
    "directories": {
      "output": "dist"
    },
    "files": [
      "app/**/*",
      "capacitor.config.json"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "app/icons/appIcon.png"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.video",
      "icon": "app/icons/appIcon.png"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Video",
      "icon": "app/icons/appIcon.png"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### Windows Installer

```bash
cd electron
npm run build:win
```

**Output:** 
- `electron/dist/Hyvo Stream Studio Setup.exe` (Installer)
- `electron/dist/Hyvo Stream Studio.exe` (Portable)

### macOS Installer

```bash
cd electron
npm run build:mac
```

**Output:**
- `electron/dist/Hyvo Stream Studio.dmg`
- `electron/dist/Hyvo Stream Studio-mac.zip`

### Linux Installer

```bash
cd electron
npm run build:linux
```

**Output:**
- `electron/dist/Hyvo Stream Studio.AppImage`
- `electron/dist/hyvo-stream-studio_1.0.0_amd64.deb`

## Configuration

The desktop app configuration is in `capacitor.config.ts`:

```typescript
{
  appId: 'app.lovable.016291d698de4ca99131b756a44a0c02',
  appName: 'hyvo-stream-assist',
  webDir: 'dist'
}
```

## Features Available in Desktop

- ✅ Full streaming capabilities (Twitch, YouTube)
- ✅ AI-powered tools
- ✅ Multi-streaming
- ✅ Analytics dashboard
- ✅ Scene management
- ✅ Pro features (with subscription)
- ✅ Dark/Light mode
- ✅ Native file system access
- ✅ System notifications
- ✅ Hardware acceleration

## Development Mode

For faster development, use hot-reload:

```bash
npm run dev
```

Then in another terminal:

```bash
npx cap run electron
```

## Troubleshooting

### "Command not found: electron"

Make sure you've run `npx cap sync electron` first.

### Build fails on Windows

Install Windows Build Tools:
```bash
npm install --global windows-build-tools
```

### Build fails on macOS

Make sure Xcode Command Line Tools are installed:
```bash
xcode-select --install
```

## Distribution

### Code Signing (macOS)

1. Get an Apple Developer account
2. Create a Developer ID Application certificate
3. Update `electron/package.json` with your certificate details

### Code Signing (Windows)

1. Purchase a code signing certificate
2. Install the certificate
3. Update `electron/package.json` with certificate details

## Auto-Updates

To enable auto-updates, configure `electron-updater` in `electron/package.json`:

```json
{
  "build": {
    "publish": {
      "provider": "github",
      "owner": "your-username",
      "repo": "hyvo-stream-assist"
    }
  }
}
```

## Support

For issues or questions:
- Check the [Capacitor Electron docs](https://capacitorjs.com/docs/electron)
- Review the [Electron Builder docs](https://www.electron.build/)
- Visit our GitHub issues page

## Security

The desktop app includes:
- ✅ Secure credential storage
- ✅ HTTPS-only connections
- ✅ Content Security Policy
- ✅ No eval() usage
- ✅ Sandboxed renderer process
