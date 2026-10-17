---
title: WebGL colour ribbon behind an HTML headline
pattern: 3d
page_type: landing
tags: [webgl, hero-3d, shaders, gradient, saas, b2b]
source_url: https://stripe.com
source_site: stripe.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: A slow, glossy WebGL ribbon gives the brand a signature, alive feeling while the headline, CTAs and logos stay plain HTML on top, so the page reads, ranks and converts exactly as it would without the 3D.
use_when: A brand moment on a marketing homepage where motion should signal quality without carrying any content.
has_example: false
---

## What it is
Stripe's homepage hero: a large ribbon of saturated colour (orange, pink, violet, blue) sweeps diagonally behind
the right half of the hero and bleeds off the edges. The headline ("Financial infrastructure to grow your
revenue…"), two CTAs and the customer logo row are ordinary HTML layered over it. On mobile the ribbon crops to
the top-right corner and the text stack stays fully readable.

## Key techniques
- **Real-time WebGL, not video**: three.js r178 on the page, two canvases (WebGL1 and WebGL2 contexts).
- **Canvases are `aria-hidden`**: the effect is explicitly decorative, so screen readers skip it. This is the right call for a background.
- **Content never depends on it**: headline, CTAs and logos are HTML, so search, translation and accessibility work as normal.
- **Composition**: the ribbon fills the right and top-right, leaving the text column on the left clean. Contrast holds because the ribbon sits mostly outside the text block.
- **Restraint**: one effect, one area, no interaction required.

## Accessibility
Decorative canvases are correctly hidden. However, **the ribbon kept animating with `prefers-reduced-motion: reduce`**
in our capture. A reduced-motion user would be better served by a still frame.

## Weaknesses
The page downloaded about 2.7 MB in the capture window, including ~2 MB of JavaScript (not all of it for the hero).
The effect needs a capable GPU, so test that it degrades gracefully on low-end phones.

## Related entries
- Engine: `sources/threejs` (or `sources/ogl` for a lighter shader-only version)
- `3d/github-floating-characters-hero`: another 3D hero that does stop for reduced motion

> Captured live on 2026-10-17 with `scripts/capture-motion.mjs` (desktop, mobile and a reduced-motion check on a software GPU). Numbers come from `evidence.json`; transfer sizes are what the browser downloaded in the capture window.
