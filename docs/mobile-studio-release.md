# Hair & Makeup mobile studio release

## Source and scope

Copied source snapshot: `benryaus-cmd/barbie` commit `71a9680c4b55a40e863cc978da4dac57da96869b`. All development took place in a separate checkout targeting `benryaus-cmd/Hair-and-Makeup`. Original repository and its unrelated local changes were not modified.

## Delivered behavior

Scene construction, shader compilation and the first rendered frame drive the loader. Ready starts a 7-second three-shot in-world arrival; skip/reduced-motion hand off to gameplay. Graphics errors offer retry and low-quality recovery. Configuration changes preserve the mounted engine; retry remounts it deliberately.

Materials preserve the existing Standard lighting/wardrobe pipeline while adding a soft toon ramp, pastel fill, rim light, directional hair sheen and fine selective rigid contours. Buildings use rounded edges and a shared facade kit. New ocean uses no reflection buffers; procedural wave highlights, foam and sunlight run on one opaque surface. Palms share deterministic wind; low effects freeze optional water/wind and hide outlines. Collectible images remain progressively loaded with immediate generated artwork.

The interface condenses world navigation into location, wallet, collection, camera/feed and a secondary tool shelf. Styling/photo/makeup panels use compact typography, scrollable content and usable touch targets. Existing beauty/social logic and venue dance are preserved.

Collectible IDs and storage remain unchanged. Signature/Rare/Limited/Iconic give 15/25/40/75 base style points. Completing four cards adds 60; all eight adds 150. Existing follower reward multipliers apply. Duplicate IDs are rejected before awarding points.

## Reference use

Studied publicly delivered client code from Gym Rat Rumble, Saiyan Hero, Mecha Battle and Skateboard Pro. Reimplemented rendering and interface techniques in this codebase; none of their game bundles, character art or music is included. See reference-study.md.

## Verification

- TypeScript and ESLint checks performed on combined code.
- New tests cover actual readiness gating, startup error/retry states, reduced motion, shader hook composition/idempotence, finite arrival shots, rarity/milestone rewards and equivalent camera damping at 30/120fps.
- Mobile browser smoke at 360x640 in low and balanced modes: intro skip, input gating/restoration, wardrobe, makeup, real photo capture, album/clues, reveal, recovery remount, touch targets, reduced motion and live configuration updates.
- No JavaScript, shader-compile or geometry merge errors in those browser passes. Some remote image/audio requests return ERR_EMPTY_RESPONSE in the test environment; generated collectible fallbacks remain usable.
- Original full regression suite passed. Production build, typecheck and lint passed. A fault-injected synchronous shader compile failure was recovered with one disposed old renderer/RAF and exactly one playable replacement canvas. See code review report for the two resolved findings.

## Limits

Browser testing used Chromium software rendering with portrait touch emulation. It is not an Android/iOS hardware frame-rate or battery benchmark. Optional image/music hosts remain external. Music may require the first user gesture because of browser autoplay rules. This release improves an existing game rather than replacing its content/progression with a new backend.
