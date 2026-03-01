

# Improvements to Make Hyvo a Real Helping App

## Current State

The app has extensive UI across landing, dashboard, studio, settings, and download pages. However, much of the functionality is simulated or disconnected. Here are the highest-impact improvements organized by priority.

---

## Priority 1: Persist User Settings and Scene Configuration

**Problem**: Scenes, sources, and AI feature toggles in `/studio` reset on every page load -- they're only in React state.

**Changes**:
- Store scenes, sources, and AI toggle preferences in Supabase (via the existing `useSettings` hook or a new `useStudioConfig` hook)
- Load saved configuration on mount, save on change
- Files: `src/pages/StreamingApp.tsx`, possibly new `src/hooks/useStudioConfig.tsx`

---

## Priority 2: Replace Simulated Chat with Real Twitch IRC

**Problem**: `useLiveChat` Twitch integration is a placeholder (comment on line 113: "Twitch chat requires IRC WebSocket - this is a placeholder"). The `useTwitchIRC` hook exists but needs verification.

**Changes**:
- Verify `useTwitchIRC` hook works end-to-end with real WebSocket connection
- Ensure `LiveChatPanel` displays real messages when a Twitch channel is connected via OAuth
- File: `src/hooks/useTwitchIRC.tsx`, `src/hooks/useLiveChat.tsx`, `src/components/streaming/LiveChatPanel.tsx`

---

## Priority 3: Stream Key Encryption and Security

**Problem**: Stream keys entered in Settings are stored as plain text. These are sensitive credentials.

**Changes**:
- Encrypt stream keys before storing in Supabase
- Only decrypt server-side when needed for RTMP connections
- Add a "show/hide" toggle for stream key fields
- Files: `src/pages/Settings.tsx`, `src/hooks/useSettings.tsx`, potentially a new edge function

---

## Priority 4: Dashboard with Real Data

**Problem**: `DashboardMain` likely shows static/demo analytics data rather than real stream history.

**Changes**:
- Query actual stream records from Supabase `streams` table
- Show real stream history (duration, peak viewers, platform)
- Display "No streams yet -- go live from the Studio" empty state
- Files: `src/components/dashboard/DashboardMain.tsx`

---

## Priority 5: Error Handling and Offline Support

**Problem**: Network failures during streaming could cause silent data loss.

**Changes**:
- Add reconnection logic to `useLiveChat` and `useTwitchIRC` when WebSocket disconnects
- Show connection status indicators in the Studio UI
- Queue analytics events locally when offline (use localStorage), flush when back online
- Files: `src/hooks/useLiveChat.tsx`, `src/hooks/useTwitchIRC.tsx`, `src/pages/StreamingApp.tsx`

---

## Priority 6: Landing Page Polish

**Problem**: Minor UX issues -- social links point to placeholder URLs, some sections could have better CTAs.

**Changes**:
- Update Footer social links to real URLs or remove them
- Add a "Try the Studio" CTA that links to `/studio` for logged-in users or `/auth` for guests
- Files: `src/components/Footer.tsx`, `src/components/CTA.tsx`

---

## Implementation Plan (Files to Modify)

| File | Change |
|------|--------|
| `src/hooks/useStudioConfig.tsx` | **New** -- persist scenes, sources, AI toggles to Supabase |
| `src/pages/StreamingApp.tsx` | Use `useStudioConfig` instead of local state for scenes/sources/AI toggles |
| `src/hooks/useTwitchIRC.tsx` | Verify and fix real WebSocket IRC connection |
| `src/hooks/useLiveChat.tsx` | Remove placeholder comment, integrate real Twitch messages |
| `src/components/dashboard/DashboardMain.tsx` | Query real stream records, show empty state |
| `src/pages/Settings.tsx` | Add show/hide toggle for stream keys |
| `src/components/Footer.tsx` | Fix placeholder social URLs |

