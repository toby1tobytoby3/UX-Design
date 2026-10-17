---
title: three.js
kind: source
pattern: 3d
page_type: landing
tags: [3d, webgl, open-source, interactive]
source_url: https://threejs.org
source_site: threejs.org
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 0.186.1
licence: MIT
s_look: 4
s_interact: 4
s_coverage: 5
s_a11y: 1
s_perf: 4
s_react: 2
s_bundle: 4
s_licence: 5
why_it_works: The standard 3D engine of the web, with a scene graph, physically based materials, loaders for every format, controls, post-processing and a WebGPU renderer, plus by far the largest ecosystem of examples, tools and people who know it.
use_when: Custom 3D outside React, or when you need full control of the render loop; and as the engine underneath React Three Fiber and model-viewer.
avoid_when: In our React app, where React Three Fiber is the better interface to the same engine; or for a simple product spin, where model-viewer is one tag.
alternatives: [react-three-fiber, model-viewer, babylonjs, ogl]
has_example: false
---

## Verdict
**The engine to bet on, and the one under our recommended React option.** In the React app, use it
*through* React Three Fiber. Use it directly for non-React pages, tight render-loop control, or porting
examples from its huge example library.

## Benchmark (same model and four tasks as every 3D library)
4/4 tasks (2 with built-in features, 2 hand-wired). **159.9 KB gz** for all four tasks (tree-shaken; a
bare scene is 130 KB). First frame 842 ms on a software GPU (relative only). Code: `bench3d/libs/three.js`.

Found in the benchmark:
- A good look takes explicit setup: tone mapping, a PMREM-processed `RoomEnvironment`, shadow maps and a
  shadow-catcher ground (~40 lines before the model appears).
- `InstancedMesh` drew 2,000 cubes in one draw call.
- Hotspots are manual (project the node to screen space each frame); `CSS2DRenderer` is the add-on alternative.
- Renders every frame unless you opt into on-demand rendering (we redraw only on camera change).
- **No accessibility**: canvas only, not focusable, no keyboard orbit. Labels and keyboard support are yours.

## Seen in the wild
Seen in the wild (captured): Stripe's homepage ribbon (r178), GitHub's hero characters (r148), Bruno Simon's drivable portfolio (r183), Igloo's scroll story (r165). See `entries/3d/`.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Excellent once set up (PBR, ACES tone mapping, environment); setup is manual |
| Interactivity | 4 | OrbitControls and many add-ons; hotspots hand-wired |
| Coverage | 5 | Loaders (glTF, Draco, KTX2), post-processing, WebGPU renderer, instancing, animation |
| Accessibility | 1 | Nothing built in |
| Performance | 4 | InstancedMesh, on-demand rendering possible, WebGPU path |
| React/Next fit | 2 | Imperative; use React Three Fiber in React |
| Bundle size | 4 | 160 KB gz for the four tasks |
| Licence & health | 5 | MIT, monthly releases (r186) |
