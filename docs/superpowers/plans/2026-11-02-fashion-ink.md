# Fashion ink implementation plan

Goal: visible black silhouette treatment and fashion presentation without losing the existing UI and customization.
Spec: docs/superpowers/specs/2026-11-02-fashion-ink-design.md

- [x] Replace limited plum rigid contours with a shared pixel-width, skinning-aware black outline system; exclude small face details and non-solid surfaces; cull world strokes by range/quality.
- [x] Reduce flat fill and tune the existing toon ramp for visible form, keeping patterns/dye/metallic effects.
- [x] Improve travel-driven NPC gait and preserve route/photo state (delegated isolated task).
- [x] Dress the runway and stage a real walk/pose intro; skip/reset restore actor and camera without affecting rewards or physics state.
- [x] Add focused tests, run regression suite and portrait browser QA; review important changes.
- [x] Publish updated source and commit-pinned Aippy delivery.
