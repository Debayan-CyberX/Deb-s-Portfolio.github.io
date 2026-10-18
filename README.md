# Debayan Lahiry — Portfolio

A cybersecurity and software-engineering portfolio set in a procedural Japanese mountain sanctuary. The site retains its Three.js scene, torii gates, moonlit palette, typography, foreground artwork, and optional soundscape.

[Open the portfolio](https://debayan-cyberx.github.io/Deb-s-Portfolio.github.io/)

## Explore

- A 3D rack of ema-inspired wooden plaques presents six selected projects: AEGIS-X, Tri-Shield, InboxIQ, TCP/IP Simulator, DrainSentinel, and LibraryLens.
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

`project-rack.js` builds the original plaque geometry, wood-grain textures, cords, and timber rail using the existing Three.js runtime. `project-rack.css` styles the controls and selected-project panel. The rack supports dragging, touch swipes, previous/next buttons, and a keyboard-accessible project tab list. Project anchors select the corresponding plaque. The repository index can be expanded separately.

The additional renderer pauses outside the viewport, while the page is hidden, and while a case study is open. Reduced-motion mode renders on demand. If the rack cannot start or loses its WebGL context, the six static project cards and their case-study links remain available. No additional framework, model download, or external texture service is required.

Actual application previews are stored in `image/inbox-live-preview.png` and `image/tcp-live-preview.png`. The fallback cards use decorative sanctuary imagery rather than application screenshots. Plaque emblems and lettering identify projects; they do not represent application interfaces.

## Deployment

The GitHub Pages workflow in `.github/workflows` publishes the repository's static files on pushes to `main`. Relative asset and CV links support the repository's `/Deb-s-Portfolio.github.io/` base path.

## Current boundary

The contact form is a visual placeholder and has no delivery integration. It was deliberately left unchanged while the project presentation was updated. Use the email and social links for correspondence until delivery is implemented.

## Credits

Portfolio content and implementation: Debayan Lahiry. The existing sanctuary scene, fonts, and retained assets remain in their original locations; this update adds no new rendering framework or asset-generation dependency.
