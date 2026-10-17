---
title: React Three Fiber + drei
kind: source
pattern: 3d
page_type: landing
tags: [3d, webgl, open-source, react, interactive]
source_url: https://r3f.docs.pmnd.rs
source_site: pmnd.rs
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: fiber 9.8.2 + drei 10.7.9
licence: MIT
s_look: 5
s_interact: 5
s_coverage: 5
s_a11y: 2
s_perf: 4
s_react: 5
s_bundle: 3
s_licence: 5
why_it_works: three.js as React components, so scenes compose, hold state and respond to props like the rest of the app, while drei supplies the hard parts (studio lighting, contact shadows, HTML hotspots, instancing, loading, performance scaling) as one-line components.
use_when: Any custom 3D in our React/Next app, such as a hero scene, configurator, scroll-driven story or interactive data in 3D.
avoid_when: You only need to show one product model (use model-viewer), or the page is weight-critical (it brings all of three.js).
alternatives: [threejs, model-viewer]
has_example: false
---

## Verdict
**Our default for custom 3D in the React/Next app.** It got the best visual result with the least code:
drei's `ContactShadows` and `<Html>` hotspot are one line each, versus manual work in three.js. The costs are
weight (it pulls in all of three.js) and accessibility you add yourself.

## Benchmark
4/4 tasks (3 with built-in features). **296 KB gz for the libraries** (353 KB with React 19's 57 KB, which our
app already ships). Slowest first frame on the software GPU (1263 ms: React mount plus the full three.js).
Code: `bench3d/libs/r3f.jsx`.

Found in the benchmark:
- **It imports all of three.js**: a single cube is 300 KB gz with React, versus 130 KB for tree-shaken vanilla
  three.js. drei itself only adds ~29 KB. Lazy-load the canvas so this never blocks first paint.
- drei `<Environment preset>` fetches HDR files from a CDN at runtime. Self-host the HDR or use a procedural
  `RoomEnvironment` (as here) so the scene doesn't depend on a third-party host.
- `frameloop="demand"` (render only on change) and `dpr={[1, 2]}` are one prop each, which matters most on phones.
- `<Instances>` lets you declare 2,000 items as JSX and still renders them in one draw call.
- Peer dependency pins React to `>=19 <19.4`, so check before upgrading React.
- No keyboard or screen-reader support by default (canvas not focusable).

## Seen in the wild
Seen in the wild: none of the six captured sites expose R3F directly (it renders through three.js, so it looks the same from outside). The three.js examples in `entries/3d/` are all reproducible with R3F + drei.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 5 | Best result for least code (Environment + ContactShadows) |
| Interactivity | 5 | Pointer events on meshes, `<Html>` hotspots, controls, drei helpers |
| Coverage | 5 | All of three.js plus drei, postprocessing and physics ecosystems |
| Accessibility | 2 | Only what you add; canvas not focusable |
| Performance | 4 | On-demand frames, instancing, PerformanceMonitor/AdaptiveDpr; React overhead on mount |
| React/Next fit | 5 | Native React 19 components, typed |
| Bundle size | 3 | 296 KB gz library cost (all of three.js) |
| Licence & health | 5 | MIT, pmndrs collective, released October 2026 |

## Using it in our stack
Load with `next/dynamic(..., { ssr: false })` behind a poster image; mount when scrolled into view;
`<Canvas frameloop="demand" dpr={[1, 2]}>`; self-hosted environment; `useGLTF.preload`; compressed glTF
(Draco or Meshopt, KTX2 textures) via `gltfjsx --transform`; respect `prefers-reduced-motion`; put the
scene's meaning in page text as well.
