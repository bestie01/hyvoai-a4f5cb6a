# Hyvo v2.5.3: Shark-led streaming setup

## Goal
Make first-time streaming setup approachable and visually match the uploaded futuristic command-center reference, with Hyvo’s shark companion guiding the experience. Add the shark to both the website hero and product preview while keeping the full always-on co-pilot positioned as a desktop-app feature.

## Work
1. **Version 2.5.3** — Synchronize the app and Electron package versions and any user-facing release/version surfaces that must match.
2. **Guided setup** — Replace the generic welcome tour with one clear, resumable checklist that covers the complete first-stream path: connect streaming accounts, configure camera/microphone and scenes using existing studio features, prepare stream details and destinations, review overlay options, and run a readiness check. Show real connection/device/readiness state; never mark a step complete from a demo or imply a broadcast is live when it is not. Let users skip or return to steps.
3. **Shark guidance and animation** — Feature the existing shark during setup with calm idle motion, step-aware reactions, and a distinct completion celebration. Keep reduced-motion and dismissible/compact states, and keep it out of the transparent OBS overlay.
4. **Command-center presentation** — Apply the uploaded image’s dark observatory, central holographic shark, and restrained cyan lighting to the authenticated setup/cockpit experience, while preserving existing auth, streaming data sources, and controls.
5. **Website** — Add the shark as a small animated hero companion and integrate it into the existing product preview. Keep the landing page marketing-only and retain desktop download as the primary path to the full voice co-pilot.
6. **Verification** — Check version consistency, first-run and returning-user setup behavior, real readiness status rendering, shark animation and reduced motion, public landing page, and desktop/mobile layout. Run applicable project checks and inspect preview/build signals.

## Technical notes
- Reuse existing account connections, studio/device setup, destinations, onboarding persistence, shark asset, and telemetry; do not create duplicate data sources or claim unsupported platform/API behavior.
- Real account linking and broadcast readiness depend on the user’s provider authorization, credentials, and available devices. The setup experience will report these honestly; it will not fabricate access or start a stream without the user’s action.
