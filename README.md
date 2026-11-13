# Amer Jweihan — Interactive Cinematic Portfolio (V3)

The cinematic portfolio from V2, now with physical pointer interactions and particle-based typography. Built with HTML, CSS, and JavaScript; no build process required.

## Run locally

```bash
python -m http.server 8000
```

Open http://localhost:8000 inside the `Amer_Interactive_Portfolio_v3` directory. Because the site dynamically imports Anime.js from a CDN, an internet connection is helpful for Anime.js, but all essential motion still works with the browser's built-in Web Animations API if offline.

## New in V3

### Interactive orbital globe

- Move the cursor onto the globe to push and distort the meridians and nodes; its HUD reacts too.
- Click the sphere to send a bright expanding pulse through the mesh.
- **Hold and drag** to spin it in any direction; when released, it keeps moving under inertia before returning to gentle automatic rotation.
- Double-click for a larger impact pulse.
- One optimized Canvas 2D renderer keeps the mesh and effects in sync. Animation pauses while the globe is offscreen.

### Destructible contact headline

- On desktop, **hover over the giant contact headline** and move your cursor through the letters to disintegrate them into tiny glowing particles.
- Fast mouse strokes throw fragments further and inherit your cursor's momentum.
- **Click the headline** for a powerful, much larger explosion.
- Particles spring back to their original letters after you leave the section. The actual HTML heading remains underneath for accessibility, SEO, and no-JavaScript fallback.
- Touchscreen and reduced-motion users get a clean, fully readable static headline.

### Smaller details

- Certification cards tilt subtly to follow the pointer, with a traveling spotlight.
- The large project visual gets a softer tracking light.
- Interactive hints guide visitors without covering buttons or hiding content.
- All V2 sections, project filters, the eight project case files, the filmstrip, certificate artwork, contact links, modal, and navigation are preserved.

## Implementation

- `interactive.js`: pointer input, globe projection/physics, rasterized contact-heading particles, hover lighting.
- `motion.js`: original cinematic transitions with Anime.js WAAPI and native Web Animations API fallback.
- `app.js`: original projects, gallery, filters, dialogs, mobile navigation.
- `projects.js`: project dataset.
- `styles.css`: original design plus responsive interaction styles.
- `assets/`: local project and certification visuals.

## Deploy to GitHub Pages

The `.github/workflows/pages.yml` workflow is included. Copy the **contents** of this folder into the repository root and publish the main branch through GitHub Actions.

## Accessibility & performance

The system respects `prefers-reduced-motion`, never replaces the semantic heading or mailto link with canvas-only content, switches off cursor destruction on touch devices, and caps device-pixel ratio to prevent oversized canvases. The original site remains functional if Anime.js cannot load.
