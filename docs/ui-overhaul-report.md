# Hair & Makeup mobile interface overhaul

Implemented Task 1 of the mobile studio plan in the destination repository. Existing wardrobe, hair, makeup, photo/social, pet, activity and dance callbacks and legacy storage keys remain connected.

## Changes

- Removed the unused image title/start component, including its dead preload reference. Startup is a CSS and typography surface with actual engine status and progress, followed by the skippable seven-second 3D arrival. Three chapter labels follow the arrival. System or saved reduced-motion preferences bypass the cinematic after readiness.
- Added a tested startup reducer that rejects premature finish, stale boot transitions and readiness after an error. GameView forwards the real engine boot callback, ignores disposed callbacks and keeps the game mounted while settings change. Explicit graphics recovery reconstructs the engine once and restores saved looks and collections.
- Errors stop movement, finish the arrival, clear competing panels and pending synchronization work, and expose Retry / Use lighter graphics. All arrival, chapter and UI timers have cleanup paths.
- Condensed the world HUD to location, balance, next goal, collection, a prominent camera/feed action and one expandable tool shelf. Contextual actions appear when useful. Kept independent joystick/camera surfaces.
- Added a coordinated cream, plum and sea-glass UI frame, 44px minimum controls, safe-area spacing, scrollable half-height beauty/wardrobe sheets, reachable photo actions and motion preferences.
- Rebuilt the collection as an editorial album with intact card proportions, clues, rarity, progress, reward and milestone feedback. Missing remote art has a styled fallback. Collection rewards use the shared engine reward helpers and duplicate IDs remain guarded before awards.

## Verification

- `node --test tests/startup-model.test.mjs`: 4/4 passed (real-readiness gating, reduced motion, error/retry/stale transition handling, progress bounds).
- Scoped ESLint for App, GameView, modified UI and the new test: passed.
- `npm run typecheck`: passed, both application and Node TypeScript projects.
- Real Chromium/SwiftShader at 360×640, low and balanced graphics: eight browser behavior checks passed. Checked intro input gating and skip, wardrobe movement restoration, actual photo capture, album clues, makeup callbacks, reveal, error recovery and 44px HUD targets. Screenshots visually checked for wardrobe, camera and album. Test-only source transforms expose read-only handles and trigger existing production callbacks.
- The initial full-suite run exposed JSDOM focus scheduling a `selectionchange` timeout ahead of the DJ timer in `tests/stage-controls-runtime.cjs`. Panel now schedules visual focus with requestAnimationFrame and cancels it on cleanup, preserving focus restoration. `node tests/stage-controls-runtime.cjs` passes all ten DJ beats and the full reward. Root owns final combined-suite validation.
- Four additional browser checks passed: system reduced-motion bypass, live quality updates without rebuilding the game, error recovery above an open Settings panel, and playable input after reduced-motion recovery. Evidence: `.test-output/ui-reduced-motion-report.json`.

## Browser evidence and limitations

Temporary browser harness/report and screenshots are in `.test-output/ui-browser-check.mjs`, `.test-output/ui-browser-report.json`, and `.test-output/ui-*.png`. A genuine branded boot and arrival were also captured at `/tmp/hair-studio-start.png` and `/tmp/hair-studio-arrival.png`.

Balanced and low runs reported no JavaScript, geometry or shader errors after the engine batching correction. External image/audio requests returned `ERR_EMPTY_RESPONSE` in this environment; screenshot fallback art is deliberate. SwiftShader warns that parallel shader compilation is unavailable. These checks validate a software WebGL browser, not physical device frame rates.
