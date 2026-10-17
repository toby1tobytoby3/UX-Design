---
title: Dark utility nav with a single bright Submit pill
pattern: navigation
page_type: search-results
tags: [dark, minimal, saas]
source_url: https://www.unsection.com
source_site: unsection.com
captured_at: 2026-10-17
captured_by: toby
input: screenshot
rating: 3
why_it_works: All navigation is quiet small-caps grey text except one high-contrast yellow pill, so the community action (submit a design) is impossible to miss without competing with the content below.
use_when: Content-heavy products (galleries, directories, marketplaces) with one contribution or conversion action to promote.
has_example: false
needs_capture: true
---

## What it is
A thin near-black top bar. On the left: the `UNSECTION` wordmark, then small uppercase links
`Sections · Community · Hover Effects · SVG`, with the active one underlined. On the right: `Deals`
(tinted red), `More ▾`, a solid yellow **Submit** pill and the avatar. The category tab row sits
directly underneath (see `filters/unsection-category-tabs-style-chips`).

## Key techniques
- **Uppercase micro-labels** (~10–11px, letter-spaced) keep the bar short so more of the grid shows above the fold.
- **One saturated accent:** the yellow Submit pill is the only bright element in the chrome.
- **Secondary promo in colour, not shape:** `Deals` uses a tinted text colour instead of a second button, so it doesn't compete with Submit.
- **Overflow into `More ▾`** keeps the bar to four primary links.

## Accessibility
Tiny uppercase grey text on black is hard to read and probably fails contrast. The active-state
underline needs `aria-current="page"`. Yellow with dark text on the pill is fine.

## Weaknesses
The labels are too small for comfortable reading, and `More ▾` hides items people may look for.

> Cropped from a phone screenshot of an Instagram reel, so the image is low resolution and the labels were read from a blurry image. Re-capture to confirm.
