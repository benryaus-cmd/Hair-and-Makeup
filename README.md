# Hair & Makeup — The Studio

A portrait mobile beauty, fashion and social-world game built with Three.js, React and TypeScript. Create looks, visit the coastal studio district, meet residents, photograph outfits, grow a DreamFeed following and discover the eight-card collection.

This project copies the source of `benryaus-cmd/barbie` at `71a9680c4b55a40e863cc978da4dac57da96869b`, then adds a separate visual and mobile usability overhaul. The original repository is unchanged.

## This version

- Genuine scene/shader loading, followed by a skippable fashion-show walk and editorial pose on the catwalk. No image title screen.
- Light-driven poster ink: thicker shadow contours taper to fine lit edges, with smoothed extrusion normals, mobile antialiasing and cool toon shadows. Prints, dye, metallic finishes and glitter remain.
- Travel-driven NPC walking with knee bend, planted steps and heel/toe articulation.
- Black-and-ivory runway, front-row seating, lighting, fashion displays and a clear catwalk.
- Procedural ocean, shoreline foam, sun glints, palm wind, planted arrival plaza and upgraded salon/boutique architecture.
- Compact portrait HUD, camera/feed action, secondary tool shelf, scrollable styling panels and 44px minimum controls.
- Holographic collectible displays, rarity rewards, collection milestones, clue album and discovery presentation.
- Frame-rate independent camera damping, wall obstruction protection and preserved photo/studio framing.
- Existing wardrobe, facial customization, social photos, activities, original venue dance and save keys retained.

## Run

Use the package's supported Node runtime and install dependencies with `npm ci`, then `npm run dev`. `npm run build` produces a self-contained application bundle in `dist/index.html`. Published images/audio remain remote assets, with in-game collectible fallbacks when they are unavailable.

## Checks

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.

See `docs/mobile-studio-release.md` for verification evidence, reference-study notes and runtime limitations. This repository contains historical Barbie import prompts/docs from the source project; the root `AIPPY_UPDATE_PROMPT.txt` and current manifest are the authoritative release instructions.

## Aippy updates

This repository's importer targets `benryaus-cmd/Hair-and-Makeup`. It uses a checksum-verified, commit-pinned manifest and preserves the host's React entry and developer utilities. `github-import.config.json` stays disabled for normal local builds. Never enable it without the matching release metadata.
