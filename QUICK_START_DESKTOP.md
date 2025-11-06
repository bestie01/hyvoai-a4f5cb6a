# Quick Start - Desktop App

Get your Hyvo Stream Studio desktop app running in 5 minutes!

## 🚀 Super Quick Setup

### Option 1: Automated Setup (Recommended)

**Windows:**
```bash
electron-setup.bat
```

**macOS/Linux:**
```bash
chmod +x electron-setup.sh
./electron-setup.sh
```

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Add Electron platform (first time only)
npx cap add electron

# 3. Build and sync
npm run build
npx cap sync electron

# 4. Install Electron dependencies
cd electron
npm install
npm install --save-dev electron-builder
```

## 🎯 Run Development Version

```bash
cd electron
npm start
```

The app will launch on your desktop!

## 📦 Build Production Installers

### Windows Installer

```bash
cd electron
npm run build:win
```

**Output:** `electron/dist/Hyvo Stream Studio Setup 1.0.0.exe`

### macOS Installer

```bash
cd electron
npm run build:mac
```

**Output:** `electron/dist/Hyvo Stream Studio-1.0.0.dmg`

### Linux Installer

```bash
cd electron
npm run build:linux
```

**Output:** `electron/dist/Hyvo Stream Studio-1.0.0.AppImage`

## 📋 Before Building, Add This to `electron/package.json`

```json
{
  "scripts": {
    "start": "electron .",
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
      "target": ["nsis"],
      "icon": "app/icons/appIcon.png"
    },
    "mac": {
      "target": ["dmg"],
      "category": "public.app-category.video",
      "icon": "app/icons/appIcon.png"
    },
    "linux": {
      "target": ["AppImage"],
      "category": "Video",
      "icon": "app/icons/appIcon.png"
    }
  }
}
```

## 🎨 Custom App Icon

Replace the default icon:
1. Create a 1024x1024 PNG icon
2. Place it at `electron/app/icons/appIcon.png`
3. Rebuild the app

## 📱 Distribution

After building:

1. **Test the installer** on a clean machine
2. **Copy to public/downloads/**
   ```bash
   cp electron/dist/*.exe public/downloads/
   cp electron/dist/*.dmg public/downloads/
   cp electron/dist/*.AppImage public/downloads/
   ```
3. **Deploy your web app** (the download page will now work!)

## 🐛 Troubleshooting

### "electron-builder not found"
```bash
cd electron
npm install --save-dev electron-builder
```

### "Icon not found"
Create a placeholder:
```bash
mkdir -p electron/app/icons
# Add a 1024x1024 PNG icon to electron/app/icons/appIcon.png
```

### Build fails on Windows
```bash
npm install --global windows-build-tools
```

### Build fails on macOS
```bash
xcode-select --install
```

## 📚 Full Documentation

- **Complete Build Guide:** See `BUILD_RELEASE.md`
- **Desktop Guide:** See `DESKTOP_BUILD.md`
- **Streaming Features:** See `STREAMING_STUDIO_GUIDE.md`

## 🎉 You're Ready!

Your desktop app is configured and ready to build. Follow the steps above to create professional installers for Windows, macOS, and Linux!

---

**Need help?** Check the troubleshooting sections in BUILD_RELEASE.md or post in our community Discord.
