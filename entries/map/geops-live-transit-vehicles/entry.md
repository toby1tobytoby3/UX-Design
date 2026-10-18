---
title: Live fleet map with thousands of moving vehicles on a muted basemap
pattern: map
page_type: app
tags: [data-viz, webgl, animated, b2b, interactive]
source_url: https://mobility.portal.geops.io/world.geops.transit?lang=en&x=950700&y=6003000&z=13
source_site: geops.io
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 4
why_it_works: A pale, low-saturation basemap pushes roads and labels into the background, so hundreds of live vehicle dots (interpolated between real-time pings, so they glide instead of jumping) read instantly as the subject of the screen.
use_when: Any live fleet, vehicle-tracking or control-room map where many moving objects share one view (scenario 4).
has_example: false
---

## What it is
geOps' Mobility Portal (the public tracker.geops.ch redirects here), opened at Zürich, zoom 13. Trains, trams, buses and
boats appear as coloured dots, with the network drawn as grey lines, plus a station search, a "Topics" layer menu,
a zoom slider, a basemap switcher (bottom left) and a scale bar. `crop-motion-5s-later.jpg` is the same view five seconds
later: the vehicles have moved smoothly.

## Key techniques
- **The basemap stays quiet**: light grey roads, pale green parks, small grey labels. Only vehicles use saturated colour.
- **Interpolated motion**: vehicles animate between real-time positions instead of jumping on each ping.
- **Network lines under vehicles**: dashed and solid grey lines show the route context without competing with the dots.
- **Stack**: MapLibre 6 canvas with OpenLayers layers on top (`evidence.json`: one WebGL2 context, 3 canvases).
  5.8 MB transferred, 1.25 MB of JS.
- **Attribution always visible**, bottom right: "Geodata © SBB/CFF/FFS, © geOps Tiles, © OpenStreetMap, © OpenMapTiles".

## Accessibility
- **The map canvas isn't focusable** (`tabindex=-1`, no role or label), so keyboard users can't pan or zoom the map.
  Zoom buttons are named only through `title`.
- Dots appear to encode punctuality with a green-to-red fill, but there's no on-map key, and colour is the only cue (fails 1.4.1).
- **Vehicles keep moving under `prefers-reduced-motion: reduce`**, and there's no Pause control (WCAG 2.2.2).
- A welcome dialog covers the map on every first visit. Its close button's name is German ("Dialog schließen") on the English page.

## Weaknesses
- A promo carousel ("Developer portal", "Mapset") permanently covers the bottom-right of the map, on mobile too.
- At city zoom, dots overlap in dense areas (Zürich HB) with no clustering or declutter.

## Related entries
- `map/mbta-line-diagram-live-vehicles` (the list-first accessible alternative), `map/protomaps-data-viz-basemap-flavours`.
