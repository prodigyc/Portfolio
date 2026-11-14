# Amer Jweihan — Immersive Portfolio (V4 Refined)

This version is a **targeted refinement of the original V4**, not the V5 redesign.

## What changed

- Archive still uses its original scroll-driven 3D corridor. Clicking a screen **expands the selected project in a full-screen overlay immediately**, without navigating down to the gallery. A numbered case index supports keyboard and touch interactions, and the overlay has previous/next buttons.
- The original contact headline stays visible and unchanged. Cursor movement and clicks instead **fracture the neon environment behind it** into reactive triangular shards; it settles back naturally.
- The former interactive scanner board is replaced with an original blue **architectural data rift** scene with a mirrored megacity, mouse-driven camera displacement, scroll depth, and a glitch pulse button.
- The original V4 hero and voxel mode, project gallery, certifications, contact information, and navigation remain.

## Run locally

Extract the folder, open a terminal **in the folder containing `index.html`**, then:

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

## Deploy

The existing GitHub Pages workflow remains in `.github/workflows/pages.yml`.

## Notes

- V4 is a static site: no npm installation or build step is required.
- The archive, rift, and contact environments use Canvas 2D and run without WebGL. Anime.js motion uses the CDN when available and falls back to native Web Animations.
- Reduced-motion and mobile/touch layouts remain supported. The archive overlay uses a native HTML `<dialog>` for focus handling and Escape-to-close behavior.
- Original case-study data and assets are in `projects.js` and `assets/`.
