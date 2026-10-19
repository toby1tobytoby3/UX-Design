---
title: Facet chips with live counts in one scrolling row, filters in the URL, and Free/Premium badges on every card
pattern: filters
page_type: search-results
tags: [dark, minimal, saas, progressive-disclosure, accessible]
source_url: https://www.getlayers.ai/templates
source_site: getlayers.ai
captured_at: 2026-10-19
captured_by: toby
input: url
rating: 4
why_it_works: Two facets (Tone, Industry) sit in one labelled chip row with a count on every chip, so people see how much each choice leaves before they click, and the chosen filter lands in the URL so the view can be shared.
use_when: Browsing a catalogue of a few dozen to a few hundred items with two or three facets, especially a gallery like our own.
has_example: false
---

## What it is
GetLayers' template library (a paid template shop; used here only as a UX reference). Under the page title:
- **Type tabs**: Templates · 3D Scenes · Sections · Backgrounds · Gradients · ♡ Favourites, with a **Pricing: All ▾** dropdown on the right.
- **One chip row**, labelled by facet: **TONE** Dark 34 · Light 21 │ **INDUSTRY** AI/Tech 12 · Agency/Studio 19 · SaaS 7 · Portfolio 10 · Fintech 5 · Health/Science 4 · E-commerce 9 · …, scrolling sideways.
- Cards carry a **Premium 🔒** or **Free** badge and an industry label; a "Try for free" row sits above the full grid.

## Key techniques
- **Counts on every chip**, and they hold: choosing SaaS (7) left exactly 7 cards (from 55).
- **Filter state in the URL** (`?f=template-industry.saas`), so a filtered view can be linked.
- **Facet labels inside the row** (TONE │ INDUSTRY) instead of separate dropdowns: one row, two facets, no hidden options.
- **Paywall labelled on the card**, not discovered after a click.
- The selected chip fills and keeps its count badge, so the current filter is obvious.

## Accessibility
Measured: chips are `<button aria-pressed>` (true toggle buttons); type tabs are links with `role="tab"` and `aria-selected`
(tabs that navigate are better as links with `aria-current`). The chip row scrolls sideways with no visible scroll cue on desktop.

## Weaknesses
- **Cards show one industry**, so under "SaaS" some cards read "Fintech" or "AI / Tech" (items have several industries). Show
  the matching tag, or all tags, when a filter is on.
- A newsletter card is mixed into the results grid, which breaks the count you just chose.
- Light grey count text on dark chips is low contrast.

## Related entries
- `filters/unsection-category-tabs-style-chips` (same job, style behind a dropdown instead of chips)
- `content-grid/unsection-captioned-thumbnail-grid`

> Captured live on 19 Oct 2026 with Playwright (screenshots plus keyboard probes). Supplied as an Instagram reel screenshot; the live site replaced it.
