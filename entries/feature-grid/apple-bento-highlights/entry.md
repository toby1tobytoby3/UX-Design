---
title: Bento grid of product highlights
pattern: feature-grid
page_type: product
tags: [b2c, minimal, responsive, editorial]
source_url: https://www.apple.com
source_site: apple.com
captured_at: 2026-10-17
captured_by: base-pack
input: base-pack
rating: 5
why_it_works: Mixed tile sizes create hierarchy without headings — the biggest tile is the biggest claim — and each tile carries one stat or one idea, so the section is scannable in seconds.
use_when: Summarising 5–9 features or specs where a few deserve more weight than others.
has_example: false
needs_capture: true
---

## What it is
A CSS grid of rounded tiles of varying spans (2×2, 2×1, 1×1) on a light grey page. Each tile
has one big number or short claim, a one-line explanation, and sometimes an image or icon.

## Key techniques
- `grid-template-columns: repeat(4, 1fr)` with `grid-auto-flow: dense`; tiles span 1–2 columns/rows.
- Large radius (~24–28px), no borders, white or dark tiles on `#f5f5f7` background.
- Huge stat typography (48–80px, semibold) with small supporting text.
- Collapses to 2 columns on tablet and a single stack on mobile.

## Accessibility
Order the DOM by importance, not by visual position, since `dense` packing can reorder visually.

## Weaknesses
Easy to overdo — more than ~9 tiles turns into noise. Needs real imagery or strong stats to land.

> Base-pack entry written from knowledge of the site; re-capture with **ux-add** to attach real screenshots.
