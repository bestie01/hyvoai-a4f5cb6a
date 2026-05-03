## Stage 2 — Functional Polish & Feature Adoption

Scope: desktop updater UX, adopt `useApiCall` in Chat + Stripe flows, sweep dead links/routes, harden Twitch/YouTube end-to-end. No DB migrations required.

---

### 1. Electron auto-updater UX

Today: `UpdateBanner` already wires `useVersionCheck` → Electron IPC (`onUpdateChecking/Available/Progress/Downloaded/Error`) and `auto-updater.js` already broadcasts those events. Gaps: error states are silent, no "what's new" surface, no toast on completion, banner can't be dismissed during download, web-only `dismissUpdate` does not clear ready/downloading states.

Changes:
- New `src/components/UpdateCenter.tsx`: floating bottom-right "pill" on desktop showing live status (Checking → Downloading X% → Restart now). Replaces the heavy top banner on desktop; banner stays for web "new release available".
- `useVersionCheck`: expose `errorMessage`, persist `latestVersion` from `update-available`, expose `releaseNotes`. Add Sonner toasts for `error` and `ready` states.
- `UpdateBanner`: show release notes preview in a `Popover` (web), keep "Download" CTA tied to GitHub release.
- `electron/src/auto-updater.js`: pass `releaseNotes` through on `update-available` (already partially there — verify). Add `cancellationToken` log on error.
- `electron/src/preload.js`: confirm all 6 update channels are forwarded; add `removeUpdateListeners()` helper for clean unmount.

Acceptance: on desktop, user sees inline progress; clicking Restart triggers `quitAndInstall`. On web, banner only shows when GitHub has a newer tag.

### 2. Adopt `useApiCall` for Chat + Stripe

Targets (highest-value, user-visible failures):
- `src/hooks/useSubscription.tsx` — `create-checkout`, `customer-portal`, `pause-subscription`, `resume-subscription`, `check-subscription` (5 invocations).
- `src/hooks/useLiveChat.tsx` — `live-chat` get_live_chat_id, fetch_messages, send_message (3 invocations).
- `src/hooks/useTwitchIRC.tsx` — `twitch-chat-send` (1 invocation).
- `src/components/streaming/LiveChatPanel.tsx` — inline `live-chat` send → route through `useLiveChat.sendMessage` instead of duplicate invoke.

Pattern per call site:
```ts
const checkout = useApiCall<CheckoutBody, CheckoutResp>('create-checkout', { action: 'start checkout' });
const data = await checkout.invoke({ priceId, mode });
if (!data) return; // toast already shown
```

Benefits: unified error toasts, loading flags consolidated, removes ~80 lines of repetitive try/catch/toast.

Out-of-scope for Stage 2 (defer): the 13 AI hooks — they have bespoke streaming/error semantics; revisit in Stage 3.

### 3. Dead-link / dead-button sweep

Audit method: `rg "to=|href=|onClick" src/pages src/components/Footer.tsx src/components/Navigation.tsx` cross-checked against `src/lib/routes.ts` and `App.tsx` routes.

Known/likely issues to verify and fix:
- `ROUTES` declares `/create` (StreamCreator) gated by `requiresPro`, but neither `Navigation` nor `MobileBottomNav` enforce `requiresPro` — clicking from a free account dumps them on a blocked page. Add a Pro gate redirect to `/pricing?upgrade=create`.
- `routes.ts` lists `/studio` twice (sidebar + center "Go Live") — confirm `MobileBottomNav` handles the duplicate without React key warnings; add `key` derived from `label+path`.
- `Footer.tsx`, `CTA.tsx`, `Hero.tsx`: scan for `href="#"`, broken anchors (`/blog`, `/docs`, `/privacy`, `/terms`) — either point to existing pages, external docs, or remove.
- `Navigation`: "Sign in" should preserve `?redirect=` (Stage 1 added support; verify call site uses it).
- `Download` page: ensure the `.dmg` / `.exe` links resolve to current `public/downloads/*` filenames (still on `1.0.0`).
- `NotFound`: add a "Back to dashboard" + "Go home" pair, currently sparse.

Deliverable: a short report comment in chat listing each fix applied, plus the actual edits.

### 4. Twitch + YouTube end-to-end verification

Twitch:
- Read: `useTwitchIRC` connects anon to `irc-ws.chat.twitch.tv`. Verify reconnect/backoff and that `channelName` lowercases input.
- Send: `twitch-chat-send` requires `broadcaster_id` + `sender_id`. Currently `LiveChatPanel` passes `platformUserId` for both — only correct when streaming on your own channel. Add a `broadcasterId` resolution step using `users?login=<channel>` in `useTwitchIRC.connect`, store it, and pass it to `sendMessage`.
- OAuth: confirm `usePlatformOAuth` populates `twitchConnection.platformUserId` after Supabase OAuth identity link. If missing, prompt reconnect (UI string already present in `LiveChatPanel`).

YouTube:
- Connection flow (`PlatformConnector` + `usePlatformOAuth.linkIdentity('google', { scopes: youtube.readonly + force-ssl })`) — verify scopes per memory `oauth-real-viewer-stats`.
- Edge function `live-chat`: confirm it (a) finds the active broadcast for the connected user via `liveBroadcasts?broadcastStatus=active`, (b) returns `liveChatId`, (c) supports `send_message` with the user's OAuth token (server-side via Supabase `provider_token`).
- UI: `LiveChatPanel` already shows "no active broadcast" empty state; ensure polling stops when `liveChatId` becomes null (avoid 403 spam).

Manual checks (no code): confirm in Supabase dashboard that Google provider has YouTube scopes enabled and the redirect URLs include `https://hyvoai.lovable.app/auth/callback` (and preview).

---

### Files to touch

```text
src/App.tsx                                  # mount UpdateCenter on desktop
src/components/UpdateBanner.tsx              # web-only refinements
src/components/UpdateCenter.tsx              # NEW desktop pill
src/hooks/useVersionCheck.tsx                # error + releaseNotes + toasts
electron/src/auto-updater.js                 # releaseNotes payload
electron/src/preload.js                      # removeUpdateListeners helper
src/hooks/useSubscription.tsx                # adopt useApiCall x5
src/hooks/useLiveChat.tsx                    # adopt useApiCall x3
src/hooks/useTwitchIRC.tsx                   # adopt useApiCall + broadcasterId
src/components/streaming/LiveChatPanel.tsx   # remove duplicate invoke
src/lib/routes.ts                            # de-dupe key + Pro gating note
src/components/Navigation.tsx                # Pro gate + redirect param
src/components/dashboard/MobileBottomNav.tsx # Pro gate
src/components/Footer.tsx, CTA.tsx, Hero.tsx # dead-link fixes
src/pages/NotFound.tsx                       # CTAs
```

No DB changes. No new secrets. No edge-function code changes (only client adoption + verification).

### Manual actions for the user
1. Supabase → Auth → Providers → Google: ensure scopes include `https://www.googleapis.com/auth/youtube.readonly` and `youtube.force-ssl`.
2. Tag a GitHub release `v2.2.0` after merge so existing 1.0.0 desktop installs receive the new updater UX.
3. Note: Windows/macOS desktop builds use **Electron** (`electron/` + `electron-builder.json` + `.github/workflows/desktop-release.yml`) — check those configs if anything looks off post-release.

### Expected result
- Desktop users see a polished, non-blocking update pill with progress and one-click restart.
- Chat + Stripe failures surface consistent toasts; less duplicated error code.
- No dead links in nav, footer, or hero CTAs; Pro routes gate gracefully.
- Twitch send works on channels other than the user's own; YouTube polling stops cleanly when no broadcast is live.