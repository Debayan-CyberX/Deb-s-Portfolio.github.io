# Debayan Lahiry — Portfolio

A cybersecurity and software-engineering portfolio set in a procedural Japanese mountain sanctuary. The site retains its Three.js scene, torii gates, moonlit palette, typography, foreground artwork, and optional soundscape.

[Open the portfolio](https://debayan-cyberx.github.io/Deb-s-Portfolio.github.io/)

## Explore

- React Bits Flex Carousel presents six selected projects: AEGIS-X, Tri-Shield, InboxIQ, TCP/IP Simulator, DrainSentinel, and LibraryLens. Each uses a screenshot of its actual landing page or application home.
- Case studies explain the problem, Debayan's implementation, a technical tradeoff, limitations, and a reproducible walkthrough.
- Skills link to project evidence and distinguish project work from coursework.
- The Playground contains the smaller security, algorithm, calculator, protocol, terminal, and 3D experiments.
- The CV viewer and download use `Debayan_Lahiry_Cybersecurity_CV.pdf`.

Debayan handled the technical implementation of the listed projects. For team projects, teammates contributed research and presentations. Third-party design and asset credits remain in the relevant project repositories.

## Local preview

```sh
node server.js
```

Open `http://localhost:3000/`. The homepage is static: no dependency installation, database, authentication service, or build is required to serve it.

## Updating project content

Edit `data/projects.json`, then regenerate the tracked HTML:

```sh
python scripts/build-projects.py
```

The renderer updates the marked project-card, case-study, and repository-fallback blocks in `index.html`. Content remains available in the HTML without a GitHub API response. `portfolio.css` extends the existing design tokens, and `portfolio.js` handles case-study dialogs and overlay keyboard navigation.

Actual application previews are stored in `image/inbox-live-preview.png` and `image/tcp-live-preview.png`.

## Interactive sanctuary

The existing HTML and Three.js scene remain the page foundation. `src/sanctuary.jsx` adds small React islands using source obtained through the official React Bits MCP registry:

- Flex Carousel automatically advances every five seconds, with pause/play, drag, arrow keys, explicit project buttons, previous/next controls, and a show-all view. It pauses on hover, keyboard interaction, open overlays, and while offscreen or the document is hidden. Reduced-motion mode uses manual navigation. A static six-card layout remains available when WebGL is unavailable or its context is lost.
- Staggered Menu styled as layered shoji screens, with focus containment, Escape, CV access, and palette controls.
- Spotlight Card adds a restrained lantern glow to Skills and Playground; keyboard focus receives a corresponding highlight.
- Stepper turns each project's documented walkthrough into four selectable steps with implementation evidence.
- Bell Toggle operates the existing procedural soundscape. Its menu and HUD instances stay synchronized. Audio starts only through a user action.
- Magnet gives key actions at most three pixels of pointer movement; it is disabled for touch and reduced motion.
- Decrypted Text briefly reveals small project category labels.
- Rubber Segment controls the existing Sanctuary, Matrix, Violet, and Ember palettes.
- Scroll Expand frames actual InboxIQ and TCP/IP Simulator screenshots. Full-image links remain available.
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

## Deployment

The GitHub Pages workflow in `.github/workflows` publishes the repository's static files on pushes to `main`. Relative asset and CV links support the repository's `/Deb-s-Portfolio.github.io/` base path.

## Current boundary

The contact form is a visual placeholder and has no delivery integration. It was deliberately left unchanged while the project presentation was updated. Use the email and social links for correspondence until delivery is implemented.

## Credits

Portfolio content and implementation: Debayan Lahiry. The existing sanctuary scene, fonts, and retained assets remain in their original locations. Interactive components are adapted from [React Bits by David Haz](https://reactbits.dev/) under its [MIT + Commons Clause license](src/react-bits/LICENSE.md). Source locations and local adaptations are documented in `src/react-bits/README.md`.
