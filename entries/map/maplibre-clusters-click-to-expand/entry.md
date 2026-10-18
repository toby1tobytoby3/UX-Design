---
title: Count clusters that ease in on click and jump when motion is reduced
pattern: map
page_type: docs
tags: [data-viz, webgl, open-source, interactive]
source_url: https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/
source_site: maplibre.org
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 4
why_it_works: Built-in GeoJSON clustering turns a large earthquake dataset into 39 labelled circles at zoom 3 sized and coloured by count, and clicking a cluster eases straight to the zoom where it splits, so drilling down takes one click instead of guessing.
use_when: More than a few hundred points in one view (vehicles, sites, incidents) where individual markers would overlap; the default before reaching for deck.gl.
has_example: false
---

## What it is
MapLibre GL JS 6.15.0's "Create and style clusters" example (captured standalone, `create-and-style-clusters.html`).
Clusters use three steps: radius 20/30/40 and colour `#51bbd6` / `#f1f075` / `#f28cb1` at 0–99 / 100–749 / 750+ points,
with the count as the label (abbreviated, e.g. "1k"). Single quakes are 4 px `#11b4da` dots with a white stroke.
`crop-after-cluster-click.jpg` shows the result of clicking the 1,006-point cluster.

## Key techniques
- **`cluster: true` on the GeoJSON source** plus `getClusterExpansionZoom(clusterId)` → `easeTo({center, zoom})`: the
  click lands exactly where the cluster breaks apart (zoom 3 → 4 here).
- **Count plus size plus colour**: three cues for magnitude, so it doesn't rely on colour alone.
- Unclustered points open a popup ("magnitude", "Was there a tsunami?").

## Accessibility
- **Reduced motion is honoured, measured**: with `prefers-reduced-motion: reduce`, the zoom was already at its final value
  100 ms after the click, with `isMoving()` false. Without it, the map was still easing (zoom 3.5 of 4 at 100 ms).
  `easeTo` / `flyTo` only animate under reduce when called with `essential: true`.
- Canvas focusable, `role="region"`, `aria-label="Map"`. **+ / − keys zoom (measured)**.
- **Cluster colours fail 3:1 against the basemap** (WCAG 1.4.11): yellow on land 1.16:1, blue on land 1.60:1, pink on
  land 1.64:1. Single points on the ocean are 2.11:1. Count text is black on every cluster (9.2–17.5:1, fine).
- Clusters aren't keyboard reachable. Only the mouse can expand them.
- The attribution is collapsed to "MapLibre ⓘ".

## Weaknesses
- The demo basemap is saturated (lilac Canada, green USA), which is why the cluster colours wash out. On a grayscale
  flavour the same palette would pass.

## Related entries
- `map/protomaps-data-viz-basemap-flavours`, `map/geops-live-transit-vehicles`.
