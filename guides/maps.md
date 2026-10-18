# Maps and live positions

`ux-find` reads this for any map, fleet, tracking, geofence or location request. **Step 1** decides whether the map leads
or supports a list. **Step 2** picks the tile source and the library (benchmark in `benchmap/`, same 5,000 vehicles in
every stack). **Step 3** lists defaults. All are starting points: depart when the situation calls for it and say why.

Research behind this guide, with sources: `research/C3-maps.md`. Patterns: `pattern: map` in `catalog.json`. Live
numbers and feeds overlap C6 (`guides/charts.md`); the detail panel and split layout overlap `guides/shell-panels.md`.

## 1. Map or list first?
| If users… | Use | Why |
|---|---|---|
| Monitor or act on things in places (dispatch, fleet, incidents) | **Map and a synced list side by side.** The list is the complete, accessible path; the map never holds a fact the list lacks | Defra: maps *"should be used as visual enhancements"*; DfE: *"treat the map as an enhancement to the list"* |
| Look up one place or a handful of results | **A list with a small map**, or no map | Defra: *"Only use interactive maps when there is a clear user need"* |
| Explore spatial patterns (analysts) | **Map leads**, with filters and a table export | Where is it busy is a spatial question |

## 2. Tiles and library
**Tiles are the real decision; the renderer is the easy part.**

| Need | Tile source | Notes |
|---|---|---|
| Production | **Self-hosted Protomaps PMTiles** regional extract (`pmtiles extract --bbox`), `grayscale` / `white` / `black` data-viz flavours | One file on object storage or a CDN, no tile server. ODbL: OSM attribution required. Offline use allowed |
| Prototype | **OpenFreeMap** (Positron / Dark) | Free, commercial use allowed, no keys, **no SLA** |
| SLA or support contract required | MapTiler Flex or Stadia Starter (paid) | MapTiler Free and Stadia Free forbid commercial use |
| Never | `tile.openstreetmap.org` in a product; public Nominatim for autocomplete; Mapbox GL JS; Google Maps as a default | No SLA and can block without notice; 1 req/s and no client autocomplete; licence needs a Mapbox account; paid per call |

Measured in `benchmap/` (same offline basemap, 5,000 seeded vehicles updating at 1 Hz for 30 s, 4× CPU throttle,
SwiftShader WebGL: compare stacks with each other, not with real devices). Scores from `SOURCES.md`.

| Job | Use | Score | What the bench showed | Watch for |
|---|---|---|---|---|
| **Default** basemap, markers, clusters, live layers up to a few thousand items | **MapLibre GL JS 6** + `@vis.gl/react-maplibre` | 7.8 | All five checks pass with built-in features: picking, cluster click-to-expand, **the only camera that honours reduced motion** (flyTo jumped in 6 ms), focusable canvas named "Map" with arrow-key pan, attribution visible | 444 KB incl. 145 KB worker. 954 ms of long tasks over the live run. v6 has **no default export** (`import * as maplibregl`) and loads its worker as a module (`setWorkerUrl`). Cluster count text needs self-hosted glyphs |
| **Large or busy live layers**, trails, hex aggregation | **MapLibre + deck.gl** (`MapboxOverlay`) | 7.8 | Smoothest live updates: **0 ms long tasks** for 5k vehicles at 1 Hz; picking and keyboard via MapLibre | +228 KB. **Interleaved mode crashes with MapLibre 6.15 + deck.gl 9.4** (reads `map.transform`, removed in v6): use **overlaid** mode until deck.gl ships a fix, or pin MapLibre 5 if layers must sit under labels. Clustering needs supercluster. deck.gl ignores reduced motion: gate transitions yourself |
| GIS formats, projections, WMS/WMTS | **OpenLayers** | 7.0 | Smallest WebGL stack (84 KB), fastest first render | 2/5 checks: **the map can't be focused** (Tab stops on zoom buttons), **attribution collapsed** behind a button, animations ignore reduced motion. Moving features one by one froze the page (127 s per update with a cluster source): batch replace. 5.8 s of long tasks even batched |
| Analyst exploration | **kepler.gl** (not benchmarked) | 6.5 | A whole exploration app: layers, filters, time playback | npm `latest` is an alpha; depends on mapbox-gl 1.13 and maplibre-gl 4. Internal tools only |
| Avoid | Leaflet + react-leaflet | 5.8 | Small (48 KB), passes picking and keyboard | Last release May 2023; react-leaflet is Hippocratic-2.1 (not OSI). DOM/canvas markers drew only ~440 vehicles in view; flyTo animates 1.7 s under reduced motion; the focus stop has no name |

## 3. Defaults (guidance, not rules)
| Default | Why | When to depart |
|---|---|---|
| **Muted basemap** (Protomaps `grayscale`/`white`, dark: `black`); hide POIs and transit icons; labels at low contrast; pitch 0, rotation locked | Status colour must win; control rooms are 2D | Last-mile drivers: full-colour streets at z ≥ 15. Yards: a satellite toggle |
| Layer order: basemap fills → our zones and geofences → basemap roads and labels → our routes → markers → selection halo. Zones and routes as MapLibre layers with `beforeId`; deck.gl layers sit on top in **overlaid** mode (interleaved crashes on MapLibre 6, see §2) | Labels stay readable over fills | Heatmaps above labels at ≤ 60 % opacity |
| **Attribution always visible** bottom-right, compact | OSM: never hide it behind toggles or off-screen | Never |
| Density: **< ~500 in view** individual markers; **500–50k** cluster (`clusterRadius: 50`, `clusterMaxZoom: 14`); **> 50k or "where is it busy?"** aggregate (hex, grid, heatmap); **static > ~100k features / ~10 MB** vector tiles | MapLibre cluster defaults; DOM and GeoJSON limits | Live fleets under ~2k: don't cluster at operational zooms (z ≥ 9) |
| Clusters show **count + worst status**, coloured by it (`clusterProperties` with `max`); click zooms to the expansion zoom; **alerting items never hide inside a cluster** (draw them unclustered on top) | Hiding an alert in a grey blob is an ops failure | Analytics maps: plain counts |
| Markers are **GPU layers** (MapLibre `symbol`/`circle` or deck.gl `IconLayer`) above ~50 items; a DOM marker only for the selected item | react-map-gl: layers are much faster than markers | ≤ 25 pins: DOM markers are fine and natively focusable |
| Live updates: ingest at feed rate, **render position changes ≤ 1×/s per vehicle**, batched into one `updateData` diff (or one deck.gl attribute update) per tick; drop fixes older than the one shown | deck.gl: frequent `data` changes stutter even for a few thousand items | Replay: TripsLayer with `currentTime` and timestamps as offsets |
| Interpolate between fixes over the **expected interval**; **never extrapolate beyond one interval**; dead-reckoned positions are visibly marked | Smooth but honest | Reduced motion: jump to the new fix |
| **Freshness per vehicle**, relative to the ping interval *T*: **Live** < 2T solid (heading arrow when moving); **Delayed** 2T–10T 50 % opacity + "4 min ago"; **Stale** > 10T grey hollow marker with a clock badge, left out of "available" counts; **Offline** last-known pin, dashed outline. Show device time and its age | Each vehicle has its own age; a feed-level badge hides stale vehicles | Assets that rarely move (trailers): thresholds in hours |
| **Feed state** pill in the map header: "● Live · updated 14:02:31"; disconnected: amber "Reconnecting… positions as of 14:02:31" and markers fade a step; **Pause live** with "Paused · 12 updates waiting" | WCAG 2.2.2 (pause auto-updating content) | Unattended wallboards: no pause, keep the timestamp |
| Status change: a **one-shot halo**, not flash-on-change | Moving markers already signal change; flashing hundreds of icons is noise and risks WCAG 2.3.1 | – |
| **The camera never moves because data changed.** Selecting from the list eases only if the item is off-screen, ≤ 1.2 s, with `padding` for the detail panel; `fitBounds` + padding for routes; **follow mode** is an explicit toggle a user pan breaks, with a "Re-centre" button | Users lose their place when the map moves on its own | Incident response: auto-fit to a new P1 only if the user opted in |
| Reduced motion: leave `essential` false so `flyTo`/`easeTo` jump; set `reduceMotion: true` (kills pan inertia); static alert rings, no pulsing. deck.gl transitions, OpenLayers and Leaflet ignore the setting: check `matchMedia` yourself | Measured: only MapLibre's camera honours it | – |
| Selection: hover tooltip (id, status, age); click selects with a halo via `feature-state` (`promoteId`) and opens a 360–420 px detail panel on the right; selection survives updates; **Esc** clears; `?v=<id>` and the view in the URL | Links share what you're looking at | Dispatch lasso: remap Shift+drag from box zoom |
| Map–list sync: "Only in map view" toggle (on in ops); list sorted by **severity × time to impact**; row hover highlights the marker; row select selects on the map (pans only if off-screen); map click scrolls the row into view; virtualise ≥ 1k rows (`guides/tables.md`) | ArcGIS Dashboards and DfE: map and list filter each other | Small result sets: no viewport filter |
| Legend: ≤ 5 status colours (ok / warning / critical / stale grey / offline) **plus a shape or glyph**; markers keep **≥ 3:1** against the basemap with a 1.5–2 px halo; a legend chip with counts that filters on click | WCAG 1.4.1, 1.4.11 | Categorical layers: ≤ 8 hues from the chart palette |
| Keyboard: container `tabIndex=0`, `role="region"`, `aria-label="Fleet map, 412 vehicles"`; keep MapLibre's keys (arrows pan, +/− zoom); visible zoom ± and **Reset view** (WCAG 2.5.7); markers are **not** tab stops (the list is the keyboard path); announce selection in a polite live region | WCAG 2.1.1, 2.5.7; Defra and DfE | Maps inside scrolling pages: `cooperativeGestures: true` |
| Geocoding: hosted geocoder (MapTiler, Stadia) or self-hosted Photon/Pelias; 250–300 ms debounce, ≥ 3 characters, biased to the viewport | Nominatim's policy forbids client autocomplete | Batch back-office geocoding: self-hosted Nominatim |
| Geofences: draw and edit with `terra-draw`; point-in-polygon with single `@turf/*` modules | Small, maintained, MapLibre adapter | – |
| Next.js: a `'use client'` component loaded with `next/dynamic(..., { ssr: false })` behind a map-sized skeleton; `setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).toString())` (MapLibre 6 is ESM-only); **one map instance per route** (`reuseMaps`) | Avoids SSR crashes and re-creating WebGL contexts | Static thumbnails: server-rendered images |
| Resilience: handle `webglcontextlost` with "Map paused, restoring…" while the list keeps working; cap DPR at 2; pause animation when the tab is hidden; overlaid deck.gl adds a second WebGL context, so keep one map per route | Browsers cap WebGL contexts (~16 per page) | – |

## References
Bench: `benchmap/`. Profiles: `sources/{maplibre,deck-gl,openlayers,leaflet,kepler-gl}`. Live references: `pattern: map`
entries in `catalog.json`. Logged-in screens to capture (Samsara, Onfleet, project44, Felt, ArcGIS Dashboards,
Flightradar24): `research/C3-maps.md` §5.
