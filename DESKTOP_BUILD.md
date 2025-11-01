# Desktop App Build Guide for Hyvo.ai

This guide explains how to build Hyvo.ai as a desktop application using Electron via Capacitor.

## Prerequisites

- Node.js (v18 or higher)
- Git
- NPM or Yarn

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd hyvo-stream-assist
npm install
```

### 2. Build Web Assets

```bash
npm run build
```

### 3. Sync Electron Platform

```bash
npx cap sync electron
```

### 4. Run Desktop App

```bash
npx cap open electron
```

This will open the Electron project in your default editor. You can then run the app from there or use:

```bash
cd electron
npm start
```

## Building for Production

### Windows

```bash
cd electron
npm run electron:build-windows
```

This creates an executable in `electron/dist/`.

### macOS

```bash
cd electron
npm run electron:build-mac
```

This creates a `.app` bundle in `electron/dist/`.

### Linux

```bash
cd electron
npm run electron:build-linux
```

This creates an AppImage in `electron/dist/`.

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
