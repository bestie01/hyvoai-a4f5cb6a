# Cockpit upgrades + update filename fix

## 1. Fix update download (v2.5.0 404)
- Installer names are now set in the desktop build settings so the installer and the update list always match (`Hyvo-Stream-Studio-Setup-<version>.exe`, and the same pattern for Mac/Linux).
- Add a workflow check that stops the release if the file named in `latest.yml` isn't actually uploaded.
- The existing v2.5.0 release on GitHub can't be renamed from here. Either rename the asset by hand on GitHub, or (recommended) run "Desktop App Release" as **v2.5.1** after this lands. Version gets bumped to 2.5.1 everywhere.

## 2. Audio visualizer around the central button
- Live microphone level drawn as a reacting cyan ring/bars around the Hyvo button.
- Only runs while the mic is active (push-to-talk or listening); goes quiet and dims when muted.
- Reuses the mic the voice agent already opens, no second permission prompt.

## 3. Real-time stream stats (side panel)
- Right panel shows live viewers, new followers (with a "spike" highlight when followers jump sharply in a short window), and chat messages per minute.
- Small sparkline per stat, updating live from the existing stream stats and chat feeds.
- Shows "Offline" cleanly when not live.

## 4. Quick action presets
- Row of one-click buttons: **Generate title**, **Clip that**, **Shoutout**.
- Shoutout asks for a channel name (pre-filled with the latest raider if there is one), then posts it to chat.
- Results appear in the existing command console; clip is disabled when not live.

## 5. Activity log filters
- Tabs above the activity feed: **All / Chat commands / AI replies / System alerts**, with counts.
- Filter choice is remembered between sessions.

## Technical details
- `electron/package.json`: confirm `artifactName` for nsis/dmg/AppImage; `.github/workflows/desktop-release.yml`: post-build step parsing `latest.yml` and verifying the asset path exists.
- Version 2.5.1 in `package.json`, `electron/package.json`, `useVersionCheck.tsx`.
- New `useMicLevel` hook (Web Audio AnalyserNode on the stream from `useHyvoVoice`), rendered in `CoreOrb.tsx` via canvas + requestAnimationFrame.
- `LiveRail.tsx`: add follower delta + chat rate from existing realtime channels (no new data source).
- New `QuickPresets.tsx` in the center column, calling existing handlers (ai-title-generator, executeHyvoAction clip, chat send).
- `ActivityFeed.tsx`: classify `hyvo_agent_events` by event type into the three groups; filter state in localStorage.
