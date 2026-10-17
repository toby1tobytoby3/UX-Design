---
title: model-viewer
kind: source
pattern: 3d
page_type: product
tags: [3d, webgl, open-source, accessible, ecommerce, ar]
source_url: https://modelviewer.dev
source_site: modelviewer.dev
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 4.4.0
licence: Apache-2.0
s_look: 5
s_interact: 4
s_coverage: 2
s_a11y: 4
s_perf: 4
s_react: 3
s_bundle: 3
s_licence: 5
why_it_works: One HTML element turns a glTF file into a polished, accessible product viewer, with studio lighting, soft shadow, orbit, keyboard control, poster, hotspots and phone AR, all as attributes and no 3D code.
use_when: Showing a single product or object in 3D (product pages, launches, docs), especially when AR on phones is useful.
avoid_when: You need a custom scene, multiple objects, instancing, shaders or scroll-driven choreography.
alternatives: [react-three-fiber, threejs]
has_example: false
---

## Verdict
**The fastest, most accessible way to put a product in 3D.** It's the right first answer to "can we show
this product in 3D?". Move to React Three Fiber only when you need a custom scene.

## Benchmark
3/4 tasks, all three with built-in features. No instancing or scene graph: it shows one model. **291 KB gz**
(includes its own three.js). Code: `bench3d/libs/modelviewer.js`, just HTML attributes.

Found in the benchmark:
- The best out-of-the-box look tested: `environment-image="neutral"` and `shadow-intensity` give studio
  lighting and a soft shadow without any assets.
- **Keyboard-focusable** viewer with an `alt` description; hotspots are real focusable `<button>`s placed with `data-position`.
- `poster` and `reveal` attributes handle loading. Auto-rotate is opt-in, so reduced motion is easy to respect.
- It auto-frames the model: our camera distance was clamped closer than in the other libraries until we set `max-camera-orbit`.
- Pins its own three.js (peer `^0.183`), so in an app that also uses three.js you may ship two copies.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 5 | Best result with zero setup |
| Interactivity | 4 | Orbit, hotspots, animations, AR; no custom scenes |
| Coverage | 2 | Single model only |
| Accessibility | 4 | Focusable, alt text, keyboard orbit, button hotspots (screen-reader output not tested) |
| Performance | 4 | Renders on demand; one model |
| React/Next fit | 3 | Web component: works in React 19 but needs JSX type declarations and client-side loading |
| Bundle size | 3 | 291 KB gz |
| Licence & health | 5 | Apache-2.0, Google, released October 2026 |
