## Goal
Remove all manual stream-key friction, retire the yellow/purple accents, and make every live surface reflect real-time data.

## 1. One-click "Go Live" (no stream key prompts)

Streamlabs-style: user connects Twitch/YouTube via OAuth once, then Hyvo provisions the RTMP target automatically.

- **Twitch**: use the stored OAuth token from `platform_connections` to call Helix `/streams/key` on the user's behalf. Cache the returned key server-side; never show it in the UI.
- **YouTube**: call `liveBroadcasts.insert` + `liveStreams.insert` via the stored Google OAuth token, bind them, and return the ingest URL + auto-generated key. Persist the `broadcastId` so Stop Live can transition it to `complete`.
- New edge function `provision-stream` (`verify_jwt=true`) with actions `provision`, `go_live`, `end_live`. Writes into `platform_streaming_configs` with `stream_key` marked internal.
- Client changes:
  - Delete `IngestPanel` from the Broadcast tab (no more Server URL / Stream Key UI).
  - Replace with a single **GoLivePanel** showing: connected platform chips, title/category inputs, and one primary **Go Live** button that calls `provision-stream` → starts WebRTC/RTMP relay → flips `streams.is_live=true`.
  - If a platform is not yet connected, the chip opens the existing OAuth flow inline instead of asking for a key.
- Keep manual RTMP as an **Advanced** collapsible (hidden by default) for power users on OBS — but pre-filled, read-only, copy-only. Never asks the user to paste anything.

## 2. Kill the yellow + purple, unify accents

Audit reveals these are the offenders: `--neon-violet`, `--neon-amber`, purple/yellow gradients in `Hero`, `StreamCopilotPanel`, `IngestPanel` CTA, some AI cards, and a few `from-yellow-*`/`from-purple-*` Tailwind classes.

- Redefine the accent palette in `src/index.css` around the existing primary cyan/blue:
  - `--primary` stays `#3B82F6`
  - `--accent` → cool cyan `#22D3EE`
  - `--accent-2` → soft emerald `#34D399` (for success/live states only)
  - Remove `--neon-violet` and `--neon-amber` tokens.
- Global sweep replacing:
  - `from-primary/… to-[hsl(var(--neon-violet))]/…` → `from-primary/… to-accent/…`
  - `text-yellow-*`, `bg-yellow-*`, `from-amber-*`, `from-purple-*`, `to-violet-*`, `to-fuchsia-*` → semantic tokens.
- Files touched (scan already done): `Hero.tsx`, `CTA.tsx`, `StreamCopilotPanel.tsx`, `IngestPanel.tsx` (removed anyway), `AIPredictiveDashboard.tsx`, `StreamHealthOverlay.tsx`, `PulseDot.tsx`, `tailwind.config.ts` neon color entries.
- Live/recording indicators stay red (`--destructive`) — that's a streaming convention, not the "yellow/purple" the user objected to.

## 3. Real-time everywhere it matters

Wire every live surface to Supabase Realtime + platform pollers instead of static/mock data.

- **Dashboard right panel & DashboardMain**: subscribe to `streams`, `stream_analytics`, `chat_messages` via `supabase.channel(...).on('postgres_changes', ...)` inside `useEffect` with proper cleanup (per project memory).
- **LiveViewerStats / RealtimePlatformStats**: switch from interval-only to Realtime channel on `platform_stats_snapshots`, keep the 30-second `platform-stats` edge poll as backfill.
- **StreamHealthOverlay**: bind bitrate/fps/dropped-frames to the active `useWebRTCStream` peer connection stats loop (already emits every 1s) instead of the current placeholder values.
- **LiveChatPanel**: already realtime for Twitch IRC; add YouTube continuous poll fallback wired into the same message stream so both platforms surface in one feed.
- **StreamCopilotPanel Chat tab**: pass the live viewer count + last 10 chat messages into the `stream-copilot` prompt each request so suggestions reflect what's happening *now*.
- **PulseDot** everywhere gets driven by the actual `is_live` boolean from Realtime, not local state.

## Technical notes

- OAuth scopes required — Twitch: `channel:read:stream_key`, `channel:manage:broadcast`; YouTube: `youtube` + `youtube.force-ssl`. If a connected account is missing them, the Go Live button triggers a reconnect flow.
- `provision-stream` stores the key encrypted at rest (existing `SUPABASE_SECRET_KEYS`) and never returns it to the client — the client only sees `{ status: 'ready', platforms: [...] }`.
- Realtime: enable publication on `streams`, `stream_analytics`, `chat_messages`, `platform_stats_snapshots` if not already (idempotent `ALTER PUBLICATION`).
- Color migration is CSS-token only; component structure untouched to avoid regressions.

## Out of scope
- No new pricing/subscription changes.
- No new AI models.
- No Electron/desktop packaging changes.

## Open question
For YouTube auto-provisioning, do you want each Go Live to create a **new broadcast every time** (fresh URL, cleaner analytics) or **reuse a single persistent broadcast** (same URL viewers can bookmark)? Streamlabs defaults to new-every-time — I'll go with that unless you say otherwise.
