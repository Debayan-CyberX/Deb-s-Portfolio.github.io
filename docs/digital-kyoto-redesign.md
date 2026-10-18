# Digital Kyoto — editorial redesign

Implemented on 18 October 2026 in the existing static GitHub Pages portfolio.

The sanctuary, torii, moon, maple trees, weather, DEBX wordmark, continuous curved carousel, soundscape, identity pass, six project dossiers, CV, and six interactive tools are retained. No generated illustrations, stock substitutions, new runtime libraries, or hosting changes were introduced.

## Design and content

- **Sanctuary:** shorter introduction, clear projects/CV/contact actions, local contrast treatment, restrained grain and chromatic aberration.
- **Exhibition:** the continuous React Bits Flex Carousel is the entrance. Its selected-project summary is separate from the always-available editorial gallery. InboxIQ and AEGIS-X receive asymmetric features; four smaller projects become engineering studies. The redundant repository grid is an expandable source index.
- **Dossiers:** eight numbered sections cover the problem, personal implementation, architecture, engineering decision, security, real screenshots, current boundaries, and source/validation links. The guided four-step walkthrough remains. A next-project action keeps the original return point. Screenshots use the dialog's regular scrolling and full-image links.
- **Journal:** a personal note, clear implementation credit, education/focus facts, CV actions, and the existing draggable/turnable 3D identity pass.
- **Arsenal:** four native expandable disciplines connect project experience, academic foundations, and continued learning to evidence.
- **Workshop:** security, protocol, and terminal instruments receive greater emphasis; the game, calculator, and spatial inspector form a smaller experiment shelf. The graphics are authored HTML/CSS diagrams, with illustrative bytes labeled as such.
- **Archive:** expected 2028 graduation, live InboxIQ product, InjeX research preview, CV-listed training, and Supply-Chain-AI team credit. No employment, awards, performance metrics, or credential dates were invented.
- **Final scene:** direct email, GitHub, LinkedIn, CV, a quiet signoff, and a compact optional email-draft composer. It retains the visitor's text and never claims a message was received. No contact-delivery service is connected.

InboxIQ now links to its verified custom domain, `https://inboxiq.debx.co.in/`; its landing screenshot was recaptured there. AEGIS-X retains the user's current titanium-ribbon landing page. InjeX's public frontend was inspected, but its detector service was unavailable, so it is labeled as a research preview rather than added to the six flagship projects. Project capabilities and training draw on the source repositories and the supplied CV.

## Files and components

| Area | Source |
| --- | --- |
| Original page, labs, loading, SEO | `index.html` |
| Deferred original scene, mobile material loading, render budgets | `src/sanctuary-scene.js`, `assets/scene/sanctuary.js` |
| Editorial tokens, responsive layouts, gallery, dossiers | `src/editorial.css` |
| Editable lower chapters | `src/sections/{journal,arsenal,workshop,archive,contact,footer}.html` |
| Content and architecture/security notes | `data/projects.json` |
| HTML generation | `scripts/build-sections.py`, `scripts/build-projects.py` |
| Carousel summary, lazy initialization, menu, existing React islands | `src/sanctuary.jsx`, `src/sanctuary.css` |
| Current-section semantics | `src/react-bits/StaggeredMenu/StaggeredMenu.jsx` |
| Dialog transitions, focus, section state, details resizing | `portfolio.js` |
| Build and asset fingerprints | `scripts/build-interactions.cjs`, `assets/interactions/` |
| Mobile material archive and reproducible baker | `assets/sanctuary-materials/`, `scripts/bake-sanctuary-materials.cjs` |
| Real project image and social preview | `image/project-previews/inbox.jpg`, `image/digital-kyoto-social.jpg` |
| Browser regression suite | `scripts/verify-editorial.cjs` |

The build commits static HTML and bundles; the existing Pages workflow needs no build/runtime changes. The unused Scroll Expand source remains credited in the source archive but is no longer loaded. The 22 original registered ThreeUI files/assets retain their exact hashes. The nested, untracked duplicate checkout was left untouched.

## Accessibility and functional fixes

- Native details, a main landmark, associated form labels, clear focus outlines, current-section semantics, and accessible names for animated headings.
- Sticky dossier controls respect scroll padding; modal focus, Escape, backdrop closing, and return focus remain functional.
- Reduced motion uses manual carousel browsing and restrained transitions. WebGL failure keeps ordinary project content and source links available.
- Fixed layers use the CSS viewport so the mobile menu remains inside the screen.
- The game board uses real buttons, ignores extra moves during the AI turn, and cancels stale AI timers on reset/close.
- The terminal escapes echoed input and labels the scan as simulated. Calculator errors recover on the next numeric input, including divide/modulo by zero.
- Password strength is explicitly an educational character-pool estimate; the unsupported “unbreakable” claim was removed. The network lab describes its implemented TCP sequence and illustrative ClientHello accurately.

## Measured performance

These are reproducible local measurements, not claims about every visitor's device.

In a 3,005 ms, 1440 × 1000 Chrome sample at Skills, the main scene rendered **83 times versus 496 before**. The original unbounded loop followed the headless display cadence; the revised reading budget caps rendering near 30 fps. This is about an **83% reduction in render submissions**, not an 83% improvement in user frame rate. Idle ember-canvas clears fell from **496 to zero**. The geometry and scene remain; cursor updates stop when settled, and sparks run only while needed in atmospheric sections.

Touch devices use 26 authored materials / 40 maps sampled from the original procedural canvases into approximately 2.8 MiB of lossless PNGs. This trades extra cacheable transfer for much less per-pixel texture-generation work and smaller GPU textures. Desktop keeps the full procedural materials; a missing archive falls back to the original factories. Mobile text/navigation remain usable while the scene prepares, and the progress indicator reflects real initialization. The carousel initializes near its viewport, and the identity pass remains lazy-loaded.

One Lighthouse mobile run against the **uncompressed local preview server**, using Lighthouse's default simulated throttling:

| Metric | Initial editorial pass | Final progressive-loading pass |
| --- | ---: | ---: |
| Performance | 22 | 52 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| Total blocking time | 14,020 ms | 220 ms |
| Cumulative layout shift | 0.107 | 0.060 |
| First contentful paint | 10.1 s | 10.0 s |
| Largest contentful paint | 13.0 s | 12.4 s |

The requested 90+ performance target is **not established by this local run**. Cold transfer and render-blocking work remain limitations. GitHub Pages serves the HTML with gzip, while the local server does not; these local timings should not be presented as hosted measurements or field Core Web Vitals. A subsequent refinement extracts and minifies the original scene into an independently cacheable, deferred script and keeps the mobile wordmark inside the frame. Its functional smoke checks passed at 320, 390, 768, and 1440 pixels. Further gains require reducing legacy inline styles and optimizing media/scene delivery; the high-performance target must not be claimed without measurement.

The **final hosted mobile Lighthouse run** against release `7eb25f2` scored **33 performance / 100 accessibility / 100 best practices / 100 SEO**, with **3.8 s FCP, 6.6 s LCP, 3,490 ms total blocking time, and zero CLS**. Before extracting the scene, the first hosted release scored 44 performance with 5.8 s FCP, 7.8 s LCP, and 610 ms blocking time. Deferral makes content paint sooner and caches the scene independently, but more initialization work now occurs after that first paint and remains visible in the blocking-time metric. These runs vary with network and browser/GPU initialization; they do not establish the requested 90+ target or field performance. The local 220 ms result above must not be substituted for this hosted result.

## Verification

- Production bundle build and repeatable HTML generation.
- Browser widths: **320, 375, 390, 768, 1024, 1440, 1920**. Document width is checked against `clientWidth`, including open skill rows and dossiers.
- All six dossiers, architecture diagrams, step selections, keyboard focus, Escape, next-project transitions, source index without the GitHub API, and shoji navigation to the new Archive.
- Continuous carousel movement while hovered, explicit pause/resume, project selection, arrow keys/Enter, and context-loss fallback. Separate mobile checks exercised a real touch drag, reduced motion, missing WebGL, and JavaScript-disabled content.
- Actual SHA-256 output for `abc`, empty-input reset, password estimate, TCP/TLS steps/reset, terminal commands/history/escaping, game turn/reset, calculator arithmetic/error recovery, and the 3D inspector overlay.
- CV viewer and downloaded PDF bytes match the supplied CV. Email validation and draft preparation were tested without sending a message. Palette changes and synchronized sound controls were exercised.
- Axe checks of the page, dossier, menu, and cryptography overlay found **no WCAG A/AA violations in those tested states**. This does not certify every state or device.
- Original 22-file hash verification passed. Browser checks found no uncaught page errors or missing local assets.
- After deployment, the functional suite also passed against the live GitHub Pages URL: continuous carousel/pause, dossier keyboard selection, all six labs, email draft, exact CV, palette/audio, and WebGL-loss fallback. Release `7eb25f2` was verified live; the following documentation/whitespace commit does not change its runtime bundle.

## Screenshots

Actual browser captures; the before images use commit `9da0fc6`.

| Before | After |
| --- | --- |
| [Sanctuary](screenshots/before-sanctuary.jpg) | [Sanctuary](screenshots/1440-sanctuary.jpg) |
| [Skills](screenshots/before-skills.jpg) | [Arsenal](screenshots/1440-arsenal.jpg) |

[Exhibition](screenshots/1440-exhibition.jpg) · [Journal](screenshots/1440-journal.jpg) · [Workshop](screenshots/1440-workshop.jpg) · [Archive](screenshots/1440-archive.jpg) · [Final scene](screenshots/1440-contact.jpg)

[Mobile sanctuary](screenshots/390-sanctuary.jpg) · [Mobile exhibition](screenshots/390-exhibition.jpg) · [Mobile journal](screenshots/390-journal.jpg) · [Mobile Arsenal](screenshots/390-arsenal.jpg) · [Mobile Workshop](screenshots/390-workshop.jpg) · [Mobile Archive](screenshots/390-archive.jpg) · [Mobile contact](screenshots/390-contact.jpg)

## Deployment

Run `npm ci` and `npm run build` after source changes, review the generated files, then push to `main`. The existing GitHub Actions Pages workflow publishes the committed static site at its current repository URL. No DNS or secret changes are required.
