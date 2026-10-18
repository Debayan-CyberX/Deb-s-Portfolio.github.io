# Debayan Lahiry — Portfolio

A cybersecurity and software-engineering portfolio set in a procedural Japanese mountain sanctuary. The site retains its Three.js scene, torii gates, moonlit palette, typography, foreground artwork, and optional soundscape.

[Open the portfolio](https://debayan-cyberx.github.io/Deb-s-Portfolio.github.io/)

## Explore

- React Bits Flex Carousel presents six selected projects: AEGIS-X, Tri-Shield, InboxIQ, TCP/IP Simulator, DrainSentinel, and LibraryLens. Each uses a screenshot of its actual landing page or application home.
- An asymmetric editorial gallery gives InboxIQ and AEGIS-X more space, followed by four compact engineering studies.
- Eight-part dossiers explain the problem, implementation, architecture, security decisions, real interfaces, validation, and limitations. A next-project action continues the exhibition.
- The Journal pairs a personal note with the interactive identity pass. The Arsenal organizes evidence into four expandable disciplines.
- The Workshop separates security, networking, and terminal instruments from the smaller game, calculator, and 3D experiments.
- The Archive records verified education, product work, research, and training without inventing employment, dates, or credentials.
- The CV viewer and download use `Debayan_Lahiry_Cybersecurity_CV.pdf`.

Debayan handled the technical implementation of the listed projects. For team projects, teammates contributed research and presentations. Third-party design and asset credits remain in the relevant project repositories.

## Local preview

```sh
node server.js
```

Open `http://localhost:3000/`. The homepage is static: no dependency installation, database, authentication service, or build is required to serve it.

## Updating project content

Edit `data/projects.json` for projects and `src/sections/*.html` for the lower sections, then regenerate all tracked HTML and bundles:

```sh
npm ci
npm run build
```

The build runs both Python renderers, bundles the React islands, and fingerprints changed CSS and JavaScript. Python 3 and Node.js are build-time requirements. Serving the committed site requires neither. `src/editorial.css` defines the editorial system; `portfolio.js` handles dialogs, reading scenes, and overlay keyboard navigation. Content and repository links remain available without a GitHub API response.

Actual application previews are stored in `image/inbox-live-preview.png` and `image/tcp-live-preview.png`.

## Interactive sanctuary

The existing HTML and Three.js scene remain the page foundation. `src/sanctuary.jsx` adds small React islands using source obtained through the official React Bits MCP registry:

- Flex Carousel glides continuously at 48 pixels per second, including while hovered, with pause/play, drag, arrow keys, explicit project buttons, and previous/next controls. Direct interaction briefly takes control; gliding resumes after the interaction settles. Open overlays, offscreen content, and hidden documents pause the renderer. Reduced-motion mode uses manual navigation. The editorial gallery remains available when WebGL is unavailable or its context is lost.
- Staggered Menu styled as layered shoji screens, with focus containment, Escape, CV access, and palette controls.
- Spotlight Card adds a restrained lantern glow to Skills and Playground; keyboard focus receives a corresponding highlight.
- Stepper turns each project's documented walkthrough into four selectable steps with implementation evidence.
- Bell Toggle operates the existing procedural soundscape. Its menu and HUD instances stay synchronized. Audio starts only through a user action.
- Magnet gives key actions at most three pixels of pointer movement; it is disabled for touch and reduced motion.
- Decrypted Text briefly reveals small project category labels.
- Rubber Segment controls the existing Sanctuary, Matrix, Violet, and Ember palettes.
- Dossier screenshots use ordinary document scrolling and full-image links, avoiding a second scroll container inside the modal. The previously installed Scroll Expand source is retained but no longer bundled.
- Lanyard provides a draggable, turnable identity pass in About. It loads near the viewport and uses locally authored vector faces, a procedural strap, and brass hardware. Ordinary CV and GitHub links remain beside it.

Carousel images are unaltered browser captures in `image/project-previews/`; their live/local sources are documented in that directory's README. The identity-pass faces remain code-native SVGs from `scripts/build-artwork.py`. Earlier vector workflow studies are retained as source assets, but are no longer used for project cards or carousel textures.

To update interactions or vector artwork:

```sh
npm ci
python scripts/build-artwork.py
python scripts/build-projects.py
npm run build
```

The compiled files in `assets/interactions/` are committed so GitHub Pages and `node server.js` can serve the site without a runtime build. The identity pass is a separate lazy-loaded JavaScript chunk.

The original scene is maintained in `src/sanctuary-scene.js`, compiled to `assets/scene/sanctuary.js`, and loaded with `defer` after its retained Three.js dependency. This keeps scene parsing out of the HTML parser's critical path and permits independent browser caching.

Touch devices use `assets/sanctuary-materials/mobile.json`, a lossless PNG archive sampled from the original procedural canvas materials. This avoids regenerating per-pixel normal maps on a phone. Full desktop factories and a missing-archive fallback remain. Rebuild the archive after editing material factories with `PLAYWRIGHT_MODULE=... node scripts/bake-sanctuary-materials.cjs` against the local preview. Mobile content remains usable while the scene loads; the progress indicator reports actual initialization steps. The carousel initializes near its viewport.

## Deployment

The GitHub Pages workflow in `.github/workflows` publishes the repository's static files on pushes to `main`. Relative asset and CV links support the repository's `/Deb-s-Portfolio.github.io/` base path.

## Verification

The responsive and functional browser suite is `scripts/verify-editorial.cjs`. Install Playwright separately, then set `PLAYWRIGHT_MODULE` to its package path and optionally `CHROME_PATH`, `PORTFOLIO_URL`, and `PORTFOLIO_TEST_OUTPUT`. It checks seven widths, all six dossiers, carousel controls, the labs, exact CV bytes, navigation, source fallbacks, and the email-draft flow. See [the redesign report](docs/digital-kyoto-redesign.md) for measured results and screenshots.

## Contact

Direct email and social links are the primary contact actions. The optional note composer opens a `mailto:` draft, retains entered text, and explicitly asks the visitor to review and send in their email app. No delivery service is connected and no success or receipt is claimed.

## Credits

Portfolio content and implementation: Debayan Lahiry. The existing sanctuary scene, fonts, and retained assets remain in their original locations. Interactive components are adapted from [React Bits by David Haz](https://reactbits.dev/) under its [MIT + Commons Clause license](src/react-bits/LICENSE.md). Source locations and local adaptations are documented in `src/react-bits/README.md`.
