# Cockpit command deck: live results, real destinations, release

## 1. CommandConsole panel (new)

Add `src/components/cockpit/CommandConsole.tsx` — a liquid-glass panel below the command deck that shows what each button actually produced:

- Header with the running task name, a spinner while working, and a clear button.
- Result list rendered per task type: title ideas and icebreakers as copyable lines, chat commands as `!command → response` rows, the go-live post as a copyable block.
- Copy-to-clipboard on every item, toast confirmation.
- Errors (rate limit, credits, auth) render inline in the panel instead of only as a toast.
- Empty state: short "Run a command" hint in the cockpit's mono/HUD styling.

## 2. Rewire Cockpit.tsx

`src/pages/Cockpit.tsx` still calls the old `CommandRow` props, so the build is currently broken. Replace it with the new single `onRun(id)` API:

| Command | Wiring |
| --- | --- |
| `live` | `executeHyvoAction` go_live / end_stream (existing) |
| `talk` | toggle the voice agent |
| `clip` | `executeHyvoAction` clip |
| `destinations` | open `DestinationsDialog` |
| `studio` / `dash` | navigate |
| `titles` | `ai-title-generator` edge function |
| `icebreakers`, `commands`, `social` | `stream-copilot` with the matching `mode` |

Track `busy` as the active `CommandId` (not a boolean) so the pressed button shows its own spinner. Feed results and errors into `CommandConsole`. Pass live stream title/viewers as context into the copilot calls so output is about the current stream.

Also update `PlatformNodes` to render from the real destination list (`useStreamDestinations` + the 16-platform catalog) instead of the hardcoded Twitch/Discord/Kick/Spotify nodes, and open the destinations dialog on click rather than routing to Settings.

## 3. Desktop release on v2.3.0

The `Desktop App Release` workflow runs on GitHub Actions and can only be triggered from your GitHub repo — I can't dispatch it from here. After the code above ships, run it yourself:

GitHub → Actions → "Desktop App Release" → Run workflow → version `2.3.0`.

It builds Windows/macOS/Linux installers and attaches them to the v2.3.0 release, which is what `/download` reads from. I'll confirm the version fields are already 2.3.0 everywhere before you run it.

## 4. Linking Twitch and YouTube for real

Once the deck is live, open Cockpit → Destinations:

- **Twitch / YouTube (OAuth)** — click Link, approve the consent screen, and Hyvo pulls the ingest endpoint and key itself; no manual key. Requires the callback URLs already configured for both providers.
- **Everything else (Kick, TikTok, Facebook, X, Rumble…)** — the ingest URL is prefilled; paste the stream key from that platform's dashboard (hint text shows where), save, and toggle it on.
- Enabled destinations are what "Go live" broadcasts to; toggling one off skips it without deleting the key.

I'll walk through this step by step with you after the release build finishes, and verify a live send to at least one destination.

## Technical notes

- No schema changes; destinations continue to use `platform_streaming_configs` via `useStreamDestinations`.
- `stream-copilot` returns mode-specific JSON; `CommandConsole` normalizes each mode into a common `{ title, items[] }` shape.
- Build/typecheck run after the rewire — `Cockpit.tsx` is currently failing and this fixes it.
