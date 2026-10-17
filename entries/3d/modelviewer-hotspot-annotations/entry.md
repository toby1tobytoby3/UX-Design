---
title: Product model with surface-pinned annotation hotspots
pattern: 3d
page_type: product
tags: [webgl, product-viewer, accessible, ecommerce, open-source]
source_url: https://modelviewer.dev/examples/annotations/
source_site: modelviewer.dev
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: Labels are real HTML elements pinned to points on the model; they hide when that point turns away from the viewer, so annotations feel attached to the object while staying accessible, styleable and translatable.
use_when: Product pages that explain features on a physical object ("this is the power button", "USB-C here").
has_example: false
---

## What it is
The official `<model-viewer>` annotation demo: a low-poly astronaut with coloured dots on its surface. Each dot is
a slotted HTML button with `data-position` (a point on the model) and `data-normal` (which way it faces).
One label is fixed in screen space; another fades when its point faces away ("This hotspot disappears completely").

## Key techniques
- `<button slot="hotspot-…" data-position="…" data-normal="…">` gives a focusable, styleable label tied to the surface.
- **Occlusion by normal**: a hotspot facing away from the camera dims or hides (`--min-hotspot-opacity`, `data-visibility-attribute`), so labels never float on the wrong side.
- Screen-space annotations for things that shouldn't move with the model.
- ~3.3 MB transfer for the page; the viewer itself was 291 KB gz in our benchmark (`sources/model-viewer`).

## Accessibility
Hotspots are buttons, so they're reachable by keyboard and readable by screen readers. The demo page kept
animating under reduced motion, so check auto-rotate and animations in your own use.

## Weaknesses
It's a documentation demo, not a finished product page. Copy the mechanics, not the styling.

## Related entries
- Source: `sources/model-viewer` (built-in hotspots in our benchmark)
- `3d/apple-airpods-scroll-story` for the "product story" alternative

> Captured live on 2026-10-17 with `scripts/capture-motion.mjs` (desktop, mobile and a reduced-motion check on a software GPU). Numbers come from `evidence.json`; transfer sizes are what the browser downloaded in the capture window.
