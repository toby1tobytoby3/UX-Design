---
title: Blueprint-style 3D linework for a data hall, with a dependency thread through stacked layers
pattern: 3d
page_type: dashboard
tags: [3d, webgl, shaders, minimal, data-viz, open-source, dark]
source_url: https://threejs.org/docs/#examples/en/lines/LineSegments2
source_site: threejs.org
captured_at: 2026-10-23
captured_by: toby
input: library-render
version: three 0.186.1
licence: MIT
rating: 3
why_it_works: Outlined (not filled) objects on a navy grid read as an engineering drawing, so dense infrastructure stays legible, colour is free to mean status, and a single accent thread can show a dependency running through stacked layers.
use_when: Technical layers of a digital twin or infrastructure view (racks, hosts, power and network chains) where precision and legibility beat realism, and status colour must stand out.
has_example: false
---

## What it is
Our own rebuild (not a captured site): a three.js r186 scene of two rows of cabinets in a hall, drawn as thick-line
outlines over a shader grid, with hatch shading for thermal load, two translucent "layer" planes above (CIs,
Environments), and a dashed accent thread from the selected cabinet (B-06) up through the layers. Labels are HTML with
leader lines. Rendered with SwiftShader from `preview.html`.

## Key techniques
- **Crisp linework at any zoom:** `EdgesGeometry(geo, 15)` → `LineSegmentsGeometry().fromEdgesGeometry()` →
  `LineSegments2` + `LineMaterial({ linewidth })`. Plain `LineBasicMaterial` is stuck at 1 px on most GPUs. In React
  Three Fiber this is drei's `<Edges lineWidth>` (same LineSegments2 underneath).
- **Fill = background colour at 85% opacity**, so back edges are hidden without looking solid.
- **Grid via `fwidth` in a fragment shader** (minor 0.5 m, major 2.5 m): anti-aliased at every distance, no textures.
- **Hatching encodes a value** (thermal load) by line density, keeping colour reserved for status.
- **Selection = accent colour + thicker line** (2.4 vs 1.2 px), plus a dashed `LineMaterial({ dashed: true })` thread.
- **HTML labels** projected each frame, with a ground-coloured background so they stay readable over the grid.
- `LineMaterial.resolution` must be updated on resize, or line widths drift.

## Accessibility
- The canvas container has `role="img"` and a description of the view; labels are real HTML (`aria-hidden` here because the
  description covers them). In a product, pair it with a list or table of the same items.
- Under reduced motion the slow camera drift stops and the scene renders once.

## Weaknesses
- Our first render placed the selected cabinet on an "empty" slot and the thread one cabinet off: projected HTML
  labels and 3D anchors need a test that checks they match.
- Line widths are in screen pixels, so very dense scenes get busy when zoomed out: drop minor edges with distance.
- Not benchmarked for performance; each cabinet here is its own mesh (use instancing for halls of hundreds).

## Related entries
- `navigation/airbnb-3d-category-icon-tabs`: the tactile, playful counterpart for customer-facing layers.
- `graph/elk-layer-pinned-twin-layout`: laying out the logical layers that sit above this view.
