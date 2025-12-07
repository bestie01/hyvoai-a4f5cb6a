# Code Signing Guide for Hyvo Stream Studio

This guide explains how to set up code signing for the Hyvo Stream Studio desktop application to ensure users can install it without security warnings.

## Why Code Signing?

Code signing:
- Prevents "Unknown developer" warnings on macOS
- Prevents "Windows protected your PC" warnings on Windows
- Proves the software hasn't been tampered with
- Builds user trust

## Windows Code Signing

### Option 1: EV Code Signing Certificate (Recommended for Production)

1. **Purchase an EV Code Signing Certificate** from a trusted Certificate Authority:
   - DigiCert (~$410/year)
   - Sectigo (~$319/year)
   - GlobalSign (~$379/year)

2. **Set up GitHub Secrets**:
   ```
   WIN_CSC_LINK: Base64 encoded .pfx certificate
   WIN_CSC_KEY_PASSWORD: Certificate password
   ```

3. **Update electron-builder config** in `electron/package.json`:
   ```json
   "win": {
     "sign": "./sign.js",
     "signingHashAlgorithms": ["sha256"]
   }
   ```

### Option 2: Self-Signed Certificate (Development Only)

```powershell
# Create self-signed certificate (PowerShell as Admin)
New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=Hyvo Stream Studio" -CertStoreLocation Cert:\CurrentUser\My
```

## macOS Code Signing & Notarization

### Prerequisites

1. **Apple Developer Account** ($99/year)
2. **Developer ID Application Certificate**
3. **Developer ID Installer Certificate** (for pkg)

### Setup Steps

1. **Create certificates** in Apple Developer Portal:
   - Go to Certificates, Identifiers & Profiles
   - Create "Developer ID Application" certificate
   - Create "Developer ID Installer" certificate

2. **Set up GitHub Secrets**:
   ```
   APPLE_ID: your@email.com
   APPLE_ID_PASSWORD: app-specific password
   APPLE_TEAM_ID: Your team ID
   CSC_LINK: Base64 encoded .p12 certificate
   CSC_KEY_PASSWORD: Certificate password
   ```

3. **Generate App-Specific Password**:
   - Go to appleid.apple.com
   - Sign in → Security → App-Specific Passwords
   - Generate a password for "Hyvo Notarization"

4. **Update electron-builder config**:
   ```json
   "mac": {
     "hardenedRuntime": true,
     "gatekeeperAssess": false,
     "entitlements": "build/entitlements.mac.plist",
     "entitlementsInherit": "build/entitlements.mac.plist",
     "notarize": {
       "teamId": "${APPLE_TEAM_ID}"
     }
   }
   ```

5. **Create entitlements file** at `electron/build/entitlements.mac.plist`:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   <dict>
     <key>com.apple.security.cs.allow-jit</key>
     <true/>
     <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
     <true/>
     <key>com.apple.security.cs.disable-library-validation</key>
     <true/>
     <key>com.apple.security.device.audio-input</key>
     <true/>
     <key>com.apple.security.device.camera</key>
     <true/>
   </dict>
   </plist>
   ```

## GitHub Actions Workflow Update

Update `.github/workflows/electron-build.yml`:

```yaml
jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    
    steps:
      # ... existing steps ...
      
      - name: Build and Sign (Windows)
        if: matrix.os == 'windows-latest'
        env:
          WIN_CSC_LINK: ${{ secrets.WIN_CSC_LINK }}
          WIN_CSC_KEY_PASSWORD: ${{ secrets.WIN_CSC_KEY_PASSWORD }}
        run: npm run build:win
        
      - name: Build, Sign and Notarize (macOS)
        if: matrix.os == 'macos-latest'
        env:
          APPLE_ID: ${{ secrets.APPLE_ID }}
          APPLE_ID_PASSWORD: ${{ secrets.APPLE_ID_PASSWORD }}
          APPLE_TEAM_ID: ${{ secrets.APPLE_TEAM_ID }}
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
        run: npm run build:mac
```

## Linux Signing (Optional)

Linux doesn't require code signing, but you can sign with GPG:

```bash
# Generate GPG key
gpg --full-generate-key

# Sign the AppImage
gpg --detach-sign Hyvo-Stream-Studio.AppImage
```

## Verification

### Windows
```powershell
signtool verify /pa "Hyvo-Stream-Studio-Setup.exe"
```

### macOS
```bash
codesign --verify --deep --strict "Hyvo Stream Studio.app"
spctl -a -vvv "Hyvo Stream Studio.app"
```

## Cost Summary

| Platform | Cost | Validity |
|----------|------|----------|
| Windows EV Certificate | $319-$410 | 1-3 years |
| Apple Developer Program | $99 | 1 year |
| **Total (minimum)** | **$418** | **1 year** |

## Alternative: Free Code Signing

For open-source projects:
- **SignPath.io** offers free code signing for open-source projects
- Apply at: https://about.signpath.io/product/open-source

## Troubleshooting

### "App is damaged" on macOS
```bash
xattr -cr "/Applications/Hyvo Stream Studio.app"
```

### Windows SmartScreen warning persists
- EV certificates have immediate SmartScreen reputation
- Standard certificates need to build reputation over time (~90 days, ~1000 installs)

### Notarization fails
- Check Apple's notarization log for detailed errors
- Ensure hardened runtime is enabled
- Verify entitlements are correct
