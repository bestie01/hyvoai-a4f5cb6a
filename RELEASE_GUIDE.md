# 🚀 GitHub Release Quick Start Guide

## Automated Desktop Builds with Version Tags

This project uses GitHub Actions to automatically build and publish desktop installers when you push a version tag.

---

## How It Works

```
Push Tag → GitHub Actions → Build Windows/macOS/Linux → Create Release
```

When you push a tag like `v1.0.0`, GitHub Actions will:
1. ✅ Build the web assets
2. ✅ Create Windows `.exe` installer
3. ✅ Create macOS `.dmg` installer  
4. ✅ Create Linux `.AppImage` and `.deb` installers
5. ✅ Upload all installers to GitHub Releases
6. ✅ Generate release notes automatically

---

## Step-by-Step: Creating a Release

### 1. Update Version Numbers

Before creating a release, update version numbers in these files:

```bash
# package.json (root)
{
  "version": "1.0.0"
}

# electron/package.json
{
  "version": "1.0.0"
}
```

### 2. Commit Your Changes

```bash
git add .
git commit -m "Release v1.0.0 - Your release description"
git push origin main
```

### 3. Create and Push a Version Tag

```bash
# Create a tag (use semantic versioning: vMAJOR.MINOR.PATCH)
git tag v1.0.0

# Push the tag to GitHub
git push origin v1.0.0
```

### 4. Watch the Build

1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the "Build Electron Installers" workflow run
4. Build takes ~15-20 minutes

### 5. Check the Release

Once complete:
1. Go to **Releases** in your GitHub repository
2. Find the new release (e.g., v1.0.0)
3. Download links are automatically available

---

## Version Numbering Guide

Use [Semantic Versioning](https://semver.org/):

| Version | When to Use |
|---------|-------------|
| `v1.0.0` | First stable release |
| `v1.0.1` | Bug fixes only |
| `v1.1.0` | New features (backward compatible) |
| `v2.0.0` | Breaking changes |
| `v1.0.0-beta.1` | Pre-release version |

---

## Manual Workflow Trigger

You can also trigger builds manually without creating a tag:

1. Go to **Actions** → **Build Electron Installers**
2. Click **Run workflow**
3. Enter version number (e.g., `1.0.0`)
4. Click **Run workflow**

⚠️ **Note**: Manual triggers create artifacts but not releases.

---

## Common Commands

```bash
# List existing tags
git tag -l

# Delete a local tag (if you made a mistake)
git tag -d v1.0.0

# Delete a remote tag
git push origin --delete v1.0.0

# Create annotated tag with message
git tag -a v1.0.0 -m "Release 1.0.0 - Major streaming update"

# Push all tags at once
git push origin --tags
```

---

## Troubleshooting

### Build Failed?

1. Check the **Actions** tab for error logs
2. Common issues:
   - Missing dependencies: Ensure `npm ci` works locally
   - Build errors: Run `npm run build` locally first
   - Electron issues: Check `electron/package.json` is valid

### Release Not Created?

- Releases are only created for tags starting with `v`
- Ensure tag format is exactly: `v1.0.0` (not `1.0.0` or `V1.0.0`)

### Want to Re-run a Failed Build?

1. Go to **Actions** → Find the failed workflow
2. Click **Re-run all jobs**

---

## What Gets Built

| Platform | File | Description |
|----------|------|-------------|
| Windows | `Hyvo-Stream-Studio-Setup-1.0.0.exe` | NSIS Installer |
| macOS | `Hyvo-Stream-Studio-1.0.0.dmg` | Disk Image |
| macOS | `Hyvo-Stream-Studio-1.0.0-mac.zip` | ZIP Archive |
| Linux | `Hyvo-Stream-Studio-1.0.0.AppImage` | Universal Linux App |
| Linux | `hyvo-stream-studio_1.0.0_amd64.deb` | Debian Package |

---

## Auto-Updates

The app includes auto-update functionality:
- Checks for updates on app launch
- Checks every 4 hours while running
- Users are prompted to restart when updates are available

Auto-updates use GitHub Releases as the update source.

---

## Release Checklist

Before pushing a release tag:

- [ ] Test the app thoroughly
- [ ] Update version in `package.json`
- [ ] Update version in `electron/package.json`
- [ ] Update changelog/release notes
- [ ] Commit all changes
- [ ] Create and push the version tag
- [ ] Monitor the build in GitHub Actions
- [ ] Test downloaded installers
- [ ] Announce the release

---

## Example: Full Release Flow

```bash
# 1. Make sure you're on main branch with latest changes
git checkout main
git pull origin main

# 2. Update versions (edit files manually or use npm)
npm version patch  # Bumps 1.0.0 → 1.0.1

# 3. Push the commit and tag
git push origin main
git push origin v1.0.1

# 4. Done! Check GitHub Actions for build progress
```

---

## Need Help?

- Check [GitHub Actions documentation](https://docs.github.com/en/actions)
- Check [electron-builder documentation](https://www.electron.build/)
- Review the workflow file: `.github/workflows/electron-build.yml`
