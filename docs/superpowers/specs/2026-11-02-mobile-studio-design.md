# Hair & Makeup: mobile studio overhaul

User authorized copying benryaus-cmd/barbie into benryaus-cmd/Hair-and-Makeup and implementing a comprehensive mobile visual/usability overhaul. Source baseline: 71a9680c. Original repository remains unchanged.

Direction: a polished pastel coastal beauty/social world. Retain existing wardrobe, makeup, activities, progression and save keys. Preserve the venue dance rig. Use standard Three.js techniques learned from Gym Rat / Saiyan / Mecha, and compact UI hierarchy from Skateboard. Reimplement techniques rather than importing their games/art.

Approach: retain Standard-material wardrobe effects and articulated doll; add a coordinated soft stylised lighting treatment, selective silhouettes, directional hair highlights, procedural ocean/foam, architecture accents, wind and recognisable sparkles. Avoid wholesale MeshToon conversion because clothing shaders depend on Standard chunks. Retain spatial scenery batching.

Startup: immediate branded CSS loading surface, actual stage status and shader compilation, then a short skippable 3D arrival camera sequence; automatically hand off to playable world. Error remains actionable. No old Barbie image/start button. Reduced motion bypasses cinematic. No false simulated download progress.

UI: compact glass/cream/plum mobile HUD, 44px minimum control targets, portrait-safe viewport and safe areas, camera/feed primary action, collapsible secondary tools, useful location/next-goal hierarchy. Panels remain scrollable and usable on 360x640.

World: strengthen salon and boutique facades with bevels, windows, signage, planters, awnings and thresholds. Improve ocean/readability and character separation. World cosmetic changes must not block collision paths.

Collectibles: preserve eight IDs and persistence; improve pedestals, foil, silhouettes and reveal presentation; meaningful labels/progression, no re-awarding collected IDs. Existing online follower/score integration remains.

Camera: smooth target independently from camera, retain obstruction protection, preserve photo/studio orbits, follow deliberate travel promptly without fighting manual input. Test at different frame rates and around nearby walls.

Quality: cap balanced DPR about 1.25–1.35; low mode removes optional silhouettes/wind/expensive sparkle detail and shadow maps. No full-screen bloom/SSAO/SSR. Compile and disposal paths must be safe.

Validation: typecheck, lint, full existing tests; new focused behavior tests for boot and arrival, camera and collectibles. Render in a local browser using installed Playwright and inspect mobile screenshots; check console/shader errors and working makeup/photo controls. Final source committed and published to destination repo with importer pointing there.
