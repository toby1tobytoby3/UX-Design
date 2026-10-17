---
title: Plan cards with monthly/yearly toggle and highlighted plan
pattern: pricing-table
page_type: pricing
tags: [saas, b2b, minimal, progressive-disclosure]
source_url: https://www.notion.com/pricing
source_site: notion.com
captured_at: 2026-10-17
captured_by: base-pack
input: base-pack
rating: 4
why_it_works: A billing toggle that shows the yearly saving nudges annual plans, and one visually highlighted plan gives undecided buyers a default; the full feature matrix is deferred below the cards.
use_when: Subscription products with 3–4 tiers and a monthly/annual choice.
has_example: false
needs_capture: true
---

## What it is
Row of 4 plan cards (Free → Enterprise) under a segmented Monthly/Yearly toggle with a
"save X%" label. The recommended plan has a coloured border and a badge. Each card: name,
price per seat, one-line audience description, CTA, then a short "Everything in X, plus" list.
A detailed comparison table follows further down.

## Key techniques
- Segmented control toggle; prices swap in place without layout shift (fixed-width price block).
- "Everything in Free, plus…" lists avoid repeating features across cards.
- Enterprise card uses "Contact sales" instead of a price.
- Sticky plan header row in the comparison table.

## Accessibility
Toggle should be a radio group (`role="radiogroup"`) and announce the price change
(`aria-live="polite"` on the price).

## Weaknesses
Per-seat pricing math can confuse; show an example total when possible.

> Base-pack entry written from knowledge of the site; re-capture with **ux-add** to attach real screenshots.
