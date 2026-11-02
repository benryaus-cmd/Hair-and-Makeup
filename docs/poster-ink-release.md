# Poster ink refinement

The uniform border now varies smoothly with the world key-light direction: a finer lit contour and a broad shadow contour. This gives illustrated line weight as the camera or doll moves. Near-black ink remains stable under tone mapping. The world uses a lighter base stroke than the character.

Outline-only geometries weld normals at coincident vertices, closing gaps between hard faces without changing surface shading. Position, index, skin and morph attributes remain shared. Smoothed normals and hull geometries are cached by source geometry and released with the scene. Separate hull geometry can add morph texture memory for wardrobe pieces; no new fullscreen render passes are added.

The Android renderer previously explicitly disabled antialiasing. It now requests native canvas MSAA while retaining existing resolution caps and quality choices. The unconditional pale rim is removed, with cool violet shadow tint and restrained material highlights supporting the poster palette. Authored white clothing trims and reflective materials remain.

Verification:
- Android-user-agent before/after in the actual game: antialias false before, true after; no runtime or shader errors.
- A dedicated production-renderer fixture gets four MSAA samples. At DPR 2, the lit contour measures 1 pixel and the shadow contour 4 pixels at the same cross-section. Rotating the sphere 60 degrees preserves these widths. The threshold counts ink coverage below 150/255 to include antialiased edge samples.
- Runtime assertions check identical normals at duplicate box corners, source-normal isolation, shared positions and skin weights, same skeleton/bind matrices, culling, idempotent refresh and one-time hull disposal without disposing source geometry.
- Full npm regression suite, TypeScript, ESLint and production build passed. Portrait front/world renders visually compared with the previous shader. Independent code review found no blockers.

The browser runs on software WebGL. Physical-phone frame rate and driver-specific antialiasing still require checking on device. The test requests MSAA; drivers determine availability.
