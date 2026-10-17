---
title: Babylon.js
kind: source
pattern: 3d
page_type: app
tags: [3d, webgl, open-source, interactive, engine]
source_url: https://www.babylonjs.com
source_site: babylonjs.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 9.31.0
licence: Apache-2.0
s_look: 3
s_interact: 5
s_coverage: 5
s_a11y: 3
s_perf: 4
s_react: 2
s_bundle: 1
s_licence: 5
why_it_works: A complete real-time 3D engine (physics, GUI, XR, node-based materials, a visual inspector and editor tooling) maintained by Microsoft, so complex interactive applications have batteries included.
use_when: Game-like or tool-like 3D applications (simulators, digital twins, XR, editors) where engine features matter more than page weight.
avoid_when: Marketing pages and product viewers, where its weight is hard to justify.
alternatives: [threejs, react-three-fiber]
has_example: false
---

## Verdict
**A full engine, not a website component.** Pick it for complex interactive 3D applications. For our site's
heroes, viewers and scroll scenes, it's far heavier than the alternatives for the same result.

## Benchmark
4/4 tasks (2 with built-in features). **846 KB gz** even with deep, tree-shaken imports, the heaviest tested by
a wide margin. Code: `bench3d/libs/babylon.js`.

Found in the benchmark:
- The default environment and skybox load assets from Babylon's CDN; without them (as here) metals look flat.
- The shadow-only ground lives in a separate package (`@babylonjs/materials`); `BackgroundMaterial` was the
  core-only workaround.
- `ArcRotateCamera.attachControl` makes the canvas **keyboard-focusable with arrow-key orbit**, which beats
  three.js and React Three Fiber out of the box.
- Thin instances drew 2,000 cubes in one draw call. Built-in auto-rotation behaviour.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Good PBR, but nice lighting depends on fetched environment assets |
| Interactivity | 5 | Cameras with keyboard, GUI, behaviours, picking, inspector |
| Coverage | 5 | Physics, GUI, XR, node materials, animation, editor tooling |
| Accessibility | 3 | Keyboard-operable camera by default; labels by hand |
| Performance | 4 | Thin instances, scene optimisers |
| React/Next fit | 2 | Imperative; community React bindings only |
| Bundle size | 1 | 846 KB gz |
| Licence & health | 5 | Apache-2.0, Microsoft-backed, released October 2026 |
