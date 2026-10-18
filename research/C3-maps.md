# C3. Maps and geospatial (with C6 live positions): research notes

Research for row C3 of `research/categories.md`, plus the map side of C6 (live positions, stale data). Target: desktop web
apps such as a **fleet logistics control room** (scenario 4 in `guides/scenarios.md`). Stack: React/Next + Tailwind.
Researched 2026-10-18.

Evidence key (same as E6): **[V]** checked today (npm, curl status, page text, or a headless Playwright probe with
SwiftShader WebGL). **[D]** vendor docs, fetched today. **[M]** from memory, not re-verified today.

---

## 0. Headline findings
1. **The renderer is the easy part; tiles are the decision** [V]. MapLibre (BSD-3) and deck.gl (MIT) are healthy, but the
   tile and geocoding source decides cost, SLA and legality. Of the hosted options, **only OpenFreeMap is free for commercial
   production**: *"no limits on the number of map views… no API keys"*, *"Is commercial usage allowed? Yes"*. It has no SLA.
   MapTiler Free is for *"testing, PoC, prototyping, personal, or non-commercial use"*. Stadia Free says *"Commercial use not
   allowed"*. **tile.openstreetmap.org** has *"no SLA"*, can *"block access, without notice"*, and *"Offline use is not
   permitted"*, so don't use it for a product.
2. **Self-hosted PMTiles is the best production default.** Protomaps basemap: one file, *"Open Database License… (OpenStreetMap
   attribution required)"*, planet ≈ **120 GB**, and you cut out your region with `pmtiles extract --bbox`. It's served from a
   bucket or CDN, with no tile server [D]. It ships **data-viz flavours** (`white`, `grayscale`, `black`), which is exactly the
   muted basemap a control room needs [D].
3. **Reduced motion is built in, but only half-done by default** [D]. In MapLibre, `flyTo`/`easeTo` follow
   `prefers-reduced-motion` unless `essential: true`. The new `reduceMotion` map option only disables *gesture inertia*.
4. **MapLibre v6 is ESM-only and needs a worker URL** [D]. In Next.js 15+, use `'use client'` +
   `setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).toString())`. Next 14 needs the worker
   copied to `public/`. **maplibre-gl 6.15.0 was published today** (13:01 UTC) [V].
5. **The Leaflet stack fails our gates** [V]. leaflet 1.9.4 dates from **2023-05-18**, and 2.0.0-alpha.1 from 2025-08-16.
   react-leaflet 5.0.0 (2024-12-14) is licensed **Hippocratic-2.1**, which isn't an OSI open-source licence.
6. **kepler.gl's npm `latest` is an alpha** (3.3.0-alpha.16, 2026-10-09). Its own demo runs **3.3.0-alpha.17**. The last
   non-alpha is 3.2.6 (2026-03-16). It still depends on `mapbox-gl` **1.13.1** and `maplibre-gl ^4`, not v6 [V].
7. **Government guidance agrees: list first, map as enhancement** [V]. Defra: *"All essential geographic information must be
   available in a non-visual format, such as text or a list."* DfE design history (Mar 2026): there is *"no official GOV.UK
   Design System component for maps"*, and the PSBAR map exemption *"is often misread as permission to skip accessibility work"*.
8. **Live public fleet maps can be captured headlessly** [V]. geOps tracker (MapLibre + OpenLayers, live trains, buses and
   trams), TRAVIC (OpenLayers) and the MBTA Red Line (Leaflet, 30 live vehicle markers) all loaded with no login.
   Continuously animating WebGL pages (deck.gl trips, ADS-B Exchange) **timed out Playwright's 30 s screenshot**: raise it to 90 s.

---

## 1. Topics the guide must answer
1. **Map or list first?** When a map earns its place, and what the non-map path is.
2. **Basemap vs data layers:** a muted basemap so status colours win, and how layers are ordered (labels over fills, under markers).
3. **Tiles, styles, geocoding:** provider, licence, cost, attribution, offline and SLA.
4. **Density:** when points are individual, clustered, aggregated (hex/H3/grid) or served as vector tiles.
5. **Large-data layers:** deck.gl over MapLibre, picking, update cost.
6. **Live positions:** update cadence, interpolation, out-of-order fixes, per-vehicle freshness (live / delayed / stale /
   offline), feed-level connection state, and pausing.
7. **Camera:** fly-to, fit-to-selection, follow mode and how to break or rejoin it, reduced motion.
8. **Selection and detail:** hover vs click, the detail panel, persistence across updates, deep links.
9. **Map + list/table sync:** "only what's in view", hover linking, and the exceptions queue.
10. **Legend and status colour:** palette, shape redundancy, counts, contrast against the basemap.
11. **Accessibility:** keyboard pan/zoom, single-pointer alternatives, focus, list alternative, live-region announcements.
12. **Performance and resilience in Next.js:** client-only rendering, one map instance, WebGL context loss, GPU memory,
    layer counts, headless testing.

---

## 2. Recommended defaults
| Topic | Default | Why (source) | Depart when |
|---|---|---|---|
| Map or list | Ops screens: map **and** a synced list/queue side by side. The list is the complete, accessible path. The map never holds information the list lacks | Defra: maps *"should be used as visual enhancements"*; *"Only use interactive maps when there is a clear user need"* [V]. DfE: *"treat the map as an enhancement to the list, not a replacement"* [V] | Pure spatial exploration (kepler-style analysis): the map leads, but a table export remains |
| Basemap style | **Light:** Protomaps `grayscale` or `white` flavour, or OpenFreeMap **Positron**. **Dark:** Protomaps `black` or OpenFreeMap **Dark**. Hide POIs and transit icons; keep place and major-road labels at low contrast. No satellite by default | Protomaps marks `white` / `grayscale` / `black` as *"A flavor for data visualization"* [D]. Saturated basemaps compete with status colour [M; Mapbox and Esri teach the same with their Monochrome and Dark Gray Canvas styles, M] | Last-mile dispatch (drivers need street detail): use a full-colour street style at z ≥ 15 only. Yard or site views: satellite toggle |
| Layer order | Basemap fills → **our area fills** (geofences, zones) → basemap roads and labels → our routes → our markers → the selection halo. With deck.gl use `MapboxOverlay({ interleaved: true })` and `beforeId` to slot layers under labels | deck.gl overlay supports *"overlaid and interleaved"* modes, with `beforeId` in interleaved mode [D] | Heatmaps: draw above labels at ≤ 60 % opacity |
| Tile source | **Prod:** self-host a regional **PMTiles** extract (`pmtiles extract --bbox … --maxzoom 15`) on our object storage or CDN, with the `@protomaps/basemaps` style. **Prototype:** OpenFreeMap public styles. **Paid fallback with SLA:** MapTiler Flex ($30/mo, 25k sessions) or Stadia Starter ($20/mo, 1M credits, commercial allowed) | Protomaps: *"Each additional zoom level roughly doubles the size"*; CDN guides "less than one hour" [D]. OpenFreeMap: free, commercial OK, no SLA [V]. MapTiler and Stadia prices from their pricing pages [V] | An SLA or support contract is required and we won't run storage: MapTiler/Stadia. Offline vans or depots: bundle a PMTiles extract (allowed by ODbL, prohibited on OSM tiles) |
| Attribution | Always visible bottom-right: "© OpenStreetMap contributors" (+ "© OpenMapTiles" for OpenFreeMap, or the provider's line). MapLibre `attributionControl` stays on, compact | OSM: *"Do not hide attribution beneath UI, behind toggles, or off-screen"* [V] | Never |
| Geocoding | Hosted geocoder with autocomplete (MapTiler, Stadia) or self-hosted Photon/Pelias [M]. Debounce 250–300 ms, minimum 3 characters, bias to the viewport. **Never** use public Nominatim for autocomplete | Nominatim: *"absolute maximum of 1 request per second"*; autocomplete *"you must not implement such a service on the client side using the API"* [V] | Back-office batch geocoding: queue against a self-hosted Nominatim |
| Density thresholds | **< ~500 points in view:** individual markers. **500–50k:** cluster (`cluster: true`, `clusterRadius: 50`, `clusterMaxZoom: 14`, so clusters show until z15). **> 50k, or "where is it busy?" questions:** aggregate (deck.gl Hexagon/Grid/H3 or Heatmap). **Static sets > ~100k features or > ~10 MB GeoJSON:** vector tiles (PMTiles via tippecanoe) [M thresholds] | MapLibre defaults: `clusterRadius` 50, `clusterMinPoints` 2, `clusterMaxZoom` = maxzoom − 1 [D]. supercluster defaults: radius 40, maxZoom 16 [V README] | A live fleet under ~2k vehicles: don't cluster at operational zooms (z ≥ 9). Dispatchers need every vehicle |
| Clusters in ops | Clusters show **count + worst status** (`clusterProperties: { maxSeverity: ['max', ['get','severity']] }`), coloured by the worst status. Click zooms to `getClusterExpansionZoom`. Alerts **never hide inside a grey cluster**: draw alerting vehicles as an unclustered layer on top | `clusterProperties` aggregates with expressions such as `"max"` [D]. Hiding an alert inside a cluster is an ops failure [M] | Analytics maps: plain counts are fine |
| deck.gl budgets | `pickable: true` only on interactive layers; `updateTriggers` instead of new `data`; binary or typed-array attributes for > 100k rows; keep total layers ≲ 100 | deck.gl: ScatterplotLayer *"60 FPS… up to about 1M"* items (2015 MBP), 10–20 FPS near 10M; Chrome's 1 GB allocation cap crashes layers *"between 10M and 100M items"*; picking handles *"16M items per layer"* and *"256 layers with the pickable flag"*; *"close to 100 deck.gl layers"* without issues [D] | Under ~2k live points with DOM-rich markers: MapLibre symbol layers are enough, no deck.gl |
| Markers | GPU layers (MapLibre `symbol`/`circle`, or deck.gl `IconLayer`) for anything over ~50 items. DOM `<Marker>` only for the **selected** item or a handful of pins | react-map-gl: *"consider switching to a symbol layer. Layers are rendered in WebGL and are much more performant than markers"* [D] | Very small maps (≤ 25 pins, DfE style) can use DOM markers, which are also natively focusable |
| Live update cadence | Ingest at the feed's rate, but **render position changes at most 1×/s** per vehicle. Batch all changes into one `GeoJSONSource.updateData` diff (or one deck.gl attribute update) per frame or tick. Drop any fix whose source timestamp is older than the one shown | `updateData` applies partial diffs [D]. deck.gl: frequent `data` changes make *"stutter… visible even for layers with just a few thousand items"* [D] | Replay or analysis: TripsLayer with `currentTime` and `trailLength` (timestamps as offsets, since float32 *"will cause precision loss"*) [D] |
| Interpolation | Animate between consecutive fixes over the **expected interval** (deck.gl `transitions: { getPosition: interval }`, or a rAF lerp). **Never extrapolate beyond one interval.** Dead-reckoned positions must be visibly marked | deck.gl attribute transitions [D]. TRAVIC and geOps animate vehicles between known points [V probe; method M] | Reduced motion: jump to the new fix, no tweening |
| Freshness states (per vehicle) | Thresholds are relative to the expected ping interval *T* (e.g. 30 s). **Live** age < 2T: solid marker, heading arrow when speed > ~3 km/h. **Delayed** 2T–10T: 50 % opacity + "4 min ago" in tooltip and list. **Stale** > 10T (or > 15 min): grey hollow marker with a clock badge, left out of "available" counts. **Offline** (ignition off or device lost): last-known pin with dashed outline. Always show the **source timestamp** (device time) and its age; show receipt time in detail | C6 row: *"How are stale positions, time offsets and uncertainty distinguished from live locations?"* Thresholds [M]; tune per telematics provider | Assets that move rarely (trailers, containers): thresholds in hours, and stale is normal |
| Feed state (whole map) | A status pill in the map header: **● Live · updated 14:02:31**. When disconnected: amber "Reconnecting… positions as of 14:02:31", all markers fade one step and counts are marked stale. **Pause live** button: freezes positions with a "Paused · n updates waiting" pill | WCAG 2.2.2: auto-updating content needs a way to pause, stop, hide or control frequency, unless essential [V URL] | Wallboards with no operator: no pause, but keep the timestamp |
| Uncertainty | When `accuracy` > 50 m, at z ≥ 14, draw a translucent accuracy circle. Hide it at low zoom | Uncertainty must be visible, not implied [M] | – |
| Camera | **The camera never moves because data changed.** Select from the list: `easeTo` or `flyTo` only if the item is off-screen, ≤ 1.2 s, with `padding` set to the detail panel width. Fit to a route or selection: `fitBounds` + padding. **Follow mode** is an explicit toggle: a user pan breaks it and shows a "Re-centre" button. Default pitch 0, rotation locked | MapLibre animations respect reduced motion unless `essential: true` [D]. Follow / re-centre is the satnav convention [M] | Incident response: auto-fit to a new P1 alert only if the user opted in |
| Reduced motion | Leave `essential` false (MapLibre then jumps). Set `reduceMotion: true` when the OS asks (it kills pan inertia). No pulsing alert rings: use a static ring | `reduceMotion`: *"If true, gesture inertia… is disabled"*, default follows device settings [D] | – |
| Selection | **Hover:** tooltip (id, status, age). **Click:** select with a halo via `feature-state` keyed on `promoteId: 'vehicleId'`, and a detail panel on the right (360–420 px) with status, ETA, last fix, and actions. Selection survives data updates. **Esc** clears it. The URL holds `?v=<id>` and the view | MapLibre `promoteId` for stable feature ids [D] | Multi-select (lasso) for dispatch: Shift+drag box zoom is MapLibre's default, so remap it [M] |
| Map–list sync | List options: "Only in map view" toggle (default on in ops) and sort by **severity × time to impact**. Hovering a row highlights its marker; selecting a row selects on the map (and pans only if off-screen); clicking a map item scrolls its row into view. The list virtualises (≥ 1k rows) | DfE plans *"Linking map pins to list items"* [V]. Scenario 4: exceptions queue ranked by severity × time to impact [repo] | Small result sets: no viewport filter |
| Legend and colour | ≤ 5 status colours (ok / warning / critical / stale-grey / offline) **plus shape or glyph redundancy**. Marker fill keeps ≥ **3:1** against the basemap via a 1.5–2 px white (light) or near-black (dark) halo. A legend chip is always visible, with counts per status, and clicking it filters | WCAG 1.4.1 Use of Color, 1.4.11 Non-text Contrast [V URLs]. DfE: pins match tag colours and *"We included a legend… not to rely on colour alone"* [V] | Categorical layers (carrier, depot): ≤ 8 hues from our chart palette (`guides/charts.md`) |
| Keyboard and a11y | Map container: `tabIndex=0`, `role="region"`, `aria-label="Fleet map, 412 vehicles"`. Keep MapLibre's keyboard handler (arrows pan 100 px, +/− zoom, Shift+arrows rotate/pitch). Visible zoom ± and a "Reset view" button (2.5.7 single-pointer alternative to dragging). Markers are **not** individual tab stops: the list is the keyboard path to features. Announce selection changes in a polite live region. `cooperativeGestures` off in full-screen app maps | MapLibre KeyboardHandler key table [D]. WCAG 2.1.1, 2.5.7 Dragging Movements [V URLs]. DfE cites 1.1.1, 1.4.11, 2.1.1 and zoom to 200 % [V] | Maps embedded in scrolling pages: `cooperativeGestures: true` so the wheel scrolls the page |
| Next.js | A client component (`'use client'`) loaded by `next/dynamic(() => import('./FleetMap'), { ssr: false })` with a skeleton the size of the map. `setWorkerUrl(new URL(…, import.meta.url))`. Import `maplibre-gl/dist/maplibre-gl.css`. **One map instance per route**: keep it mounted when switching tabs (`reuseMaps` in react-map-gl) | MapLibre install docs: Turbopack/Next 15+ pattern [D]. react-map-gl Tips: `reuseMaps` [D] | Static thumbnails (emails, reports): server-rendered static images |
| React wrapper | **`@vis.gl/react-maplibre`** (`<Map>`, `<Source>`, `<Layer>`, `useControl`) + `@deck.gl/mapbox` `MapboxOverlay` through `useControl` for deck layers | Same code as `react-map-gl/maplibre` 8.1.3, but MapLibre-only peers [V] | Pure deck.gl apps without a basemap: `@deck.gl/react` `<DeckGL>` |
| Context loss and GPU | Listen for `webglcontextlost` / `webglcontextrestored` and show "Map paused, restoring…" over the canvas. The list keeps working. Cap DPR at 2 (`pixelRatio: Math.min(devicePixelRatio, 2)`). One WebGL context (interleaved deck.gl shares MapLibre's). Pause the deck.gl animation loop when the tab is hidden | MapLibre emits both events [D]. Browsers cap live WebGL contexts at ~16 per page [M] | Multi-map comparison views: a few contexts with `maxTileCacheSize` lowered |

---

## 3. Tools (npm checked 2026-10-18 [V]; gzip measured from unpkg dist files)
| Package | Version (date) | Licence | Best at | React/Next fit and flags | Offline headless bench? |
|---|---|---|---|---|---|
| `maplibre-gl` | **6.15.0 (2026-10-18)**; 6.14.0 (10-11) | BSD-3-Clause | Vector-tile renderer, style spec, clustering, feature-state, globe/terrain | v6 is **ESM-only** and needs `setWorkerUrl`. 6.14.0 main **285 KB gz** + worker **143 KB gz** | **Yes**: local `style.json` (background + GeoJSON layers; host glyphs locally or avoid text) + local GeoJSON. Serve over `127.0.0.1` like `bench3d` (PMTiles needs HTTP range requests, not `file://`). WebGL via SwiftShader worked in the probes |
| `deck.gl` / `@deck.gl/core`, `layers`, `geo-layers`, `aggregation-layers` | 9.4.0 (2026-09-05) | MIT | GPU layers: Scatterplot, Icon, Path, Trips, Hexagon, Heatmap, H3; picking; transitions | Peers `maplibre-gl ^4 ‖ ^5 ‖ ^6` [V]. Full UMD **575 KB gz** (tree-shaken is smaller [M]). The examples page shows WebGL2 and **WebGPU** tabs | **Yes**: the trips and icon examples rendered under SwiftShader [V probe]. Set the screenshot timeout ≥ 90 s while animating |
| `@deck.gl/mapbox` (`MapboxOverlay`) | 9.4.0 | MIT | Interleaving deck layers into MapLibre (shared context, `beforeId`) | Despite the name, it works with MapLibre. The default way to combine the two | Yes |
| `@deck.gl/react` | 9.4.0 | MIT | `<DeckGL>` when deck owns the view | Peers `@deck.gl/widgets` | Yes |
| `@vis.gl/react-maplibre` / `react-map-gl` | 8.1.3 (2026-09-02) | MIT | Declarative `<Map>`, `<Source>`, `<Layer>`, `<Marker>`, `<Popup>`, `useControl` | **Use `@vis.gl/react-maplibre`** (peer `maplibre-gl >=4`). `react-map-gl` also peers `mapbox-gl` | Yes |
| `pmtiles` + `@protomaps/basemaps` | 4.5.0 (2026-08-10) / 5.7.2 (2026-03-10) | BSD-3 / BSD-3 | Serverless single-file tiles; basemap style with flavours | `pmtiles` is **8 KB gz**. The basemaps package is 7 months without a release (borderline on our gate; daily data builds continue [D]) | Yes, with a local `.pmtiles` extract |
| `supercluster` | 9.1.0 (2026-09-03) | ISC | Fast point clustering (what MapLibre uses internally [M]) | Use it directly with deck.gl or a custom list ("n in cluster") | Yes |
| `@turf/turf` (prefer `@turf/<fn>`) | 7.4.0 (2026-08-03) | MIT | Geometry ops: distance, buffer, point-in-polygon (geofences), along | Import single modules to keep the bundle small | Yes |
| `h3-js` | 4.5.0 (2026-07-01) | Apache-2.0 | Hex-grid aggregation keys (deck.gl `H3HexagonLayer`) | WASM-free JS build [M] | Yes |
| `terra-draw` | 1.38.0 (2026-10-18) | MIT | Drawing and editing geofences across MapLibre, OpenLayers and Leaflet [M features] | Adapter for MapLibre [M] | Yes |
| `@maplibre/maplibre-gl-geocoder` | 1.9.4 (2026-03-13) | ISC | Search box UI; bring your own geocoding API | Borderline at 7 months | Mock the API |
| `kepler.gl` (`@kepler.gl/*`) | **3.3.0-alpha.16 is `latest`** (2026-10-09); last stable 3.2.6 (2026-03-16) | MIT | A whole exploration app: layer panel, filters, time playback, DuckDB | **Flags:** alpha-only line; Redux + `styled-components` 6; depends on `mapbox-gl` 1.13.1 and `maplibre-gl ^4` (not our v6). An internal analysis tool, not a product UI | Possible, but heavy. The demo runs alpha.17 [V probe] |
| `ol` (OpenLayers) | 10.11.0 (2026-10-04) | BSD-2-Clause | Projections, WMS/WMTS, GIS formats, WebGL point layers | No official React wrapper. Full build **298 KB gz** (tree-shakes). geOps and TRAVIC run on it [V probe] | Yes |
| `leaflet` | 1.9.4 (**2023-05-18**); 2.0.0-alpha.1 (2025-08-16) | BSD-2-Clause | Simple raster maps, DOM markers | **Fails the six-month release gate.** 42 KB gz. Raster or DOM only, so not for dense live data | Yes (raster needs local tiles) |
| `react-leaflet` | 5.0.0 (2024-12-14) | **Hippocratic-2.1** | React bindings for Leaflet | **Licence flag** (ethical-use licence, not OSI) and stale. Avoid | – |
| `mapbox-gl` | 3.33.0 (2026-10-13) | "SEE LICENSE IN LICENSE.txt" | – | **Exclude.** The licence allows use *"only with the relevant Mapbox product(s)… through their Mapbox account"* and terminates without an account in good standing [V]. 520 KB gz | No (needs a token) |
| Google Maps JS (`@vis.gl/react-google-maps` 1.10.1, MIT wrapper) | 2026-09-21 | Wrapper MIT; **API paid** | Google basemap, Places | The $200 credit was *"replaced… with free monthly calls per SKU"* [V]. Exclude as a default | No (needs a key and network) |

**Suggested stack:** MapLibre 6 + self-hosted Protomaps PMTiles (`grayscale` / `black` flavours) through
`@vis.gl/react-maplibre`. Add deck.gl via `MapboxOverlay` (interleaved) for icons, trails, hex aggregation and picking,
supercluster/MapLibre clustering, and turf modules for geofences. OpenFreeMap for prototypes.

**Bench idea (`benchmap/`, mirrors `bench3d`):** one local style, one local PMTiles extract, and a seeded 5k-vehicle GeoJSON
with 1 Hz synthetic updates, served on localhost. Tasks per stack (MapLibre-only, MapLibre + deck.gl, OpenLayers,
Leaflet-baseline): (a) first render; (b) 60 s of live updates (frame time, dropped frames); (c) click-pick accuracy at
z10/z14; (d) cluster→expand; (e) `flyTo` under `reducedMotion: 'reduce'` (must jump); (f) forced
`WEBGL_lose_context` → recovery; (g) keyboard pan/zoom and axe on the container; (h) gzip bundle. Treat SwiftShader timings
as relative only.

---

## 4. Public reference pages (no login; `curl -sL -A "Mozilla/5.0"` status and a headless probe, 2026-10-18 [V])
All of these need WebGL except MBTA. Capture with `node scripts/capture-motion.mjs <url> <out> --wait 15`. Animated pages
need a longer screenshot timeout (the probe needed 90 s).

| # | URL | Code | The moment | Probe result | Suggested capture |
|---|---|---|---|---|---|
| 1 | https://tracker.geops.ch/ (same app: https://mobility.portal.geops.io/) | 200 | **Real live fleet map**: trains, buses and trams moving on a muted basemap; a topic/layer menu (Vehicle positions, Bus lines, Stops, Baselayers) | MapLibre + OpenLayers, 1 WebGL context, no login | Wait 15 s, zoom to Zürich, click a vehicle → its detail panel. Two frames 5 s apart show the interpolated motion |
| 2 | https://www.mbta.com/schedules/Red/line | 200 | **Map + line diagram sync** with live vehicle positions, plus timestamps and alerts in the list | Leaflet, **30 live markers**, no WebGL | Desktop full page; crop the diagram beside the map. The best "list is the primary path" reference |
| 3 | https://travic.app/ | 200 | World transit vehicles animated between timetable and real-time points (Freiburg research) | OpenLayers, 1 WebGL context | Zoom to a city, capture motion frames |
| 4 | https://deck.gl/examples/trips-layer | 200 | Animated fading vehicle trails over a dark basemap, with a trail-length slider and stats card | Rendered [V screenshot]; the 30 s screenshot timed out once | `--wait 15`, screenshot timeout 90 s |
| 5 | https://deck.gl/examples/icon-layer | 200 | Many icons with auto-packing/cluster-style icons and a tooltip [M on content] | Rendered, 2 contexts | Hover an icon for the tooltip |
| 6 | https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/ | 200 | Count-sized clusters, click to expand | The map is in an embedded frame (no top-level GL) | Use `--selector` on the example iframe; click a cluster |
| 7 | https://maps.protomaps.com/ | 200 | Flavour switch: light, dark, **data viz (white / grayscale / black)**, plus language | MapLibre, rendered | Capture the three data-viz flavours at the same view: our muted-basemap swatches |
| 8 | https://kepler.gl/demo/nyctrips | 200 | Exploration workbench: layer list, filters, time playback | `/demo` opens an "Add Data To Map" modal; the version badge shows **3.3.0-alpha.17** on screen. Use the sample route | Wait 20 s, close the banner, capture the layer panel + playback |
| also | https://openfreemap.org/quick_start/ (200, MapLibre, Positron / Bright / Liberty / Dark / Fiord switch) · https://globe.adsbexchange.com/ (200, live aircraft; screenshot timed out, ad-heavy) · https://www.strava.com/maps/global-heatmap (200, but a cookie wall and sign-in prompt; full zoom needs login) | | | | |

**Failed or weak:** flightradar24.com, marinetraffic.com and tfl.gov.uk return **403** to the proxy. felt.com/gallery returns 200
but rendered marketing chrome in the probe. zugfinder.net has no canvas and threw a JS error. Esri blog pages return 403.
NN/g has no current article on interactive maps (search found only "interactive UX maps", which are journey maps).

## 5. Logged-in products: screens to capture (for a user with accounts)
| Product | Exact screens |
|---|---|
| **Samsara** | (1) Fleet overview map with the vehicle list beside it; (2) a vehicle's **last-located / stale** state and how its age is shown; (3) vehicle detail panel (HOS, fuel, camera); (4) route replay with timeline scrubber; (5) geofence editor and alert config |
| **Motive (KeepTruckin)** | Fleet view clustering at low zoom; driver card; "last updated" treatments; dispatch board |
| **Onfleet** | Dispatcher dashboard: three columns (tasks · map · drivers), ETA chips, unassigned task markers, driver route lines, auto-dispatch preview |
| **Uber Freight** (carrier and shipper) | Load tracking map with ETA and confidence; check-call timeline; exception banners; load board map |
| **project44 / FourKites** | In-transit visibility: **predicted ETA with confidence**, "tracking lost" state, exception queue sorted by risk |
| **Felt** | Layer panel + legend editor, filtering by attribute, comments pinned on the map, share and embed views |
| **ArcGIS Dashboards** | Operations dashboard: map + indicator tiles + list widgets that filter each other (the canonical "map–list sync") |
| **Strava** | Global heatmap at high zoom (login); activity map with elevation scrubbing |
| **Flightradar24** | Selected aircraft: trail, detail panel, follow mode and how a pan breaks it, "estimated" (no-signal) aircraft styling |

## 6. Disagreements with `research/categories.md` (C3/C6) and the catalogue
1. **Tiles and geocoding have no catalogue rows.** The C3 row recommends renderers only. Add resource rows for **Protomaps
   (PMTiles + basemaps)** and **OpenFreeMap** (free, no SLA). Add **MapTiler / Stadia** as paid-with-SLA, and the **OSM tile
   policy** and **Nominatim policy** as constraints.
2. **kepler.gl:** the catalogue reads it as passing the six-month gate on an alpha tag (v3.3.0-alpha.17). The *stable* line
   (3.2.6, 2026-03-16) is 7 months old, npm's `latest` points at an alpha, and its deps pin `mapbox-gl` 1.13.1 and
   `maplibre-gl ^4`. Keep it situational, but call it an analyst tool and lower the React/Next fit.
3. **Leaflet and react-leaflet should join the Avoid list.** No Leaflet release since May 2023 (2.0 still alpha), and
   react-leaflet is **Hippocratic-2.1**. The row's "useful for simple raster maps" holds only for OpenLayers or plain MapLibre.
4. **Reference choice:** the 3D-terrain example is the wrong lead reference for C3. Control rooms are 2D, pitch 0. Replace
   it with clusters + geOps tracker + MBTA. "Citymapper" is a mobile consumer app, and Strava's heatmap needs login at useful
   zooms. Add geOps / TRAVIC / MBTA as public live references.
5. **C6 lists only chart libraries plus maps, and frames freshness per feed.** Maps need freshness **per entity** (each
   vehicle has its own age). C6's "flash-on-change" is wrong for maps: moving markers already signal change, so flashing
   hundreds of icons is noise and risks WCAG 2.3.1. Use a one-shot halo only on status changes.
6. **Version drift:** MapLibre is now **6.15.0** (today), not 6.14.0.
7. **Scenario 4 test list:** add *attribution visible*, *pause live updates (WCAG 2.2.2)*, *list alternative covers every
   map fact*, *camera never moves on data updates*, and *worker URL / client-only build in Next*.
8. **Taxonomy gap:** `taxonomy.md` has no map pattern. Add `map` with tags `cluster`, `live-position`, `stale-data`,
   `map-list-sync`, `geofence`, `legend`.
9. **"Covers" should add geofence drawing** (terra-draw) and **search/geocoding**, both common in fleet briefs.

## Sources
- MapLibre: install and Next/Turbopack https://maplibre.org/maplibre-gl-js/docs/ ; MapOptions https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/ ; AnimationOptions (`essential`) https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/AnimationOptions/ ; KeyboardHandler https://maplibre.org/maplibre-gl-js/docs/API/classes/KeyboardHandler/ ; GeoJSON source and cluster options https://maplibre.org/maplibre-style-spec/sources/ ; `updateData` https://maplibre.org/maplibre-gl-js/docs/API/classes/GeoJSONSource/ [D]
- deck.gl: performance https://deck.gl/docs/developer-guide/performance ; MapboxOverlay https://deck.gl/docs/api-reference/mapbox/mapbox-overlay ; TripsLayer https://deck.gl/docs/api-reference/geo-layers/trips-layer ; transitions https://deck.gl/docs/developer-guide/animations-and-transitions ; MapController keyboard https://deck.gl/docs/api-reference/core/map-controller [D]
- react-map-gl: https://visgl.github.io/react-map-gl/docs/get-started ; tips (reuseMaps, markers vs layers) https://visgl.github.io/react-map-gl/docs/get-started/tips-and-tricks [D]
- OSM tile policy https://operations.osmfoundation.org/policies/tiles/ ; Nominatim https://operations.osmfoundation.org/policies/nominatim/ ; attribution https://www.openstreetmap.org/copyright [V]
- OpenFreeMap https://openfreemap.org/ , https://openfreemap.org/quick_start/ ; Protomaps https://docs.protomaps.com/basemaps/downloads , /basemaps/flavors , /deploy/ [V/D]
- Pricing: MapTiler https://www.maptiler.com/cloud/pricing/ ; Stadia https://stadiamaps.com/pricing/ ; Google https://mapsplatform.google.com/pricing/ ; Mapbox https://www.mapbox.com/pricing [V]
- Mapbox GL licence text: https://unpkg.com/mapbox-gl@3.33.0/LICENSE.txt [V]
- WCAG 2.2: 2.1.1 https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html ; 2.5.7 https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html ; 1.4.1 https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html ; 1.4.11 https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html ; 2.2.2 https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html [V URLs]
- UK government: Defra https://digital.defra.gov.uk/design/data-visualisation (InteractiveMap beta https://defra.github.io/interactive-map/) ; DfE design history https://becoming-a-teacher.design-history.education.gov.uk/register-of-placement-schools/exploring-showing-search-results-on-a-map ; Scottish Government (202 to curl, not read) https://designsystem.gov.scot/guidance/maps ; GDS podcast https://gds.blog.gov.uk/2021/11/30/podcast-maps-in-services/ [V]
