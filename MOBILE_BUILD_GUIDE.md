# Hyvo Stream Assist - Mobile & Desktop Build Guide

## Prerequisites

### For All Platforms
- Node.js 16+ installed
- Git installed and project cloned from GitHub

### iOS Build Requirements
- macOS computer
- Xcode 14+ installed
- Apple Developer Account ($99/year)
- CocoaPods installed (`sudo gem install cocoapods`)

### Android Build Requirements
- Android Studio installed
- Android SDK 29+
- Java JDK 11+

### Desktop Build Requirements
- Electron Builder
- Platform-specific build tools (varies by OS)

## Step 1: Prepare for Production Build

### 1.1 Update Capacitor Config
Remove or comment out the development server URL in `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.016291d698de4ca99131b756a44a0c02',
  appName: 'hyvo-stream-assist',
  webDir: 'dist',
  // Remove or comment out the server block for production:
  // server: {
  //   url: 'https://016291d6-98de-4ca9-9131-b756a44a0c02.lovableproject.com?forceHideBadge=true',
  //   cleartext: true
  // },
  bundledWebRuntime: false
};
```

### 1.2 Install Dependencies
```bash
npm install
```

### 1.3 Build Web Assets
```bash
npm run build
```

## Step 2: iOS Build Process

### 2.1 Add iOS Platform (First Time Only)
```bash
npx cap add ios
```

### 2.2 Sync Web Assets to iOS
```bash
npx cap sync ios
```

### 2.3 Open in Xcode
```bash
npx cap open ios
```

### 2.4 Configure Signing in Xcode
1. Select the project in the left sidebar
2. Select the target "App"
3. Go to "Signing & Capabilities" tab
4. Select your Team (requires Apple Developer Account)
5. Xcode will automatically create a provisioning profile

### 2.5 Configure App Icons & Launch Screen
1. In Xcode, navigate to `App/Assets.xcassets`
2. Add icon images in required sizes:
   - 20x20, 29x29, 40x40, 58x58, 60x60, 76x76, 80x80, 87x87, 120x120, 152x152, 167x167, 180x180, 1024x1024
3. Add splash screen images

### 2.6 Test on Simulator
1. Select a simulator from the device dropdown
2. Click the Play button or press Cmd+R
3. Test all features thoroughly

### 2.7 Archive for App Store
1. Select "Any iOS Device" from device dropdown
2. Product → Archive
3. Once archived, click "Distribute App"
4. Choose "App Store Connect"
5. Follow the wizard to upload

### 2.8 App Store Submission
1. Go to https://appstoreconnect.apple.com
2. Create a new app listing
3. Fill in:
   - App name, description, keywords
   - Screenshots (6.5" and 5.5" sizes required)
   - Privacy Policy URL
   - Support URL
   - App category
4. Submit for review (typically 1-2 weeks)

## Step 3: Android Build Process

### 3.1 Add Android Platform (First Time Only)
```bash
npx cap add android
```

### 3.2 Sync Web Assets to Android
```bash
npx cap sync android
```

### 3.3 Open in Android Studio
```bash
npx cap open android
```

### 3.4 Configure Signing
1. In Android Studio, go to Build → Generate Signed Bundle/APK
2. Create a new keystore:
   - Key store path: `android/app/release.keystore`
   - Password: (create a strong password)
   - Key alias: `hyvo-release`
   - Key password: (same as keystore)
3. Save keystore details securely - you'll need them for updates!

### 3.5 Configure App Icons
1. Right-click `res` folder → New → Image Asset
2. Select "Launcher Icons (Adaptive and Legacy)"
3. Choose your icon file
4. Generate icons for all densities

### 3.6 Build Release APK/AAB
1. Build → Generate Signed Bundle/APK
2. Select "Android App Bundle" (preferred) or "APK"
3. Choose your keystore
4. Select "release" build variant
5. Click Finish

### 3.7 Test the Release Build
```bash
# Install APK on connected device
adb install app/release/app-release.apk
```

### 3.8 Google Play Console Submission
1. Go to https://play.google.com/console
2. Create a new app
3. Fill in Store Listing:
   - Title, short description, full description
   - App icon (512x512 PNG)
   - Feature graphic (1024x500)
   - Screenshots (phone and tablet)
   - Privacy Policy URL
4. Complete Content Rating questionnaire
5. Set pricing and distribution
6. Upload your AAB file
7. Submit for review (typically 1-3 days)

## Step 4: Desktop Build (Electron)

### 4.1 Sync Electron
```bash
npx cap sync electron
```

### 4.2 Navigate to Electron Directory
```bash
cd electron
npm install
```

### 4.3 Configure electron-builder
Create or update `electron/package.json`:

```json
{
  "build": {
    "appId": "app.lovable.016291d698de4ca99131b756a44a0c02",
    "productName": "Hyvo Stream Assist",
    "directories": {
      "output": "dist"
    },
    "files": [
      "app/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.utilities"
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "linux": {
      "target": ["AppImage", "deb"]
    }
  }
}
```

### 4.4 Build for Your Platform

**macOS:**
```bash
npm run build:mac
```

**Windows:**
```bash
npm run build:win
```

**Linux:**
```bash
npm run build:linux
```

Built files will be in `electron/dist/`

## Step 5: Testing Checklist

### Functionality Testing
- [ ] User authentication works
- [ ] Stream scheduling creates and displays correctly
- [ ] Polls create, vote, and display results
- [ ] Settings save and persist
- [ ] Donations process correctly (test mode)
- [ ] Camera and microphone permissions work
- [ ] Push notifications deliver
- [ ] File upload/download works
- [ ] AI features respond correctly

### Platform-Specific Testing
- [ ] iOS: Test on multiple device sizes (iPhone, iPad)
- [ ] Android: Test on multiple Android versions
- [ ] Desktop: Test window resizing, minimize/maximize
- [ ] All: Test offline functionality
- [ ] All: Test background/foreground transitions

### Performance Testing
- [ ] App launches in < 3 seconds
- [ ] No memory leaks during extended use
- [ ] Smooth 60fps scrolling
- [ ] Network requests complete within reasonable time

## Step 6: Deployment Best Practices

### Version Management
- Use semantic versioning (e.g., 1.0.0)
- Update version in:
  - `package.json`
  - `capacitor.config.ts`
  - iOS: `Info.plist` (CFBundleShortVersionString)
  - Android: `build.gradle` (versionName, versionCode)

### Staged Rollout
1. Start with beta testing (TestFlight for iOS, Internal Testing for Android)
2. Collect feedback and fix critical bugs
3. Release to 10% of users
4. Monitor crash reports and reviews
5. Gradually increase to 100%

### Monitoring & Analytics
- Set up crash reporting (e.g., Sentry)
- Monitor user analytics
- Track feature usage
- Monitor API error rates

## Common Issues & Solutions

### iOS: "App Installation Failed"
- Check provisioning profile is valid
- Ensure bundle ID matches exactly
- Clean build folder (Cmd+Shift+K in Xcode)

### Android: "Installation Failed: INSTALL_FAILED_UPDATE_INCOMPATIBLE"
- Uninstall previous version first
- Check signing key matches previous release

### Electron: "Module not found"
- Ensure all dependencies are in `dependencies`, not `devDependencies`
- Run `npm install` in the electron directory

### Hot Reload Not Working
- Make sure you've removed the server URL from capacitor.config.ts for production

## Maintenance & Updates

### Regular Updates
- Monitor store reviews and respond to user feedback
- Fix critical bugs within 24-48 hours
- Release feature updates monthly
- Keep dependencies updated (run `npm audit` regularly)

### App Store Guidelines
- **iOS:** Review Apple's App Store Review Guidelines
- **Android:** Follow Google Play's Developer Policy
- Both platforms have strict rules about:
  - Privacy disclosures
  - In-app purchases
  - Content policies
  - Data collection

## Support Resources

- **Capacitor Docs:** https://capacitorjs.com/docs
- **Ionic Native:** https://ionicframework.com/docs/native
- **App Store Connect:** https://developer.apple.com/app-store-connect
- **Google Play Console:** https://support.google.com/googleplay/android-developer
- **Electron Builder:** https://www.electron.build

## Need Help?

If you encounter issues during the build process:
1. Check the official documentation for your platform
2. Search for the error message on Stack Overflow
3. Check GitHub issues for Capacitor
4. Ask for help in the Ionic/Capacitor Discord community
