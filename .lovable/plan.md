# Landing Page Upgrade: Hyvo Desktop Co-Pilot

## Goal
Turn the landing page into a focused conversion experience that shows the real Hyvo desktop product, explains its streaming value quickly, and avoids unverified social proof.

## What will change

### 1. Outcome-led first screen
- Replace “Streaming is hard” with **“Focus on streaming. Your AI handles the rest.”**
- Tighten the supporting copy around Hyvo monitoring the broadcast, assisting by voice, and handling production tasks.
- Make **Download Hyvo for desktop** the primary action, with **Try the web app** as the secondary action.
- Keep the existing JARVIS command-center artwork and clearly position the desktop app as the full co-pilot experience.

### 2. Real desktop product preview
- Produce a short, silent, looping motion-graphics clip based on the actual Hyvo cockpit design.
- Show the central voice pulse, a spoken-command transcript, live viewer/chat telemetry, and an AI action completing.
- Embed it as an autoplaying, muted, inline preview with a poster image and reduced-motion fallback.
- Keep the clip lightweight and upload it through the project asset flow for reliable delivery.

### 3. Interactive capability explorer
- Turn Multi-Platform, Voice Co-Pilot, Scene Manager, Sources, and AI Tools into accessible tabs.
- Each tab will update a focused preview with one concrete benefit, a compact visual state, and an outcome.
- Support click, keyboard focus, and hover without making hover the only way to reveal information.

### 4. Credible platform trust
- Add a clean compatibility band for Twitch, YouTube Gaming, and Kick.
- Remove unverified claims such as “50K+ active streamers,” “4.9/5,” and fictional testimonials from the landing flow.
- Replace them with factual trust signals: desktop availability, OAuth-first platform linking, live telemetry, and streaming-focused AI.

### 5. Conversion and page-flow polish
- Reorder the page around a clearer journey: promise → product proof → interactive capabilities → platform trust → setup → final download action.
- Refine spacing, typography, CTA contrast, and mobile stacking while preserving Hyvo’s dark liquid-glass visual identity.
- Simplify the final action area so desktop download is unmistakably primary and pricing remains available without competing for attention.
- Respect reduced-motion settings and keep all controls readable and usable on mobile.

## Technical details
- Update the landing composition and its hero, platform proof, feature explorer, and final action sections.
- Build the product loop as a short 16:9 MP4 using Remotion, then store it as a CDN-backed project asset.
- Reuse the existing semantic color tokens, button components, fonts, and local cockpit artwork.
- Do not alter the authenticated desktop cockpit, streaming logic, billing, or authentication.

## Verification
- Check the landing page at desktop and mobile widths.
- Verify tab interaction by mouse and keyboard.
- Confirm the video autoplays muted, loops, and falls back correctly with reduced motion.
- Confirm all download and web-app actions navigate to the correct destinations.
- Run the relevant type checks and inspect the final preview for visual overlap or loading errors.
