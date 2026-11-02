# Hair & Makeup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Overhaul the copied beauty/social game into a coherent, polished mobile experience.
**Architecture:** Keep the existing modular Three.js engine and React interface. Add shared art-direction helpers and a genuine boot/arrival lifecycle, preserving wardrobe material hooks and saves.
**Tech Stack:** Three.js, React, TypeScript, Vite.
**Spec:** docs/superpowers/specs/2026-11-02-mobile-studio-design.md

## Global Constraints
- Preserve current saves, clothing customization, activities, and venue dance.
- Original Barbie repo untouched; destination Hair-and-Makeup.
- Portrait mobile, minimum 44px controls, no select dropdown dependency.
- No old image start screen; actual readiness and skippable arrival.
- No full-screen postprocessing; low-quality path remains usable.

## Review Focus
- WebGL/shader boot failures must leave a visible recovery path.
- Leaving intro or panels must restore correct movement input and camera.
- Existing dyes, patterned garments and skinned hair continue rendering.
- Collected IDs never re-award across saves.
- 360x640 panels/controls remain in viewport, camera fingers independent of joystick.

### Task 1: Boot, arrival and compact interface
- [x] Read existing App, GameView, UI components and reference brief.
- [x] Add StudioBoot and startup model; remove StartScreen use. Readiness comes from GameView callbacks, not a cosmetic timer. GameView calls createGame with optional fifth onBoot(status) argument. Boot status {phase:'building'|'shaders'|'ready',progress:number,label:string}; ready emitted only after shader warmup/first render. Scene engine adds playArrival(skip:boolean=false) and finishArrival() methods on GameHandle. UI can call after ready. Arrival total 7 seconds; UI skip finishes early. Engine camera cinematic belongs to root implementation.
- [x] Compact HUD, contextual actions, more useful collectible reveal/album visual layout. Preserve callbacks/save behavior. Own App.tsx, components/GameView.tsx, ui/* and new studio-ui.css only; no engine edits.
- [x] Typecheck, lint scoped files and meaningful startup model test.

### Task 2: Art direction and world
- [x] Add shared Standard-compatible stylisation and hair shader hooks. Preserve clothing hooks. Add quality-aware selective character silhouettes.
- [x] Improve ocean surface and shoreline, environmental wind, building facades and sparkles. Add shared procedural resources with disposal.
- [x] Add real boot callback and arrival engine methods, with world camera update overridden only during active intro.
- [x] Preserve scene batching and low mode; test shader wiring and startup/arrival cleanup.

### Task 3: Camera, collectible models and integration
- [x] Improve follow with frame-rate independent target/camera smoothing while preserving collision and photo framing.
- [x] Improve eight pickup displays, foil treatment and visibility, retain identity/proximity logic.
- [x] Update branding/importer manifests to destination. Run typecheck/lint/full tests/build.
- [x] Inspect 360x640 and larger portrait runtime, intro skip, panel flows, console/shader errors. Fix issues.

### Task 4: Review and publication
- [x] Independent whole-change review; address important issues.
- [x] Regenerate import manifest, commit and publish new repo without altering source repo.
- [x] Document what changed, checks passed and any device limitations.
