---
title: Highlights media gallery with pause control and progress dots
pattern: feature-grid
page_type: product
tags: [b2c, minimal, video, responsive]
source_url: https://www.apple.com/iphone-17/
source_site: apple.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: Each key feature gets one full-width card with a short claim and a film or image, auto-advancing like a story, with a visible pause button and progress dots, so the highlights land in seconds without overwhelming the page.
use_when: Summarising 4–8 headline features of a product where each deserves its own visual.
has_example: false
---

## What it is
"Get the highlights." on the iPhone 17 page: a horizontal gallery of 12 large rounded cards. Each card pairs one
sentence ("Brighter display, now with ProMotion up to 120Hz. Durable Ceramic Shield 2 front…") with a film or
image. Below, a progress pill shows the current card and a **Pause Highlights Gallery** button controls autoplay.
On mobile the card becomes a tall image with the same dots and play control. A sticky "iPhone 17 · Explore · Buy"
bar follows the page.

## Key techniques
- **One claim per card**, short enough to read before it advances.
- **Autoplay with an explicit pause button** (labelled "Pause Highlights Gallery") and progress dots that show position and time.
- **Peeking next card** at the right edge signals there's more.
- **A sticky product bar** keeps "Buy" one tap away throughout.

## Accessibility
The labelled pause control is the key detail, and auto-advancing content without it would fail. Make sure each card's text is real HTML (it is here).

## Weaknesses
Autoplaying media is heavy and distracting if overused.

> Retargeted on recapture: Apple no longer shows the bento grid the base-pack entry described; Apple now uses this highlights gallery. The desktop films did not decode in our headless browser (proprietary codecs), so the desktop frame is kept as `crop-desktop-video-not-decoded.jpg` and the mobile capture is the main image.
> Recaptured live on 2026-10-17 with `scripts/capture.mjs` and a scroll-into-view step.
