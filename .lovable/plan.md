# Hyvo.ai — Streaming Copilot, Security Lockdown & Style Continuity

## 1. Real-Time AI Streaming Copilot

**New floating panel on `/ready-to-stream` (Dashboard).**

- `src/components/ai/StreamCopilotPanel.tsx` — draggable/collapsible glass panel (reuse `GlassPanel`, `rounded-xl`, `border-zinc-800`, `bg-zinc-900/50 backdrop-blur-md`). Docked bottom-right on desktop, bottom-sheet on mobile. Tabs: **Chat**, **Commands**, **Icebreakers**, **Social Hook**. Persistent minimize state in `localStorage`.
- Wire panel into `src/pages/Dashboard.tsx` (Broadcast tab) behind a "Copilot" toggle in the header. Reads current game/category/mood from `draftStream` + active stream config so tools are context-aware.

**Central Edge Function: `supabase/functions/stream-copilot/index.ts`**
- Single entry, `mode: 'chat' | 'commands' | 'icebreakers' | 'social'`.
- Uses AI SDK + Lovable AI Gateway (`google/gemini-3-flash-preview`), `LOVABLE_API_KEY` already set.
- `verify_jwt = true`; Zod-validated body; standard CORS; 402/429 surfaced to UI as toasts.
- `chat` mode streams via `toUIMessageStreamResponse`; other modes return structured JSON via `Output.object`.

**Sub-tools (client hooks in `src/hooks/`):**
- `useStreamCopilotChat` — `useChat` transport pointed at the function (mode=chat). Renders `message.parts` with react-markdown.
- `useCopilotQuickAction` — one-shot invoke for commands / icebreakers / social hook, returns typed arrays.

**Quick-action tab specs:**
- **Chat Command Generator** → returns `{ trigger, response, cooldown, mood }[]` (5 items). Copy-to-clipboard + "Save to Chat Commands" (inserts into `chat_commands` table when authed).
- **Icebreakers** → 5 high-energy talking points scoped to current game + audience size band.
- **Social Hook Writer** → single post ≤ 240 chars for X, plus a longer Discord variant, with hashtag suggestions and CTA link placeholder.

## 2. Security Hardening

**Electron IPC (`electron/src/index.js`, `preload.js`)**
- Current code already has `secureHandle` + `isValidSender`. Tighten it:
  - Reject IPC when `event.senderFrame` is a child frame (`senderFrame !== event.senderFrame.top`).
  - Add per-channel argument schemas (small inline validators) on `save-recording`, `register-hotkey`, `open-external`.
  - Remove the `file://` allowance in dev mode; only accept `http://localhost:5173` there.
  - `preload.js`: freeze the exposed `electronAPI` object (`Object.freeze`) and expose only the narrow function list already there — no dynamic invoker.
  - `will-navigate` + `setWindowOpenHandler` already deny; add `webContents.on('will-frame-navigate', ...)` guard.

**Content Security Policy**
- `index.html`: drop `'unsafe-inline'` from `script-src` (GPT-Engineer script is loaded via `<script src="https://cdn.gpteng.co/...">` — keep host, drop inline). Tighten to:
  - `script-src 'self' 'wasm-unsafe-eval' https://cdn.gpteng.co https://va.vercel-scripts.com`
  - `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://ai.gateway.lovable.dev https://api.github.com https://*.vercel-insights.com`
  - Keep `frame-src` limited to Stripe.
- Electron `CSP` in `electron/src/index.js`: mirror the tightened directives; already headers-only, keep `frame-ancestors 'none'`.

**Supabase RLS audit (migration)**
- Audit every user-scoped table: `profiles`, `subscribers`, `stream_settings`, `stream_schedules`, `stream_scenes`, `social_connections`, `device_sessions`, `referrals`, `chat_commands`, `banned_words`, `stream_clips`, `stream_highlights`, `stream_vods`, `ai_generated_content`, `ai_predictions`, `chat_analysis`, `chat_moderation_actions`, `donations`, `fan_content`, `viewer_engagement`, `poll_votes`, `stream_polls`, `scheduled_posts`, `stream_locations`, `stream_analytics`, `stream_health_metrics`, `viewer_qa_knowledge`, `vip_users`, `platform_streaming_configs`, `streams`.
- Rewrite every policy expression using `auth.uid() = user_id` → `(select auth.uid()) = user_id` (initPlan caching). Drop + recreate policies in one migration.
- Verify every table has SELECT/INSERT/UPDATE/DELETE policies scoped to owner; add missing owner-only policies where gaps exist (flagged during audit).
- Confirm GRANTs to `authenticated` + `service_role` exist; add where missing.
- Add `chat_commands` INSERT policy so the Copilot save action works: `(select auth.uid()) = user_id`.

## 3. Global Style Continuity & Perf

- Sweep pages (`Dashboard`, `StreamCreator`, `StreamingApp`/Studio, `Settings`, `Profile`, `Subscription`, `Pricing`, `Download`, `Growth`, `Schedule`, `Community`, `Changelog`) and force:
  - Root wrapper → `PageContainer` + `bg-background` (already `240 9% 5%` = ~#0B0B0F).
  - Cards → `surface` utility (already added) or `GlassPanel` — remove ad-hoc `bg-white/5`, `bg-black/40`, `rounded-2xl`, `rounded-lg` overrides in favor of `rounded-xl`.
  - Borders → `border-zinc-800/60`. Typography → `font-display` for h1/h2, `font-sans` body, weights 500/600/700 only.
- `PageTransition.tsx`: confirm `layoutId` transitions use `spring, stiffness: 220, damping: 26`; guard against layout-shift for iframes.
- Remove `public/placeholder.svg` references from live views; replace remaining dummy assets in landing components with real illustrations already in `src/components/illustrations/`.
- Boot audit: run `pnpm dev` → check console; silence any `Missing key`, `key prop`, and `defaultProps deprecated` warnings encountered in the sweep.

## Technical Details

**New files**
- `src/components/ai/StreamCopilotPanel.tsx`
- `src/components/ai/copilot/{ChatTab,CommandsTab,IcebreakersTab,SocialHookTab}.tsx`
- `src/hooks/useStreamCopilotChat.ts`, `src/hooks/useCopilotQuickAction.ts`
- `supabase/functions/stream-copilot/index.ts`

**Edited files**
- `src/pages/Dashboard.tsx` (mount Copilot on Broadcast tab)
- `index.html` (CSP tighten)
- `electron/src/index.js`, `electron/src/preload.js` (IPC + CSP tighten)
- Page-level sweeps: `src/pages/*.tsx`
- Single Supabase migration: RLS rewrite + missing owner policies + `chat_commands` insert policy

**Not touching**
- `src/integrations/supabase/types.ts`
- `supabase/config.toml` other than as required
- Existing AI edge functions (only adding `stream-copilot`)

## Open questions
1. **Copilot chat memory**: keep it ephemeral per-session (localStorage), or persist to a new `copilot_conversations` table for history?
2. **Save-to-DB from Copilot**: allow one-click save of generated chat commands into `chat_commands`, or copy-only?
3. **Social Hook targets**: X + Discord only, or also YouTube community + Twitch announcement?
