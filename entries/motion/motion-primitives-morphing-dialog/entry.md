---
title: Card that morphs into a dialog (shared layout animation), with the image and title travelling into place
pattern: motion
page_type: docs
tags: [minimal, animated, open-source, interactive]
source_url: https://motion-primitives.com/docs/morphing-dialog
source_site: motion-primitives.com
captured_at: 2026-10-19
captured_by: toby
input: url
rating: 3
why_it_works: The card's image and title grow into the dialog instead of a new box appearing, so people keep track of what they opened and where it came from.
use_when: Opening a detail view from a grid of cards (products, articles, gallery items) where continuity matters more than speed.
has_example: false
---

## What it is
Motion Primitives' Morphing Dialog (MIT, built on Motion's layout animations). A card (image, title, subtitle) expands into a
centred dialog with the same image, a longer description and a link, over a blurred page; ✕ or Escape shrinks it back into the card.

## Key techniques
- **Shared element**: image and title keep their identity (`layoutId`) between card and dialog.
- **Blurred, dimmed backdrop** keeps the page visible behind.
- Short spring; the content below the title fades in after the morph.

## Accessibility
Measured: Enter opens a `role="dialog"` with `aria-modal="true"`, focus moves inside and stays there. But:
- **The trigger's accessible name leaks a React id**: "Open dialog _r_7_".
- **Escape drops focus to the page** instead of returning it to the card.
- **No reduced-motion handling** in this component's source (6 of the kit's 33 components check for it), so the morph always runs.

## Weaknesses
Fix the three issues above before using it; with them fixed it would be a 4. For a lighter route to the same effect, see
`motion/nextjs-viewtransition-photo-gallery` (view transitions, which respect reduced motion in CSS).

> Captured live on 19 Oct 2026 with Playwright (screenshots plus keyboard probes). Supplied as an Instagram reel screenshot; the live site replaced it.
