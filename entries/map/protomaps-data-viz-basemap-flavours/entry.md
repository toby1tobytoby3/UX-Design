---
title: Basemap flavours built for data overlays, white, grayscale and black
pattern: map
page_type: app
tags: [data-viz, webgl, minimal, open-source, dark]
source_url: https://maps.protomaps.com/#map=13/51.5072/-0.1276
source_site: maps.protomaps.com
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 4
why_it_works: Three "data viz" flavours strip the basemap to neutral tones (white, grayscale, black), so any status colour you draw on top keeps its meaning, and the same view switches flavour with one control.
use_when: Choosing a basemap for a dashboard or fleet map where markers, heatmaps or choropleths carry the colour; the default for our maps.
has_example: false
---

## What it is
The Protomaps basemap viewer at London, zoom 13. A "flavor" select switches between light (`desktop.jpg`), dark and the
data-viz flavours white, grayscale and black (`crop-flavour-*.jpg`), with a language select, place search, zoom,
compass, globe toggle, geolocate and a feature inspector. Tiles come from one PMTiles file (`v4.pmtiles`).

## Key techniques
- **Neutral flavours for overlays**: grayscale renders land at about `#c2c2c2` with darker water; black at about `#191919`;
  white at about `#fcfcfc`. They carry no hue to clash with status colours.
- **Labels stay readable in every flavour**, from street names up to district names in small caps.
- **One file, self-hostable**: a single PMTiles archive served over HTTP range requests, so no tile server and no API key.
- MapLibre 6, 929 KB transferred on first load (320 KB JS).

## Accessibility
- The map canvas is focusable, with `role="region"` and `aria-label="Map"` (MapLibre default). Arrow keys pan it (measured).
- All controls have names ("Zoom in", "Drag to rotate map, click to reset north", "Find my location").
- **Attribution visible** ("Protomaps © OpenStreetMap"). The map doesn't animate under reduced motion.

## Weaknesses
- It's a developer tool: the flavour and language selects are small, and the page has no product chrome.
- In grayscale, water and parks differ only in lightness. Fine for a backdrop, but don't use the basemap to convey information.

## Related entries
- `map/geops-live-transit-vehicles`, `design-tokens/*` (pick overlay colours that hold 3:1 against the flavour you choose).
