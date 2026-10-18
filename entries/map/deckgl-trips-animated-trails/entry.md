---
title: Animated fading trails for 10,000 trips over a dark 3D city
pattern: map
page_type: docs
tags: [data-viz, webgl, animated, dark, open-source]
source_url: https://deck.gl/examples/trips-layer
source_site: deck.gl
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 3
why_it_works: Short glowing trails that fade behind each moving point show both where things are and where they've been, so flow and direction read without arrows. A small stats card ("10.0K trips, 3.9K buildings, 897.2K vertices") anchors the scale.
use_when: Showing movement history or flow (fleet replays, delivery routes, network traffic) where a trail beats a dot; analytics and storytelling rather than live operations.
has_example: false
---

## What it is
deck.gl's TripsLayer example: NYC taxi trips (16 June 2016, 21:00–21:30) animated as orange and teal trails over a dark
MapLibre basemap with extruded 3D buildings. A floating card gives the data sources, counts and a "Trail" length slider.

## Key techniques
- **TripsLayer**: each path carries timestamps; `currentTime` advances and `trailLength` (180) sets how far the fade reaches back.
- **Two hues for two fleets** (yellow vs green cabs as orange vs teal) on a near-black basemap.
- **deck.gl over MapLibre** (`reuseMaps`): MapLibre draws the basemap and handles keyboard; deck.gl draws data in a second WebGL canvas.

## Accessibility
- The MapLibre canvas is focusable with `role="region"` and `aria-label="Map"`. The deck.gl canvases aren't focusable and
  have no text alternative.
- **The animation loops forever and ignores reduced motion.** The example's source (`popmotion` `animate`, `repeat: Infinity`)
  has no `prefers-reduced-motion` check and no pause control.
- The Trail slider has no label (`<input type="range">` with no `aria-label` or `<label>`).
- Attribution ("© CARTO, © OpenStreetMap contributors") sits below the fold at 1440×900.

## Weaknesses
- Software-GPU screenshots repeatedly timed out or crashed the renderer: continuous WebGL animation is heavy. Budget for
  low-end hardware and pause when the tab is hidden.
- Orange vs teal trails rely on hue alone, with no legend on the map.

## Related entries
- `map/geops-live-transit-vehicles`, `3d/*` (WebGL performance notes), `motion/*` (reduced-motion handling).
