# Architecture rules
- Electron uses HashRouter and opens /cockpit; the web root remains the marketing site because the desktop workspace is a separate experience.
- The cockpit is a full-bleed authenticated workspace that composes the existing voice agent, platform connections, telemetry and actions; do not duplicate their data sources.
- Desktop background artwork is a local project asset, not a remote image, so packaged installs can render offline.
