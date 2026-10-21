---
title: Wheel picker with curved, fading labels around a dial, a crossfading image for the active item, and full keyboard support
pattern: content-grid
page_type: docs
tags: [dark, animated, keyboard, accessible, open-source, interactive]
source_url: https://componentry.dev/docs/components/wheel-carousel
source_site: componentry.dev
captured_at: 2026-10-21
captured_by: toby
input: url
rating: 4
why_it_works: Items sit on a curved wheel that fades toward the edges, so a list of 15 reads as a dial with one clear choice in the middle, and unlike most showpiece carousels it is a real listbox you can drive with the arrow keys.
use_when: A small, browsable set (portfolio projects, collections, chapters) where choosing one item and seeing its image is the whole job, on a showcase or portfolio page.
has_example: false
---

## What it is
Componentry's Wheel Carousel (MIT; installs with `shadcn add @componentry/wheel-carousel`; depends on framer-motion). Project
names are laid out on an arc with rotated, fading labels; the active one sits level in the middle with a blue dot, and its image
crossfades in on the left. Drag or scroll spins the wheel with inertia. There's a second variant with a landscape image on the right.

## Key techniques
- **Arc layout with rotation and opacity falloff**, so position on the wheel shows distance from the current item.
- **One active item, level and bright**; everything else is rotated and dimmed.
- **Image crossfade tied to the active item**, rather than a separate gallery.

## Accessibility
Measured: the wheel is `role="listbox"` named "Wheel carousel", focusable (`tabindex="0"`), with 15 `role="option"` items and
`aria-activedescendant`. **ArrowDown moved the selection** (Halcyon Fields → Meridian House → Norlight Pavilion) and `aria-selected`
followed it. The component checks `prefers-reduced-motion` in its source, and no animations were running with reduced motion on.
Rare for a showpiece component.

## Weaknesses
- Rotated labels at the ends of the arc are hard to read; keep the list short (about 15 at most).
- No visible hint that the arrow keys work; add one for keyboard users.
- Across the kit, 23 of 64 components check for reduced motion, and most are WebGL hero effects (ribbons, liquid glass, dither)
  meant for landing pages.

> Captured live on 21 Oct 2026 with Playwright, including hover, keyboard and reduced-motion checks, plus a read of the component source.
