# Fashion ink release — 1.1.0

This pass emphasizes the fashion-world presentation while retaining the previous mobile UI and saved-game keys.

- Shared near-black, screen-width inverted-hull outlines on solid character/clothing meshes and nearby architectural forms. Skinned clothing shares its original geometry and skeleton. Facial details, jewelry, transparent surfaces and large terrain are excluded. Low graphics retains thinner character outlines and reduces the world range.
- A stronger stepped light ramp and reduced ambient fill make forms read against the pastel palette. Existing Standard-material prints, dyes and hair effects remain compatible.
- The seven-second skippable opening stages the actual doll walking and posing on the avenue catwalk. Physics position and rewards stay outside the performance; skip/end restore gameplay camera and position.
- A black-and-ivory runway set adds front-row seats, edge lighting, a portal and display looks. The photo garden, camera and activity marker move together off the catwalk, including instanced flowers and collision geometry.
- NPC walk phase follows actual route distance, with articulated knees/ankles, stance contacts and opposing arm swing. Photo poses and ordinary player movement retain their existing behavior.

Validation: focused outline/translation and pedestrian tests; the full runtime regression suite; TypeScript, ESLint, production build; portrait Chromium visual inspection and boot lifecycle checks. Browser checks use software WebGL, not a physical phone performance measurement. External CDN images/audio can be unavailable in the test environment.

The extra pedestrian denim-skirt margin probe is documented in pedestrian-gait-report.md. The regular garment regression remains unchanged.
