---
title: Category tabs with tactile 3D icons that play a short clip when selected
pattern: navigation
page_type: landing
tags: [3d, playful, illustrative, animated, b2c, consumer-app]
source_url: https://www.airbnb.co.uk
source_site: airbnb.co.uk
captured_at: 2026-10-23
captured_by: toby
input: url
rating: 4
why_it_works: Soft, toy-like rendered 3D objects (a house, a balloon, a concierge bell) make plain category tabs feel tactile and friendly, and the motion is a sub-second clip played once on selection, so it adds delight without looping or slowing the page.
use_when: A small set of top-level categories or modes where you want a signature, playful feel (consumer apps, journey or mode pickers), including a "tactile" layer inside an otherwise technical product.
has_example: false
---

## What it is
The search bar's category switcher on Airbnb's homepage (All · Homes · Hotels · Experiences · Services). Each tab has a
small rendered 3D illustration above or beside its label; the selected tab gets an underline, and its icon plays a short
animation. Captured live (desktop and mobile), plus a crop of the selected state.

## Key techniques
- **The "3D" is pre-rendered video, not real-time WebGL.** Each icon is a 180 px **WebM clip** (e.g.
  `search-bar-icons/webm/balloon-selected.webm`, duration **0.77 s**) with a static **AVIF** image as the resting state.
  This gives a rendered, lit, soft-shadowed look for a few KB per icon and no 3D engine.
- **Play once, on select.** Videos are `autoplay=false`, `loop=false`; the selected tab's clip plays once and ends on its
  last frame. No idle looping.
- **Reduced motion honoured:** with `prefers-reduced-motion: reduce` the videos get no `src` at all (nothing downloads);
  only the static images show.
- Consistent object language: every icon is one rounded, slightly glossy object at the same three-quarter angle and
  scale, so the set reads as a family.
- Tabs are `role="tab"` with `aria-selected`; arrow keys move between them (roving focus): ArrowRight moved
  Homes → Hotels.

## Accessibility
- One tab stop for the whole tab list (Tab: Skip to content → Airbnb homepage → Homes tab), then arrow keys. Good.
- Icons are decorative; the visible text label carries the meaning.
- Reduced motion fully respected (no video requested).

## Weaknesses
- The illustration style is Airbnb's brand; copy the *technique* (pre-rendered clip + static poster, play once on select),
  not the artwork.
- Pre-rendered clips can't react to data or be recoloured at runtime. For status-driven objects (e.g. a journey that turns
  red when failing), render in real time instead (matcap or toon materials in React Three Fiber) or keep the clip for
  the "selected" moment only.
- The "Lava" name some third-party sites give Airbnb's icon format is unverified; this capture shows WebM + AVIF.

## Related entries
- `3d/blueprint-linework-data-hall`: the opposite, technical style for infrastructure layers.
- `motion/rive-state-machine-vehicle`: a runtime alternative when the illustration must respond to state.
