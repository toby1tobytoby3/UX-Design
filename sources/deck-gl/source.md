---
title: deck.gl
kind: source
pattern: map
page_type: app
tags: [maps, webgl, open-source, large-data, react, aggregation]
source_url: https://deck.gl
source_site: deck.gl
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: 9.4.0
licence: MIT
s_look: 3
s_interact: 4
s_coverage: 5
s_a11y: 3
s_perf: 5
s_react: 4
s_bundle: 3
s_licence: 4
why_it_works: GPU data layers (scatter, icon, path, trips, hexagon, heatmap, H3) that update thousands of moving points with almost no main-thread cost, with picking and attribute transitions, drawn over a MapLibre basemap.
use_when: Large or fast-changing data on a map, such as thousands of live vehicles, trails and replays, or hexbin and heatmap aggregation, layered over MapLibre with `MapboxOverlay`.
avoid_when: A few hundred markers with clusters (MapLibre's own layers are enough and save ~230 KB), or you need clustering only.
alternatives: [maplibre, openlayers]
has_example: false
---

## Verdict
**The add-on for heavy map data.** Updating 5,000 vehicles at 1 Hz caused **no long tasks** even with the CPU throttled
4× (MapLibre's own layers: ~32 ms per update). It adds **~228 KB gz** to MapLibre. One trap stands out: on
**MapLibre 6.15, `MapboxOverlay({ interleaved: true })` crashes** with deck.gl 9.4.0, so the bench ran the overlaid mode.

## Benchmark (same basemap, 5,000 vehicles and tasks as every other stack, `benchmap/`)
Code: `benchmap/libs/maplibre-deckgl.jsx` (react-maplibre `<Map>` + `MapboxOverlay` through `useControl`, two
`ScatterplotLayer`s, supercluster below z12). Software GPU (SwiftShader): timings are relative only.

| Task | Result |
|---|---|
| First render | 742 ms |
| 30 s of 1 Hz updates (4× CPU throttle, z12) | p50/p95 frame 16.7/16.8 ms, 12 dropped frames, **0 ms long tasks** (`updateTriggers`) |
| Click-pick at z13 and z16 | 2/2 correct (`pickable` + `onClick`) |
| Cluster click | **No clustering built in**; supercluster + `easeTo`, z10 → z11 |
| `flyTo` with reduced motion | Jumped (MapLibre owns the camera) |
| Keyboard, attribution, axe | Same as MapLibre: named focusable canvas, arrows and +, attribution shown, 1 axe issue |
| Bundle | 672.2 KB gz for MapLibre + deck.gl + supercluster, so deck.gl adds ~228 KB |

Found in the benchmark:
- **Interleaved mode crashes on MapLibre 6.** `@deck.gl/mapbox` 9.4.0 reads `map.transform`, which MapLibre 6 removed:
  "Cannot read properties of undefined (reading 'height')" on every frame. Overlaid mode (`interleaved: false`) works,
  but deck layers then sit above all basemap labels and use a second WebGL context. The same probe with
  **MapLibre 5.24.0 interleaves fine**, so until a fix ships, pin MapLibre 5 if you need `beforeId` layer slotting, or
  accept overlaid mode.
- Nothing in deck.gl 9.4 reads `prefers-reduced-motion`, so attribute transitions animate regardless. Turn `transitions` off yourself when it is set.

## Weaknesses
- No basemap, no clustering, no keyboard model of its own: it relies on MapLibre for all three.
- Interleaved with MapLibre 6 is broken in 9.4.0 (above).
- Canvas output; the accessible path is a synced list.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Layers need explicit colours and sizes; no basemap |
| Interactivity | 4 | Picking, hover, transitions, controller; clustering needs supercluster |
| Coverage | 5 | Scatter, icon, path, trips, hexagon, grid, heatmap, H3, 3D; ~1M points at 60 fps (docs) |
| Accessibility | 3 | Inherits MapLibre's keyboard and camera; transitions ignore reduced motion; canvas only |
| Performance | 5 | 0 ms long tasks for 5,000 live vehicles at 4× throttle, 12 dropped frames in 30 s |
| React/Next fit | 4 | `useControl` + `MapboxOverlay` in react-maplibre, or `<DeckGL>`; client-only |
| Bundle size | 3 | ~228 KB gz on top of MapLibre |
| Licence & health | 4 | MIT; 9.4.0 released 5 Sep 2026; interleaved mode incompatible with MapLibre 6 |
