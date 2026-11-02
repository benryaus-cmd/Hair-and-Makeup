# Mobile studio overhaul code review

Reviewed the combined working tree against `docs/superpowers/specs/2026-11-02-mobile-studio-design.md`, including the newer Panel changes. This was a source review; the implementer's passing test, typecheck, lint, production-build and mobile-browser results were supplied as context and were not rerun by the reviewer.

## Verdict

The two original P2 findings below were addressed during review and their source changes were reread. No remaining blocker was found; final approval is contingent on the implementing agent's focused post-fix verification. The overall implementation follows the agreed visual/UI direction and retains the existing game systems. No critical issue or concrete wardrobe-shader composition or collectible reward-deduplication regression was found.

## Important findings

### P2 — Independently smoothed follow target is still missing

Location: `src/game/camera.ts:244–257`.

The spec and Task 3 explicitly require target smoothing independently from camera smoothing. The changed rig damps camera distance and position, but `desired.copy(target)` and `lookAt.set(target.x, target.y + 1.0, target.z)` still consume the instantaneous physics target. On jumps, steps or abrupt movement, camera orientation immediately follows that change while its position lags. This preserves the aim bob/jerk that the requested target smoothing is meant to address. The new test compares final camera positions at different frame rates and does not exercise aim continuity.

Retain and exponentially damp a separate world-follow target, seed/reset it on camera resets and mode transitions, and handle teleports explicitly. Keep raw travel measurement independent of the smoothed value; preserve obstruction protection and the existing immediate presentation/photo framing. Verify that a target step does not immediately move aim to the final target, then recheck nearby-wall clearance and frame-rate equivalence.

### P2 — A synchronous warmup exception escapes ownership and leaks the old engine during retry

Locations: `src/game/create-game.ts:343–344`, `src/components/GameView.tsx:88–90`; related unguarded setup at `src/game/create-game.ts:163–169`.

The animation loop and input listeners start before the direct `view.renderer.compileAsync(scene,camera)` call. In this installed Three.js version, `compileAsync` invokes `this.compile(...)` before constructing/returning its Promise (`node_modules/three/src/renderers/WebGLRenderer.js:1515–1522`). A synchronous exception from compilation therefore bypasses the Promise rejection handler. GameView catches it and displays recovery, but no GameHandle was returned, so its cleanup only marks callbacks inactive. The old renderer, loop, scope listeners and GPU resources remain alive when Retry mounts another engine. Repeated recovery can accumulate contexts/work on the very devices experiencing graphics trouble.

Keep synchronous warmup failures inside createGame's owned lifecycle so it reports an error and still returns a disposable handle, or dispose all owned resources before rethrowing. Apply the same ownership discipline to PMREM/post-sandbox setup that can throw before the handle is returned. Verify via a fault-injected synchronous compile exception that retry leaves one canvas/loop/listener set and disposal occurs once.

## Areas checked without important findings

- Existing Standard-material hooks are called before studio injection; initial wardrobe/hair hooks, wind and foil survive decoration. The studio wrapper is idempotent and carries forward its predecessor cache key.
- Low quality disables shadow rendering, hero contours, ambient wind/water motion and particle visibility; balanced rendering uses the requested DPR cap. No full-screen postprocessing was added.
- Startup cannot leave loading before ready, stale ready cannot clear an error, normal arrival/skip restore input through App state, and recovery remounts GameView deliberately.
- The world additions are cosmetic and add no blocking collider data. Static geometry batching normalizes indexed/nonindexed primitives before merging.
- Eight collectible IDs/storage keys remain intact. App updates its collected-ID ref before awarding, rejects duplicates, and applies rarity/milestones once per accepted ID. Rendering fallbacks preserve usable cards when external art fails.
- The compact HUD, scrollable sheets, reduced-motion CSS and Panel focus/escape handling fit the intended mobile structure.

## Minor limitations

- Reduced motion skips arrival and CSS animation, but is not passed to the 3D tuning; the new ambient wind/ocean/foil animation continues unless sparkles/quality settings disable the applicable effects. The approved spec explicitly requires bypassing the cinematic, so this is a limitation rather than an additional blocker.
- Arrival's UI handoff uses wall time while engine shots advance with fixed simulation steps. Backgrounding or very slow rendering can shorten the visible sequence and cause a larger final handoff. Skip remains functional.
- Browser evidence is Chromium touch emulation/software rendering, not an iOS/Android hardware performance or battery benchmark; external media-host failures remain an environment/content dependency.

## Resolution tracking

The findings above describe the reviewed pre-fix state. Both fixes were subsequently reread:

- Camera now retains an independently damped follow target, seeds it on mode/reset and large teleports, preserves raw travel measurements and keeps presentation framing separate. It also protects the real subject line of sight alongside the damped aim.
- Shader compilation now starts in an owned Promise continuation, so synchronous throws reach the existing rejection handler after a disposable handle exists. PMREM and post-sandbox setup now have explicit error cleanup.
- The HTML entry point now includes an immediate branded, static loading surface while the React bundle loads.

Post-fix verification passed:
- `node tests/studio-camera-runtime.cjs`: equivalent damping at 30/120fps, eased aim after a target height step, teleport reseeding and studio/world transition reseeding.
- `node tests/camera-runtime.cjs`: existing follow/deadzone/manual orbit, photo framing and thin-wall clearance checks remain green.
- `node tests/studio-boot-browser.mjs`: fault-injected synchronous compile exception produces recovery; retry disposes the previous renderer/animation loop and leaves exactly one playable canvas, with no page errors.

Final source-review verdict: both P2 findings resolved; no remaining source-review blocker. Hardware performance remains to be measured on a physical phone.
