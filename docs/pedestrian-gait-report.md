# Pedestrian gait implementation

The detailed resident controller previously divided actual pedestrian speed (~1.1m/s) by the player's 4.5m/s animation speed. This reduced a foot's front/back travel to about 8.8cm and its lift to about 9mm. Its cadence advanced from clock time. Distance bodies had a single rigid 80cm leg and no articulated knee or shoe.

## Changes

- `createPedestrianGait().update(dt, distanceDelta, moving)` returns a `MotionFrame`. A full cycle covers .96m of actual route travel. Its 60% stance retreats the foot at exactly the resident's route speed; the opposite foot swings with a 7.5cm lift, knee fold, heel release and toe lift. Arms counter the advancing same-side leg.
- Every resident retains its own gait phase while shared detail slots change ownership. Route movement, waits, invitations, photo selection, pool residents and the detail budget retain their existing logic.
- Low-detail legs retain the existing hip pivots and silhouette materials but now contain knee and ankle pivots. Ken receives the same readable step and still uses his original photo approximations.
- `AvatarMotion.locomotionFrame` is optional. Explicit moving/grounded pedestrian input applies it before garment and hair updates. Standing/photo, seated and dancing states ignore it. The default player controller is unchanged. Pedestrian garment flare uses the existing full walking allowance so clothing does not inherit the tiny speed-scaled NPC allowance.
- Runtime imports use the project alias so the engine test loader and browser resolve the same helper.

## Verification

All commands below exited successfully:

```sh
node tests/pedestrian-gait-runtime.cjs
node tests/photo-runtime.cjs
node tests/poses-v7-runtime.cjs
node tests/motion-controller-runtime.cjs
node tests/engine-runtime.cjs
node tests/garment-rig-runtime.cjs
node tests/rear-gait-runtime.cjs
npm run typecheck
npx eslint src/game/residents.ts src/game/avatar.ts src/game/character/pedestrian-gait.ts tests/pedestrian-gait-runtime.cjs
```

The new focused test verifies actual ankle positions at 1, 1.2 and 1.4m/s, alternating support/swing, >48cm front/back span, support slip below 3mm, visible knee bend, heel/toe articulation, supported stops, equal travel at 20Hz/60Hz, actual rendered avatar foot bones and sneaker vertices, stale override exclusion for photo/sitting/dance, Ken's articulated low-detail gait, conversations/photos stopping his knees, and Brooklyn's shared detailed rig retaining a full readable step. It initially failed before the helper existed. Existing photo/pose tests also cover pool residents, saved route position, invitations and resuming travel.

An additional temporary probe reused `rear-gait-runtime.cjs` with the pedestrian frame across all six skirts. Five silhouettes, including the resident pleated skirt, passed. One denim-skirt sample had 1.2mm front coverage against the probe's conservative 2mm requirement (skin z=.18756, cloth z=.18876); that sampled point was covered but failed the safety margin. Broadening all garment flare raised hems and made this fixed-depth probe sample below the cloth, so that experimental allowance was removed. No `garment-rig.ts` changes remain. The normal player six-skirt test passes with 2,820 skin samples. This extra pedestrian denim margin remains a limitation for root's runway visual review.

The root agent owns full-suite/build/browser checks and publication. No commit was created. Existing Node Three.js CommonJS deprecation and npm proxy warnings remain unrelated to this change.
