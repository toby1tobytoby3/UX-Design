---
title: MapLibre GL JS
kind: source
pattern: map
page_type: app
tags: [maps, webgl, open-source, vector-tiles, clustering, react]
source_url: https://maplibre.org/maplibre-gl-js/docs/
source_site: maplibre.org
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: 6.15.0
licence: BSD-3-Clause
s_look: 3
s_interact: 5
s_coverage: 4
s_a11y: 4
s_perf: 4
s_react: 4
s_bundle: 2
s_licence: 5
why_it_works: The open WebGL vector map (the BSD fork of Mapbox GL) with GPU circle and symbol layers, built-in GeoJSON clustering with expansion zoom, a focusable named map surface with keyboard pan and zoom, and a fly-to that jumps under reduced motion without any setup.
use_when: Default for any product map, such as fleet and asset tracking, store finders, delivery zones and ops dashboards, through `@vis.gl/react-maplibre`, with a self-hosted Protomaps or OpenFreeMap style.
avoid_when: Heavy GIS work (projections, WMS/WMTS, editing formats; use OpenLayers), or more than ~100k moving points or aggregations (add deck.gl).
alternatives: [deck-gl, openlayers, leaflet]
has_example: false
---

## Verdict
**The default map renderer.** It passed every task in the benchmark (pick 2/2, cluster expand, keyboard pan and zoom,
reduced-motion jump, attribution visible) with built-in features and was the only stack whose camera respected
reduced motion with default options. It costs **444 KB gz**, including a 145 KB worker. Under 4× CPU throttle, 1 Hz
updates to 5,000 clustered vehicles cost ~32 ms of main thread per update, against ~0 ms for deck.gl.

## Benchmark (same basemap, 5,000 vehicles and tasks as every other stack, `benchmap/`)
Code: `benchmap/libs/maplibre.jsx` (react-maplibre `<Map>`, `<Source cluster>`, two circle layers). Software GPU
(SwiftShader): timings are relative only.

| Task | Result |
|---|---|
| First render | 530 ms to the first `idle` with vehicles drawn |
| 30 s of 1 Hz updates (4× CPU throttle, z12) | p50/p95 frame 16.7/16.8 ms, 57 dropped frames, 954 ms of long tasks (React state → `setData`, clustering on) |
| Click-pick at z13 and z16 | 2/2 correct (`interactiveLayerIds`) |
| Cluster click | Built in: `getClusterExpansionZoom` + `easeTo`, z10 → z11 |
| `flyTo` with reduced motion | **Jumped** in one frame (6 ms). Without reduced motion: 1.7 s animation |
| Keyboard | First Tab lands on the canvas (`role="region"`, `aria-label="Map"`); arrows pan, + zooms |
| Attribution | Shown by default at 1280 px (compact "i" button below 640 px) |
| axe | 1: `link-in-text-block` on the "MapLibre" link in the attribution |
| Bundle | 444.1 KB gz: 299.4 main thread + 144.7 worker (React and the harness subtracted); CSS 9.9 KB |

Found in the benchmark:
- **v6 has no default export.** `import maplibregl from 'maplibre-gl'` fails to build; use named imports or `import * as`.
- **v6 is ES modules only and loads its worker as a module from next to the bundle.** It works with ESM bundlers.
  Next.js needs `'use client'`, and older setups or IIFE bundles need `setWorkerUrl()`.
- **Cluster count labels need a glyphs URL.** Text needs self-hosted font PBFs; the bench drew size-stepped circles only.
- **deck.gl's interleaved mode crashes on v6** (see `deck-gl`). Check that before upgrading a deck.gl app.
- For live data, `GeoJSONSource.updateData` (diffs) is cheaper than re-sending the whole collection, which is what the
  bench did, through React state, as most apps do.

## Weaknesses
- No basemap of its own: pick a tile source (self-hosted PMTiles, OpenFreeMap, or a paid one with an SLA).
- The map content is a canvas. Pair it with a synced list that carries every fact the map shows.
- Biggest bundle of the plain renderers; lazy-load the map route.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Clean controls and attribution; no basemap until you choose a style |
| Interactivity | 5 | Pan, zoom, rotate, pick, built-in clusters with expansion zoom, fly-to, `updateData` |
| Coverage | 4 | Circles, symbols, lines, fills, heatmap, extrusions, terrain, globe; drawing needs terra-draw |
| Accessibility | 4 | Named focusable surface, keyboard pan/zoom, reduced-motion jump by default, attribution visible; 1 axe issue |
| Performance | 4 | Smooth frames; ~32 ms main thread per 5,000-vehicle update at 4× throttle (deck.gl ~0) |
| React/Next fit | 4 | `@vis.gl/react-maplibre` 8.1.3 works on v6; v6 is ESM-only, client-only in Next |
| Bundle size | 2 | 444.1 KB gz including the 144.7 KB worker |
| Licence & health | 5 | BSD-3-Clause; 6.15.0 released 18 Oct 2026 |
