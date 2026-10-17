---
title: Dark product hero with glowing app screenshot
pattern: hero
page_type: landing
tags: [saas, devtools, dark, gradient, minimal, animated]
source_url: https://linear.app
source_site: linear.app
captured_at: 2026-10-17
captured_by: base-pack
input: base-pack
rating: 5
why_it_works: A short, confident headline plus a large real product screenshot sells the product faster than any illustration; the dark canvas and soft glow make the UI the brightest thing on the page.
use_when: Product-led SaaS where the interface itself is the selling point.
has_example: false
needs_capture: true
---

## What it is
Near-black page, centred tight headline (two lines, large, slightly negative letter-spacing),
one-sentence subhead in muted grey, a pair of CTAs (solid primary, ghost secondary), then a
wide, slightly perspective-tilted product screenshot that bleeds off the bottom of the fold
with a subtle radial glow behind it.

## Key techniques
- Headline 56–72px, `letter-spacing: -0.02em`, gradient text fading white → grey.
- Subhead in ~60% opacity text, max ~560px wide for an easy line length.
- Screenshot framed with 1px translucent border + large soft shadow, cropped by the fold to invite scrolling.
- Restrained entrance motion: fade/translate-up 8–16px, staggered ~80ms.
- Tiny "announcement" pill above the headline linking to the latest release.

## Accessibility
Muted grey subhead on near-black needs checking for 4.5:1; gradient text must keep the
darkest stop above contrast threshold. Respect `prefers-reduced-motion` for entrance animations.

## Weaknesses
Relies on a beautiful product UI — with a less polished app it exposes you. Dark-only can feel
cold for consumer audiences.

> Base-pack entry written from knowledge of the site; re-capture with **ux-add** to attach real screenshots.
