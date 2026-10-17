---
title: Drivable 3D world as a portfolio
pattern: 3d
page_type: landing
tags: [webgl, playful, dark, interactive, game]
source_url: https://bruno-simon.com
source_site: bruno-simon.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: The site is the demo. Visitors drive a small vehicle around a neon world to discover projects, which makes a portfolio memorable and proves the author's skill instantly. It's the canonical "experience" reference for three.js.
use_when: Reference for immersive, game-like experiences (campaigns, portfolios, launches) where exploration is the point, not for task-focused pages.
has_example: false
---

## What it is
Bruno Simon's portfolio is a real-time three.js world (r183): a dark purple grid floor, neon outlines and a
small vehicle the visitor drives with the keyboard or touch. The first state is a glowing loading ring; once
loaded, the scene shows the vehicle and the world. On mobile the loading ring takes longer.

## Key techniques
- **Designed loading state**: an animated neon ring on the scene's own floor, so waiting feels part of the world.
- **Game controls as navigation**: you explore content spatially.
- One WebGL2 canvas for the whole page; ~7.5 MB transferred (1.2 MB JavaScript), plus models and textures.
- Strong, limited palette (purple, magenta, white) keeps a busy scene coherent.

## Accessibility
Content lives inside the 3D world: the canvas has no label, there was no `<h1>` in the DOM, and it **kept
animating under reduced motion**. Fine for an art piece; not a model for content you need people to find.

## Weaknesses
Heavy, slow on weak GPUs (still loading after 9 s on our software GPU in a first probe), and hard to scan. Pair
any experience like this with a plain-HTML route to the same information.

## Related entries
- Engine: `sources/threejs`; `3d/igloo-scroll-webgl-story`

> Captured live on 2026-10-17 with `scripts/capture-motion.mjs` (desktop, mobile and a reduced-motion check on a software GPU). Numbers come from `evidence.json`; transfer sizes are what the browser downloaded in the capture window.
