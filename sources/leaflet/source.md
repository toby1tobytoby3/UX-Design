---
title: Leaflet + react-leaflet
kind: source
pattern: map
page_type: app
tags: [maps, open-source, raster, dom, react, stale]
source_url: https://leafletjs.com
source_site: leafletjs.com
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: 1.9.4
licence: BSD-2-Clause (react-leaflet Hippocratic-2.1)
s_look: 3
s_interact: 3
s_coverage: 2
s_a11y: 3
s_perf: 3
s_react: 3
s_bundle: 5
s_licence: 1
why_it_works: A small, simple raster map with keyboard pan and zoom and a visible attribution by default, and a canvas renderer that handles a few hundred vector markers.
use_when: Not recommended for new work. It is measured as a baseline because many existing apps use it.
avoid_when: New products. There has been no stable release since May 2023 (2.0 is still alpha), react-leaflet's licence isn't OSI open source, and dense live data needs WebGL.
alternatives: [maplibre, openlayers]
has_example: false
---

## Verdict
**Small and pleasant, but fails our gates.** At **48.2 KB gz** it is the lightest stack, keyboard pan and zoom work by
default, and the attribution is visible. But Leaflet 1.9.4 (18 May 2023) is the last stable release, and the 2.0 alphas
date from 2025. **react-leaflet 5 is licensed Hippocratic-2.1**, an ethical-use licence that isn't OSI open source. Use
MapLibre for new work.

## Benchmark (same basemap, 5,000 vehicles and tasks as every other stack, `benchmap/`)
Code: `benchmap/libs/leaflet.jsx` (react-leaflet `<MapContainer preferCanvas>`, `<GeoJSON>` basemap, supercluster,
one `<CircleMarker>` per item **in view**). Software GPU (SwiftShader): timings are relative only.

| Task | Result |
|---|---|
| First render | 310 ms |
| 30 s of 1 Hz updates (4× CPU throttle, z12) | p50/p95 frame 16.7/16.8 ms, 52 dropped frames, 347 ms long tasks, but only the ~440 vehicles in view are drawn (the others update all 5,000) |
| Click-pick at z13 and z16 | 2/2 correct (canvas hit-testing) |
| Cluster click | **Not built in**: supercluster (the usual `Leaflet.markercluster` plugin uses DOM markers) |
| `flyTo` with reduced motion | **Animated** for 1.7 s, the same as without |
| Keyboard | Tab reaches the map container; arrows pan, + zooms. The focus stop has **no role or accessible name** |
| Attribution | Shown by default (with a "Leaflet" credit) |
| axe | 0 violations |
| Bundle | 48.2 KB gz for leaflet + react-leaflet (React subtracted); CSS 2.7 KB |

## Weaknesses
- Fails the six-month maintenance gate; react-leaflet's licence needs legal review.
- No WebGL: raster tiles and DOM/canvas vectors only, so dense live data needs viewport culling like the bench used.
- Clustering, heatmaps and drawing are plugins, many of them unmaintained.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Clear zoom buttons and attribution; raster basemaps |
| Interactivity | 3 | Pan, zoom, pick, fly-to; clustering by plugin |
| Coverage | 2 | Markers and simple vectors; no vector tiles, aggregation or GPU layers |
| Accessibility | 3 | Keyboard pan/zoom by default, attribution visible; unnamed focus stop; animation ignores reduced motion |
| Performance | 3 | Fine for hundreds of markers in view; no GPU path for thousands |
| React/Next fit | 3 | react-leaflet 5 supports React 19; client-only |
| Bundle size | 5 | 48.2 KB gz |
| Licence & health | 1 | Gate: last stable release May 2023. react-leaflet is Hippocratic-2.1 (not OSI) |
