---
title: OpenLayers
kind: source
pattern: map
page_type: app
tags: [maps, gis, open-source, projections, drawing, canvas]
source_url: https://openlayers.org
source_site: openlayers.org
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: 10.11.0
licence: BSD-2-Clause
s_look: 3
s_interact: 4
s_coverage: 5
s_a11y: 2
s_perf: 3
s_react: 2
s_bundle: 4
s_licence: 5
why_it_works: The full GIS toolkit (any projection, WMS/WMTS, GeoJSON/KML/GPX/GML, built-in draw, modify and snap interactions, a cluster source), tree-shakable to a small bundle and fast to first render.
use_when: GIS-heavy products such as surveying, planning and utilities, with non-Web-Mercator projections, OGC services or geometry editing, where a team is happy to wrap it in React itself.
avoid_when: A product map that should be keyboard-reachable and calm by default with no extra work (MapLibre), or thousands of live points on the default canvas layers.
alternatives: [maplibre, deck-gl, leaflet]
has_example: false
---

## Verdict
**The GIS specialist, but not accessible by default.** It is the smallest capable stack (**83.6 KB gz**) and had the fastest
first render. Out of the box, though, **the map can't be reached by keyboard** (Tab stops on the zoom buttons only),
**attribution is collapsed** behind an "i" button, and **`view.animate` ignores reduced motion**. Moving 5,000 features
on the default canvas layer cost ~195 ms of main thread per update at 4× throttle, the most in the bench.

## Benchmark (same basemap, 5,000 vehicles and tasks as every other stack, `benchmap/`)
Code: `benchmap/libs/openlayers.js` (no React wrapper; canvas `VectorLayer`s, built-in `Cluster` source below z12).
Software GPU (SwiftShader): timings are relative only.

| Task | Result |
|---|---|
| First render | 180 ms, the fastest |
| 30 s of 1 Hz updates (4× CPU throttle, z12) | p50/p95 frame 16.7/16.8 ms, 307 dropped frames, **5.8 s of long tasks** |
| Click-pick at z13 and z16 | 2/2 correct (`forEachFeatureAtPixel`, `singleclick`) |
| Cluster click | `Cluster` source built in; expanding is your code (`view.fit` to the members), z10 → z12.9 |
| `flyTo` with reduced motion | **Animated** for 1.0 s, the same as without |
| Keyboard | **Map surface not focusable.** Tab reaches "Zoom in" and "Zoom out" only; arrows and + do nothing |
| Attribution | **Collapsed** behind a button by default |
| axe | 0 violations |
| Bundle | 83.6 KB gz; CSS 1.4 KB |

Found in the benchmark:
- **Moving features one by one froze the page.** `setCoordinates()` on 5,000 features while a `Cluster` source was
  attached re-clustered on every change event: **127 s per update**. Replacing them in one batch
  (`clear(true)` + `addFeatures`) brought it down to the figure above. For real fleets, try the WebGL point layer (not measured).
- Keyboard needs `tabindex="0"` and an `aria-label` on the map target (the docs say so). Pass `collapsed: false` to the
  Attribution control, and check `matchMedia('(prefers-reduced-motion: reduce)')` before `animate`.

## Weaknesses
- No official React wrapper: an imperative map in a `ref`, with your own sync code.
- Three accessibility defaults to fix by hand (above).
- Default controls are small (about 22 px), so restyle them to meet the 24 px target size.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Plain small controls, collapsed attribution; you bring the basemap |
| Interactivity | 4 | Pan, zoom, rotate, pick, cluster source, animate; cluster expand is your code |
| Coverage | 5 | Projections, OGC services, GIS formats, draw/modify/snap, heatmap, WebGL points |
| Accessibility | 2 | Map not keyboard-reachable by default, attribution collapsed, animation ignores reduced motion; 0 axe |
| Performance | 3 | Fastest first render; 5.8 s long tasks over 30 updates at 4× throttle on canvas layers |
| React/Next fit | 2 | No official wrapper; ESM and tree-shakable |
| Bundle size | 4 | 83.6 KB gz as used |
| Licence & health | 5 | BSD-2-Clause; 10.11.0 released 4 Oct 2026, dev builds daily |
