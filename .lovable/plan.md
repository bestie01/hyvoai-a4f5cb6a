
Goal: make YouTube account linking real, make chat usable end-to-end, and stop the desktop app from getting stuck on the 404/Oops screen.

What is actually broken
- The desktop screenshot is from an old packaged app: it shows current version `1.0.0` while the app code expects newer releases. That means fixes are likely not reaching the installed app yet.
- The Electron route guard is still too weak for packaged startup edge cases. It validates `pathname`, but Electron routing problems usually come from the hash/file boot URL.
- Auto-update UI is only half wired: `preload.js` listens for update events, but `auto-updater.js` never forwards those events to the renderer.
- The YouTube “connect” flow is not a true platform-link flow yet. `usePlatformOAuth` uses `signInWithOAuth`, which risks replacing the user session instead of linking Google/YouTube to the current account.
- Current Google scopes are not enough for full YouTube live chat sending. Reading may work, sending needs stronger YouTube scope(s).
- YouTube chat send is currently incomplete in the UI: `LiveChatPanel` calls `send_message` without passing `liveChatId`, so sending can fail even if OAuth succeeds.
- Twitch chat send is also incomplete: it sends channel names as `broadcaster_id` / `sender_id`, but the API expects real IDs.
- `social_connections` still only allows `youtube` in its DB check constraint, not `twitch`, so connection persistence is structurally inconsistent.

Implementation plan

1. Fix the desktop app properly
- Harden Electron boot routing in `src/App.tsx` so invalid hash/file startup states redirect before route rendering.
- Update `electron/src/index.js` to always load the packaged app with a normalized home hash and avoid stale file-path route states.
- Add an Electron-safe fallback route strategy so packaged launches do not land on `NotFound`.
- Sync app versioning across root app, Electron package, and release workflow so the desktop app stops shipping as `1.0.0`.
- Wire `electron/src/auto-updater.js` to emit update events to the renderer so desktop update status is real.

2. Build a real YouTube account-link flow
- Change YouTube platform connection in `src/hooks/usePlatformOAuth.tsx` to use account linking behavior for signed-in users instead of a plain social sign-in flow.
- Expand Google/YouTube scopes to support:
  - channel/live metadata
  - live chat reading
  - live chat sending
  - analytics already in use
- Persist the linked YouTube identity cleanly into `social_connections` with username, platform user ID, access token, refresh token, expiry, and reconnect state.
- Add clearer connection states in the UI: Connected, Missing permissions, Token expired, No active livestream.

3. Fix chat reading/sending end-to-end
- Update `src/hooks/useLiveChat.tsx` to expose the active `liveChatId`, connection state, and polling interval returned by YouTube.
- Update `src/components/streaming/LiveChatPanel.tsx` so YouTube send passes the real `liveChatId`.
- Improve YouTube chat UX with better empty states like “Connected, but no active live broadcast found”.
- Extend `usePlatformOAuth` connection data so Twitch/YouTube connection objects include platform user IDs needed for sending.
- Update `src/hooks/useTwitchIRC.tsx` and the Twitch send flow to use real IDs, not channel name placeholders.
- Keep Twitch reading via IRC WebSocket, but make sending use the connected account metadata reliably.

4. Clean up backend/schema inconsistencies
- Add a migration to fix `social_connections` so it supports both `twitch` and `youtube`.
- Normalize any old `google` platform rows to `youtube`, while keeping temporary compatibility reads where needed.
- Harden `supabase/functions/live-chat/index.ts`:
  - validate input
  - return clear scope/token/live-chat errors
  - keep YouTube read/send behavior consistent
- Harden `supabase/functions/twitch-chat-send/index.ts` with clearer validation and error messages.
- Review `platform-stats` and related functions so all platform naming is consistent.

5. Improve the Studio experience
- Refine `PlatformConnector.tsx` to explain what each connection unlocks: stats, live chat, sending, analytics.
- Improve `LiveChatPanel.tsx` so the input only enables when sending is truly available.
- Show a better connection summary in the chat settings modal: Twitch IRC status, YouTube OAuth status, active broadcast status.
- Polish the desktop/web experience around updates and startup so users see a stable app instead of a warning banner over a broken route.

Files likely to change
- `src/App.tsx`
- `electron/src/index.js`
- `electron/src/auto-updater.js`
- `electron/src/preload.js`
- `src/hooks/usePlatformOAuth.tsx`
- `src/hooks/useLiveChat.tsx`
- `src/hooks/useTwitchIRC.tsx`
- `src/components/streaming/LiveChatPanel.tsx`
- `src/components/streaming/PlatformConnector.tsx`
- `src/hooks/useVersionCheck.tsx`
- `electron/package.json`
- `.github/workflows/desktop-release.yml`
- `supabase/functions/live-chat/index.ts`
- `supabase/functions/twitch-chat-send/index.ts`
- `supabase/migrations/...`

Technical details
- Desktop issue is likely a combination of stale packaged version plus incomplete Electron hash boot handling.
- YouTube connection should be treated as “link provider to existing user”, not “sign in as Google and hope tokens persist”.
- YouTube live chat send requires stronger scopes than the app currently requests.
- The current UI cannot send YouTube chat reliably because `liveChatId` is not passed from the chat reader into the send request.
- A new desktop release will be required after these fixes; otherwise users will stay on the broken `1.0.0` installer.

Expected result
- Desktop app opens to the real app instead of the Oops screen.
- Users can connect their YouTube account safely from the studio.
- YouTube live chat can be read and sent from inside the app when a live broadcast exists.
- Twitch real-time chat remains live via IRC and can send messages with real account metadata.
- Updates, routing, connection states, and studio chat UX feel much more production-ready.
