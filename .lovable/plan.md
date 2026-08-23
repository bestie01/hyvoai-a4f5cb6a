# Hyvo Co-Pilot — Always-On Voice Agent

Turn the existing Copilot panel into a real background co-host: it listens, speaks, watches chat, and executes stream actions.

## 1. The Hyvo persona

One shared persona/system prompt used by every AI surface (copilot chat, voice commands, chat moderation, viewer Q&A) so Hyvo sounds like one entity everywhere: calm, hyper-competent, witty, punchy, TTS-friendly. Short sentences, no filler, no jargon — "Clipped that." not "I have successfully created a clip."

## 2. Voice in — wake word + push to talk

- Continuous mic listening in the browser (Web Speech API), reacting only after hearing "Hyvo, ...".
- A push-to-talk hotkey (and the mic button) always works as fallback, even with the wake word off.
- A persistent Hyvo dock on the dashboard/studio: mic status (idle / listening / thinking / speaking), live transcript of what it heard, and a mute switch.
- Wake word, hotkey, voice, and autonomy toggles live in Settings and persist per user.

## 3. Voice out — ElevenLabs

- Hyvo speaks replies through the existing ElevenLabs function, streamed so speech starts immediately.
- Speech queue so overlapping events never talk over each other; a "shut up" command / mute instantly stops playback.
- Selectable co-host voice in Settings.

## 4. Actions Hyvo can actually perform

Voice commands are parsed into structured actions and executed, then acknowledged in one short line:

- **Stream control** — go live, end stream, mute/unmute mic, switch scene (wired to the existing Go-Live and studio state).
- **Clip & bookmark** — "clip that" saves a timestamped highlight to the database with an AI-written label; clips appear in a Highlights list.
- **Chat actions** — post an announcement to connected chat, timeout/ban a viewer, launch a poll.
- **Info lookup** — game stats, patch notes, trivia, song ID; answered by the model and spoken aloud, with longer detail dropped into a notes panel instead of being read out.

Anything Hyvo can't do yet is refused honestly in one line, never faked.

## 5. Background autonomy

A background monitor running while live:

- **Auto-moderation** — every incoming chat message is screened; toxic ones are actioned silently and logged to the moderation feed. Only critical events (raids, a ban wave, a dead-air stretch) are spoken aloud.
- **Auto-answer** — repetitive viewer questions matched against the existing Q&A knowledge base are answered in chat automatically.
- **Chat vibe** — rolling sentiment/topic read, spoken on request ("Hyvo, how's chat?").
- **Talking points** — if chat goes quiet, Hyvo offers one icebreaker instead of nagging.
- Autonomy level is user-controlled: Off / Assist (ask first) / Autopilot (act silently).

## 6. Activity log

A single feed showing everything Hyvo did — commands executed, messages moderated, questions auto-answered, clips saved — so nothing happens invisibly.

## Technical notes

- New `hyvo-agent` edge function: shared persona, intent parsing into a strict action schema, and info lookup. Existing `stream-copilot`, `ai-chat-moderator`, `ai-viewer-qa`, `ai-voice-assistant` functions are consolidated behind it where they overlap; `provision-stream` handles stream control and title/announce actions.
- Client: `useHyvoAgent` (wake word, transcript, intent dispatch), `useHyvoVoice` (streaming TTS queue), `useHyvoBackground` (chat monitor via existing Realtime subscriptions).
- TTS switched to SSE streaming with a PCM Web Audio player for low latency; ElevenLabs stays the provider.
- Actions dispatch through a typed registry so each capability is one small handler, testable in isolation.
- New tables only where needed: an agent activity log; clips/highlights/moderation reuse `stream_highlights`, `stream_clips`, `chat_moderation_actions`. All new tables get RLS scoped to the owner plus explicit grants.
- All AI and TTS calls stay server-side; no keys reach the browser. Visual style stays the existing dark SaaS dashboard.
