# Finish Hyvo Co-Pilot Wiring + JARVIS Landing Hero

## What this does

Finishes the always-on Hyvo voice agent so it's actually live inside the app, then updates the landing page hero with your uploaded JARVIS-style command-center image — while making clear that the full AI co-pilot experience lives in the downloadable desktop app.

## Changes

### 1. Mount the Hyvo Dock (finishes the co-pilot build)
- Mount `<HyvoDock />` inside `AppShell.tsx` so the co-pilot bar (mic, status, transcript, activity feed) follows the user across all authenticated pages: Dashboard, Studio, Schedule, Growth, Community, Settings.
- Keep it hidden on public/marketing pages by virtue of AppShell only wrapping in-app routes.

### 2. Hyvo Co-Pilot settings card
- New "Hyvo Co-Pilot" card in `Settings.tsx` (placed at the top of the settings stack) wired to `useHyvoSettings`:
  - Wake word toggle + editable wake word (default "hyvo")
  - Push-to-talk key (Ctrl+Shift + configurable key, default V)
  - Voice picker using the curated `HYVO_VOICES` list + voice on/off toggle
  - Autonomy level select: Off / Assist / Autopilot
  - Auto-moderate and Auto-answer background toggles
- Note in the card that continuous background listening is most reliable in the desktop app.

### 3. Landing hero: JARVIS image
- Register the uploaded image (`Gemini_Generated_Image_mr6si3mr6si3mr6s.jpg`) as a Lovable asset pointer (not a repo binary copy).
- Replace the dashboard screenshot in `Hero.tsx`'s right column with it — it matches the existing dark cyan sci-fi look exactly.
- Adjust the floating HUD overlays to fit the image: keep the LIVE badge, swap the "Stream Health" card for a "Hyvo Co-Pilot • Voice Active" card, keep the AI Active chip.

### 4. "The real AI is in the download"
- Hero copy tweak: sub-line under the CTAs — "The full always-on voice co-pilot runs in the desktop app."
- On `/download`, add a short highlight line that the desktop app includes the Hyvo voice co-pilot (wake word + push-to-talk), so download intent is tied to the AI.

### 5. Project memory
- Save a memory: landing page uses the JARVIS holographic aesthetic (uploaded image); the full Hyvo AI co-pilot experience lives in the desktop download — keep download CTAs tied to the AI agent.

## Technical notes
- No new backend work: `hyvo-agent`, `elevenlabs-tts`, and the `hyvo_agent_*` tables already exist.
- Asset created via `lovable-assets create` from `/mnt/user-uploads/`, imported as an `.asset.json` pointer.
- Verification: `tsgo` typecheck + build log check after edits.
