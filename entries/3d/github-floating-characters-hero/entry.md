---
title: Floating 3D characters under a centred headline
pattern: 3d
page_type: landing
tags: [webgl, hero-3d, devtools, dark, playful]
source_url: https://github.com/home
source_site: github.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: Small, friendly 3D characters drifting in a glow below the sign-up form add personality to a developer brand without competing with the headline or the email field, which stay first in reading order.
use_when: A product homepage that wants warmth or playfulness in the hero while keeping a conversion form as the focus.
has_example: false
---

## What it is
GitHub's logged-out homepage: a dark indigo hero with a centred headline ("The future of building happens
together"), supporting copy and an inline email sign-up. Below it, white 3D mascot characters float in a purple
glow, rendered in WebGL. On mobile the form stacks and the characters move below the fold.

## Key techniques
- **3D sits below the conversion point**: headline, then form, then the 3D. The scene never pushes the form down.
- **three.js r148** with six canvases on the page (the hero plus other sections), alongside two videos.
- **Stops for reduced motion**: with `prefers-reduced-motion: reduce` the hero was static in our capture. That's the behaviour to copy.
- Lighting is a soft radial glow from below, which reads as "magic" rather than "product render".

## Accessibility
Motion respects user preference. The canvases have no labels; if they convey nothing, mark them `aria-hidden` as Stripe does.

## Weaknesses
The page downloaded ~4.7 MB (1.9 MB JavaScript) in the capture window, which is heavy for a sign-up page.
The three.js version (r148) is old, so heroes like this need maintenance.

## Related entries
- Engine: `sources/threejs`; in our stack, `sources/react-three-fiber`
- `3d/stripe-webgl-ribbon-hero`

> Captured live on 2026-10-17 with `scripts/capture-motion.mjs` (desktop, mobile and a reduced-motion check on a software GPU). Numbers come from `evidence.json`; transfer sizes are what the browser downloaded in the capture window.
