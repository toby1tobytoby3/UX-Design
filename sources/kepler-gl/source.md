---
title: kepler.gl
kind: source
pattern: map
page_type: app
tags: [maps, analysis, open-source, deck-gl, exploration, heavy]
source_url: https://kepler.gl
source_site: kepler.gl
captured_at: 2026-10-18
captured_by: toby
input: desk-research
version: 3.2.6
licence: MIT
s_look: 4
s_interact: 5
s_coverage: 5
s_a11y: 2
s_perf: 4
s_react: 2
s_bundle: 1
s_licence: 3
why_it_works: A complete geospatial exploration app on deck.gl, with a layer panel, filters, time playback, hexbin and arc layers and DuckDB loading, that analysts can point at a CSV and explore with no code.
use_when: An internal analysis tool or a reference for exploration UI (layer list, filter panel, time slider). Embed it only when the whole app is the product.
avoid_when: Product UI that needs your own design system, or a light bundle: it brings Redux, styled-components and an old map stack.
alternatives: [deck-gl, maplibre]
has_example: false
---

## Verdict
**An analyst's workbench, not a component library.** Desk research only; it isn't in `benchmap/`, because it is a whole
app rather than a map renderer. Three flags: **npm `latest` is an alpha** (3.3.0-alpha.16, 17 Oct 2026; the demo runs
alpha.17), the last stable is **3.2.6 from 16 Mar 2026**, and `@kepler.gl/components` depends on **`mapbox-gl` 1.13.1**
and `maplibre-gl ^4`, not MapLibre 6.

## What it covers
Layer panel (point, arc, line, hexbin, H3, trips, polygon, heatmap), field-based colour and size, filters with
histograms, time playback, tooltips and brushing, map styles, export to image, HTML or JSON, and DuckDB-based loading.
Public demo with sample data: https://kepler.gl/demo/nyctrips (no login).

## Weaknesses
- The alpha line is the `latest` tag: install `kepler.gl@3.2.6` explicitly for stability, and expect churn.
- Pulls in Redux (its own store slice), styled-components 6 and `mapbox-gl` 1.x: heavy, and outside our stack.
- Accessibility not measured. The UI is drag-heavy panels and canvas layers.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | A finished dark analysis UI out of the box |
| Interactivity | 5 | Filters, brushing, time playback, layer config with no code |
| Coverage | 5 | Most deck.gl layer types plus data loading and export |
| Accessibility | 2 | Not measured; drag-based panels and canvas output (desk) |
| Performance | 4 | deck.gl rendering underneath (desk) |
| React/Next fit | 2 | A Redux-connected app component; styled-components; old map dependencies |
| Bundle size | 1 | Several MB of dependencies (Redux, styled-components, mapbox-gl 1.x, deck.gl) |
| Licence & health | 3 | MIT, active alpha releases; last stable 7 months old; depends on mapbox-gl 1.x and maplibre-gl 4 |
