# Version Sync 2.3.0 + Desktop JARVIS Command Center

## 1. Version sync to 2.3.0

- `package.json` → `"version": "2.3.0"`
- `electron/package.json` → `"version": "2.3.0"`
- `src/hooks/useVersionCheck.tsx` → `CURRENT_VERSION = '2.3.0'`
- Sweep remaining `2.2.0` mentions in docs (`RELEASE_GUIDE.md`, `BUILD_RELEASE.md`, `DESKTOP_APP_READY.md`, download copy) and update them.
- Lockfiles update on next install; no manual edit.

Result: the shipped v2.3.0 GitHub Release matches the app's reported version, so the auto-updater stops offering an "update" to the version already installed.

## 2. Desktop-only JARVIS command center

New route `/cockpit`, rendered only in the desktop app. Electron boots straight into it (hash route), web keeps the current dashboard. A "Back to dashboard" control keeps the rest of the app one click away.

### What it looks like
Full-bleed dark cockpit on the existing liquid-glass mesh, no scroll:

```text
+---------------------------------------------------------+
|  titlebar (existing)                                     |
+---------------------------------------------------------+
|  STATUS: SECURE            HYVO-AI PROTOCOL ACTIVE       |
|                                                          |
|   [ system rail ]      (( CORE ORB ))     [ live rail ]  |
|   CPU / GPU / NET       reactive rings     viewers       |
|   uptime / bitrate      voice waveform     chat pulse    |
|                         status caption     alerts        |
|                                                          |
|   PLATFORMS: twitch  youtube  discord  kick  spotify     |
|   [ GO LIVE ]   [ TALK TO HYVO ]   [ STUDIO ]  [ CLIP ]  |
+---------------------------------------------------------+
```

### Interactivity (real, not decorative)
- **Core orb** — animated concentric rings that react to Hyvo's live state (asleep / standing by / listening / thinking / speaking) from the existing `useHyvoAgent` hook. Click = push-to-talk toggle; ring amplitude follows mic input level.
- **Live rail** — real viewer counts and stream status from the existing realtime platform-stats hooks; live chat pulse from the existing chat hook. Falls back to a clean "offline" state.
- **System rail** — uptime, bitrate and connection health from the existing stream-health data; animated sparklines.
- **Platform nodes** — connection state per platform (connected / not linked) from the OAuth hook; clicking an unlinked node routes to Settings.
- **Command row** — Go Live, talk to Hyvo, open Studio, clip last moment — all wired to existing actions in `src/lib/hyvo/actions.ts`.
- **Boot sequence** — short "LINKING SYSTEMS…" scan animation on first mount, then the HUD settles in; skipped on subsequent navigations.
- Mouse-parallax on the orb and rails; hover glow on every node; keyboard focus states throughout.

### Visual language
Reuses the existing dark liquid-glass tokens: blue/cyan primary, Space Grotesk display, JetBrains Mono for HUD readouts. No purple, no yellow, no new palette.

## Technical notes

- New: `src/pages/Cockpit.tsx`, plus `src/components/cockpit/` (CoreOrb, SystemRail, LiveRail, PlatformNodes, CommandRow, BootSequence).
- Route added to `src/App.tsx` and `src/lib/routes.ts`, guarded by `RequireAuth`.
- Electron detection via the existing `window.electronAPI.isElectron` check; `electron/src/index.js` loads `#/cockpit` as the initial hash so only desktop lands there.
- All data comes from existing hooks — no new tables, edge functions, or schema changes.
- Animation via framer-motion (already a dependency) and CSS; canvas only for the orb rings.
