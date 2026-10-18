# React Bits components

These JavaScript/CSS implementations were retrieved from the official `@react-bits` registry through its shadcn MCP server on 2026-10-18. They are integrated into Debayan Lahiry's portfolio, not redistributed as a standalone component library. See [LICENSE.md](LICENSE.md).

Registry source URLs are recorded in `SOURCES.json`. The recorded file hashes identify the local integrated versions.

Local adaptations:

- **Flex Carousel:** controlled selection for the project index, readiness/unavailable callbacks, WebGL-context-loss fallback, an accessible project-specific region label, and quiet screen-reader announcements during automatic rotation. A continuous autoplay mode advances the original engine at a constant pixel speed without timed steps or hover pauses. Dragging and navigation take temporary control, then the glide resumes. The screenshot texture uses its full framing without the original extra 8% zoom, preserving page navigation. The OGL lens effect and drag/keyboard engine are retained.
- **Staggered Menu:** optional footer and logo, item selection callbacks, current-section labels, a closed-panel inert state, keyboard focus containment, Escape/focus restoration, background inertness, and reduced-motion animation timing.
- **Lanyard:** a programmatic flip control and observable front/back state so an ordinary keyboard-accessible button can turn the card, static fallback on WebGL failure/loss, and pause while the document is hidden. The original procedural geometry, materials, strap, and physics are retained.
- **Spotlight Card, Stepper, Bell Toggle, Magnet, Decrypted Text, Rubber Segment, Scroll Expand:** original registry implementations, configured and restyled by the portfolio integration.
- **Magic Bento, Pixel Card, Scroll Stack:** registered JavaScript/CSS sources configured by `../SectionUpgrades.jsx` and `../section-upgrades.css`. Arsenal content uses original SVG diagrams and the existing evidence records. Workshop previews compute SHA-256 locally, model TCP packets, and expose a simulated command preview. Archive stacking uses native window scrolling without smooth-scroll interception, with ordinary document flow on small screens, reduced motion, and expanded training details. Each section retains its original HTML until its lazy-loaded enhancement mounts.

The common visual adaptations are in `../sanctuary.css` and `../editorial.css`; integration and real project content are in `../sanctuary.jsx`. Project diagrams and identity faces are original vector artwork from `../../scripts/build-artwork.py`. Scroll Expand remains in the source archive but is no longer mounted: dossiers use a single document scroll surface with full-image links.
