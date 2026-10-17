---
title: Segmented search bar (Where · When · Who) with focused pickers
pattern: search
page_type: landing
tags: [b2c, consumer-app, progressive-disclosure, responsive]
source_url: https://www.airbnb.com
source_site: airbnb.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: Splitting a complex query into labelled segments inside one pill makes a multi-field form feel like a single search, and each segment opens its own focused picker with smart suggestions.
use_when: Search with 2–4 structured parameters (place, dates, people, category).
has_example: false
---

## What it is
Under the category tabs (All, Homes, Experiences, Services), a rounded pill with **Where / When / Who** segments
and a round red search button. Clicking **Where** raises that segment and opens a dropdown of **suggested
destinations** with icons and reasons ("Nearby · Find what's around you", "Dallas, TX · For sights like Dallas
Arboretum"). Above it all, a dark banner promotes an "AI search" toggle. Captured with the Where panel open.

## Key techniques
- **Active segment lifts** (white, shadow) while the bar recedes.
- **Suggestions with a reason**, not just place names.
- **Search button grows to show its label** when a segment is active.
- A new **AI search toggle** sits above the classic structured search, offering both modes side by side.

## Accessibility
Each segment needs to be a labelled button; panels need focus management and Esc to close.

## Weaknesses
Complex to build well; overkill for single-field search.

> Recaptured live on 2026-10-17 with `scripts/capture.mjs` (desktop + mobile, interactions where noted). The `preview.html` rebuild from the original base pack is kept as a code starting point; the screenshots are the reference.
