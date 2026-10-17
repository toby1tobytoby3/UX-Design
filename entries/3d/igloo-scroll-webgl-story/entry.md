---
title: Scroll-driven cinematic WebGL story
pattern: 3d
page_type: landing
tags: [webgl, scroll-scene, editorial, interactive]
source_url: https://igloo.inc
source_site: igloo.inc
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: Scrolling drives a camera through a photoreal snowy landscape and an igloo built from glowing blocks, so the page feels like a short film you control, with award-level craft in lighting, particles and material detail.
use_when: Reference for high-end, scroll-driven 3D storytelling (brand launches, studio showcases) where the experience itself is the message.
has_example: false
---

## What it is
Igloo Inc's site opens on a counting loader ("096"), then reveals an igloo on a mountain, wrapped in a particle
cloud and network lines. Scrolling moves the camera closer and around it, through increasingly detailed views of
the snow and blocks. A small HUD-style UI sits in the corners.

## Key techniques
- **Scroll as timeline**: each wheel step advances the camera along a path. Our three scroll frames show the camera moving in on the igloo.
- **three.js r165**, WebGL2; the canvas isn't in the regular DOM (likely inside a custom element), so tools and readers can't find it.
- **Numeric loader** sets expectations for a heavy download: ~15 MB transferred in the capture window.
- Monochrome palette with one material story (snow, ice, light) keeps it cohesive.

## Accessibility
No `<h1>` or readable text in the DOM at load, no canvas label, and it **kept animating under reduced motion**.
The story is only available to people who can see and scroll the 3D.

## Weaknesses
Very heavy; a long wait on slower connections; unreadable to search and assistive tech. Learn the camera choreography,
not the delivery. Keep a text version of the story in HTML.

## Related entries
- `3d/apple-airpods-scroll-story` (same storytelling goal with pre-rendered media)
- `3d/bruno-simon-drivable-portfolio`

> Captured live on 2026-10-17 with `scripts/capture-motion.mjs` (desktop, mobile and a reduced-motion check on a software GPU). Numbers come from `evidence.json`; transfer sizes are what the browser downloaded in the capture window.
