# Cockpit rebuild: three-panel command center

## What you'll get

A desktop cockpit that fills the whole screen as one command center instead of a stack of boxes:

```text
┌──────────── status bar: secure · build v2.3.0 · protocol active ────────────┐
│ SYSTEM / ACTIVITY  │        GLOWING CORE + VOICE LINE        │  LIVE / LINKS │
│  diagnostics       │  what Hyvo heard, what it answered      │  viewers      │
│  recent actions    │  typed "Ask Hyvo" box under the core    │  followers    │
│  clips, insights   │  platform nodes ring                    │  destinations │
├──────────────────── command dock (icons, hold-to-talk hint) ─────────────────┤
│ results console: titles, chat mood, growth advice, errors                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Left column: system diagnostics plus the live activity feed, scrolling in place.
- Center: the core orb, the voice line (what it heard / said), and the platform ring.
- Right: live telemetry and your connected destinations.
- Bottom: the icon command dock and the results console, always visible.
- Hold Ctrl+Shift+V anywhere to talk; the dock shows that hint and lights up while the mic is hot.
- Anything you type in the "Ask Hyvo" box runs through the same voice agent as speech — same answers, same actions (go live, clip, poll, moderate), logged to the activity feed.

## Technical changes

- Rewrite `src/pages/Cockpit.tsx` layout: full-height grid `[320px_1fr_320px]` inside `HudFrame`, with the command dock and `CommandConsole` pinned below; columns scroll independently. Keep all existing data wiring (`useHyvoAgent`, `useRealPlatformStats`, `usePlatformOAuth`, `useLiveChat`, `useVersionCheck`, boot sequence, destinations dialog).
- Mount `VoiceStrip` under `CoreOrb`, fed by `status`, `transcript`, `lastReply` from `useHyvoAgent`, with `onAsk={ask}` so typed commands hit `handleUtterance` (same intent parsing, execution, TTS and `hyvo_agent_events` logging as voice).
- Move `ActivityFeed` into the left column beside `SystemRail`; `LiveRail` + `PlatformNodes` summary into the right column.
- Push-to-talk already exists in `useHyvoAgent` (Ctrl+Shift+configured key). Surface it: a hint chip in the dock and a "mic hot" state on the orb. No new listener.
- Keep parallax subtle and disable it while the mic is active so the HUD stays readable.

## About linking keys and running a real broadcast

I can build the screens, but I can't sign into your Twitch or YouTube account, paste your real stream key, or start an actual broadcast from here — those need your accounts and your desktop machine. What I'll do in this pass:

- Make the destinations panel show, per platform, exactly what's missing (needs sign-in / needs key / ready) so "enable all" can't silently leave a dead destination.
- Add a pre-flight line above the Go Live button: how many destinations are actually ready to receive the broadcast.

Then, on your machine: open the cockpit, click the platform ring, sign in to Twitch and YouTube there, paste keys for any other services you want, and hit Go Live — the pre-flight line will tell you before you start whether every destination is really wired. Tell me what it reports and I'll fix whatever fails.
