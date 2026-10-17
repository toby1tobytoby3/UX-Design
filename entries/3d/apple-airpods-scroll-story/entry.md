---
title: 3D product story without a 3D engine
pattern: 3d
page_type: product
tags: [scroll-scene, product-viewer, b2c, minimal, video]
source_url: https://www.apple.com/airpods-pro/
source_site: apple.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: Photoreal product renders, scroll-triggered sequences and short films deliver everything a real-time 3D scene would, at Apple quality, with no three.js and no shader risk, and the page stops animating when users ask for reduced motion.
use_when: Premium product storytelling where the views are art-directed (you choose every angle), so pre-rendered media beats real-time 3D.
has_example: false
---

## What it is
The AirPods Pro page opens on a large, photoreal render of the earbuds above the product name, headline and a
price-and-Buy pill. Scrolling moves through "Get the highlights" (a carousel of short films with play/pause and
progress dots) and "Take a closer look" product views. On mobile the hero simply scales down.

## Key techniques
- **No 3D engine**: no three.js detected and no canvases. 15 `<video>` elements carry the motion, with high-res stills for the hero.
- **Art-directed angles**: every view is chosen and pre-rendered, so it always looks perfect, which real-time 3D can't guarantee on every device.
- **Media controls**: films autoplay muted in a carousel, with a visible pause button and progress dots.
- **Reduced motion respected**: the page was static under `prefers-reduced-motion: reduce` in our capture.
- ~4.8 MB transferred in the first view, with media loaded progressively as you scroll.

## Accessibility
Pause controls on moving media, real HTML text throughout, and reduced motion honoured. This is the reference to beat.

## Weaknesses
Users can't freely rotate or inspect the product (no orbit or AR on this page). Producing renders and films needs
a 3D artist and a video pipeline.

## Related entries
- `3d/modelviewer-hotspot-annotations`: when users need to inspect freely
- `guides/3d.md`: "Should this be 3D at all?"

> Captured live on 2026-10-17 with `scripts/capture-motion.mjs` (desktop, mobile and a reduced-motion check on a software GPU). Numbers come from `evidence.json`; transfer sizes are what the browser downloaded in the capture window.
