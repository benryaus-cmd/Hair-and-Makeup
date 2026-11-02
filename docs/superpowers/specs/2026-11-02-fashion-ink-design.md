# Fashion ink and runway presentation

User feedback: keep the improved UI. Focus on stronger black outlining and visual separation inspired by Gym Rat, a fashion-show intro, and NPCs reading as walking rather than sliding.

Implementation direction: selective near-black geometry silhouettes for the player, outfit/hair, residents and substantial world props. Preserve face detail, glass, particles and water; avoid tracing every tiny decoration. Support deformed garments/hair correctly. Keep outlines in low quality with a smaller nearby-world budget, rather than removing the requested look. No full-screen postprocess buffers.

Strengthen lit/shaded separation and reduce washed-out fill, preserving pastel fashion colours and Standard material customisation. Add a runway presentation layer to the existing avenue: darker catwalk, bright edge strips, backdrop and front-row set dressing. The seven-second skippable opening shows actual doll movement/pose on this set, then returns cleanly to the saved exploration state. Reduced motion skips it.

NPC walking should have a grounded, travel-driven gait at normal pedestrian speeds with readable alternating steps. Preserve conversations, photo poses, route stops and original venue dance.

Verification: focused outline transform/skinning/selection tests, readable NPC gait tests, runway intro/input/skip restoration checks, then typecheck/lint/full tests/build and actual portrait browser screenshots including player/photo companion/buildings. Publish source and refreshed Aippy manifest/prompt to Hair-and-Makeup only.
