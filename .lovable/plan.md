

# Real-Time Twitch/YouTube Chat + Fix Desktop App

## Two problems to solve

1. **Desktop app still shows "Oops" 404** — The `ElectronRouteGuard` runs `useEffect` which fires after the first render, meaning `NotFound` flashes before the redirect. Also, any issue with the hash not being set correctly on cold boot causes the guard to fail.

2. **Chat integration is partially wired** — Twitch IRC WebSocket works for *reading* anonymous chat, but there's no way to *send* messages. YouTube chat polls via edge function but isn't integrated with the Twitch connector gateway for sending. The Twitch connector is available but not linked.

## Plan

### 1. Fix desktop app routing (the persistent "Oops")

**Root cause**: The `ElectronRouteGuard` uses `useEffect` (runs *after* render), so `NotFound` renders on the first frame before the redirect fires. Also, the guard only runs once (`[]` deps) and doesn't cover edge cases.

**Fix in `src/App.tsx`**:
- Replace the `useEffect`-based guard with a synchronous check: if the current path isn't valid, render `<Navigate to="/" replace />` instead of children — no flash of 404
- Remove the `ElectronRouteGuard` component entirely and add the logic as a wrapper route or inline check
- Add a catch: if running in Electron and pathname looks like a file path (contains `C:` or `.html`), redirect to `/`

### 2. Link Twitch connector for gateway API access

Use the Twitch connector (`std_01km4rt18qe9ra6gthf7ezqmec`) to enable server-side Twitch API calls via the gateway. This enables sending chat messages and fetching user/stream data without managing tokens manually.

**Action**: Link the Twitch connection to the project.

### 3. Create edge function for sending Twitch chat messages

**New file**: `supabase/functions/twitch-chat-send/index.ts`

- Uses the Twitch connector gateway (`https://connector-gateway.lovable.dev/twitch/chat/messages`)
- Accepts `broadcaster_id`, `sender_id`, and `message` from the client
- Validates user auth and input with Zod
- Sends the message via the gateway's REST endpoint

### 4. Add send-message capability to the chat panel

**Update `src/hooks/useTwitchIRC.tsx`**:
- Add a `sendMessage` function that calls the edge function (since sending via IRC requires a real OAuth token, the gateway REST endpoint is more reliable)
- Keep the WebSocket for reading (anonymous read works without auth)

**Update `src/components/streaming/LiveChatPanel.tsx`**:
- Add a message input field at the bottom of the chat panel (text input + send button)
- Send to Twitch via the new edge function
- Send to YouTube via existing `live-chat` edge function (add a `send_message` action)
- Show the sent message optimistically in the chat list
- Disable input when not connected

### 5. Update YouTube live-chat edge function to support sending

**Update `supabase/functions/live-chat/index.ts`**:
- Add `send_message` action that POSTs to `https://www.googleapis.com/youtube/v3/liveChat/messages`
- Uses the user's stored YouTube access token from `social_connections`
- Fix platform name inconsistency: query `social_connections` for platform `youtube` (not `google`)

### 6. Improve the Twitch IRC hook for resilience

**Update `src/hooks/useTwitchIRC.tsx`**:
- Add message deduplication (use a Set of message IDs, cap at 500)
- Add connection status events exposed to the UI
- Add `channelName` to the return value so the UI always knows which channel is connected

### 7. Navigation and UX improvements

**Update `src/components/streaming/LiveChatPanel.tsx`**:
- Show a "Send as [username]" label when authenticated
- Add character count for message input (Twitch limit: 500 chars)
- Improve the connection settings dialog with clearer status indicators

## Files to create/modify

| File | Change |
|------|--------|
| `src/App.tsx` | Replace `ElectronRouteGuard` useEffect with synchronous `Navigate` redirect |
| `supabase/functions/twitch-chat-send/index.ts` | New edge function to send Twitch chat via connector gateway |
| `supabase/functions/live-chat/index.ts` | Add `send_message` action for YouTube, fix platform name query |
| `src/hooks/useTwitchIRC.tsx` | Add `sendMessage`, expose `channelName`, deduplication |
| `src/components/streaming/LiveChatPanel.tsx` | Add message input bar, send functionality, improved UX |

## Technical details

- Twitch chat reading: anonymous IRC WebSocket (already works, no auth needed)
- Twitch chat sending: connector gateway REST endpoint `POST /chat/messages` with `LOVABLE_API_KEY` + `TWITCH_API_KEY`
- YouTube chat reading: polling via `live-chat` edge function (already works)
- YouTube chat sending: `POST liveChat/messages` via YouTube Data API with stored OAuth token
- Desktop fix: synchronous path validation before route rendering, no useEffect delay

