

# Fix: Desktop Release Workflow YAML Indentation

## Problem
The `.github/workflows/desktop-release.yml` file has broken YAML indentation in the **macOS** and **Linux** build jobs. Specifically:
- Lines 89-94 (macOS): The `- name: Install Electron dependencies` and `- name: Build macOS app` steps have mixed indentation (some lines use 7 spaces instead of 6, and some use 8 instead of 8). This makes the YAML invalid.
- Lines 138-144 (Linux): Same indentation issue.

GitHub Actions silently rejects invalid YAML — the workflow appears but has "no workload to run."

## Fix
Rewrite the entire workflow file with consistent 2-space indentation throughout. All step blocks must align at exactly 6 spaces (3 levels: jobs → job-name → steps → step items).

## File to Modify

| File | Change |
|------|--------|
| `.github/workflows/desktop-release.yml` | Fix indentation on lines 89-95 (macOS) and 139-144 (Linux) to use consistent spacing |

### Specific fixes:

**macOS section (lines 88-96)** — normalize indentation:
```yaml
      - name: Copy web build to electron
        run: |
          mkdir -p electron/app
          mkdir -p electron/app/icons
          cp -r dist/* electron/app/
          cp public/app-icon-1024.png electron/app/icons/appIcon.png

      - name: Install Electron dependencies
        working-directory: ./electron
        run: npm install

      - name: Build macOS app
        working-directory: ./electron
        run: npx electron-builder --mac --publish always
```

**Linux section (lines 138-146)** — same fix, normalize indentation.

No other files need changes. This is purely a whitespace/formatting fix that will make the workflow parseable by GitHub Actions.

