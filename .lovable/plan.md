# Fix the 2.2.0 download + deepen the JARVIS cockpit

## 1. Why the download says 2.2.0 (confirmed)

The GitHub release tagged **v2.3.0** contains leftover installer files from the earlier 2.2.0 build alongside the new ones:

```text
Hyvo.Stream.Studio.Setup.2.2.0.exe     <- picked today
Hyvo.Stream.Studio.Setup.2.3.0.exe
Hyvo.Stream.Studio-2.2.0.dmg / -arm64.dmg / .AppImage
Hyvo.Stream.Studio-2.3.0.dmg / -arm64.dmg / .AppImage
hyvo-stream-studio_2.2.0_amd64.deb
hyvo-stream-studio_2.3.0_amd64.deb
```

The download page matches an asset by extension only (`.exe`, `.dmg`, `.AppImage`) and takes the first hit — which is the 2.2.0 file. The app's own version fields are already correct at 2.3.0.

### Fix (app side)

- Make asset matching version-aware: when resolving an asset, prefer names containing the release's own tag version, and only fall back to a plain extension match if none exists. Applies to the download URL, size and download-count lookups.
- Show the resolved file's version on each download button ("Windows · v2.3.0") so a stale asset is visible immediately.
- Same version filter for the releases list used by the changelog view.

### Fix (release side, one manual step)

Delete the five stale `2.2.0` assets from the v2.3.0 release on GitHub so the auto-updater's `latest.yml` and any direct links can never resolve to the old build. I'll list the exact filenames; the app fix means the site is correct either way.

## 2. JARVIS for streaming only — deeper cockpit AI

Keeping the cockpit as the desktop home and expanding the AI side.

- **Always-on voice loop**: wake word + push-to-talk wired into the cockpit orb, using the existing Hyvo agent and ElevenLabs voice. Orb ring amplitude follows mic level; states are asleep / standing by / listening / thinking / speaking.
- **Proactive alerts**: Hyvo speaks up unprompted only for things that matter while live — dead air, a bitrate or dropped-frame spike, a viewer surge, a raid or a donation, a chat moderation flag. Everything else stays silent and just lands in the feed.
- **Activity feed**: a timestamped cockpit log of what Hyvo did and saw (commands run, highlights generated, alerts fired, destinations enabled), persisted per user.
- **More real commands**: extend the command deck beyond the current set with clip-the-last-moment, run a poll, post a social clip, summarise chat sentiment, and a "what should I do next" growth insight — each returning a real result in the command console.
- **Streaming-only guardrail**: the agent's system prompt is tightened so Hyvo declines off-topic requests and stays a broadcast co-pilot.

Visual language unchanged: dark liquid glass, blue/cyan, Space Grotesk display, JetBrains Mono readouts.

## Technical notes

- `src/hooks/useGitHubReleases.tsx` and `src/hooks/useAllGitHubReleases.tsx`: add a version-scoped asset resolver keyed off `tag_name`; `src/pages/Download.tsx` renders the resolved version per platform.
- Cockpit work lands in `src/components/cockpit/` (new `ActivityFeed`, extended `CommandRow`/`CommandConsole`) and `src/pages/Cockpit.tsx`, on top of the existing `useHyvoAgent`, `useHyvoVoice`, `useLiveChat` and platform-stats hooks.
- Proactive alerts run off the existing realtime channels; alert history stored in a new `hyvo_activity` table with RLS scoped to `auth.uid()`.
- Command handlers use the existing `stream-copilot` and `hyvo-agent` edge functions — no new AI provider.
