---
title: Segmented search bar (Where · When · Who)
pattern: search
page_type: landing
tags: [b2c, consumer-app, progressive-disclosure, responsive]
source_url: https://www.airbnb.com
source_site: airbnb.com
captured_at: 2026-10-17
captured_by: base-pack
input: base-pack
rating: 5
why_it_works: Splitting one complex query into labelled segments inside a single pill makes a multi-field form feel like one simple search, and each segment opens its own focused picker.
use_when: Search with 2–4 structured parameters (location, dates, guests, category, budget).
has_example: false
needs_capture: true
---

## What it is
A large rounded pill containing segments separated by thin dividers. Each segment has a bold
small label and a grey placeholder ("Search destinations", "Add dates", "Add guests"). The search
button is a round accent-coloured icon at the end that expands to show "Search" when active.
Clicking a segment highlights it (white raised pill on a grey bar) and opens a dropdown panel
(map suggestions, calendar, guest steppers).

## Key techniques
- Active segment gets a raised white background while the rest of the bar greys out.
- Dividers hide next to the active/hovered segment for a cleaner look.
- On scroll it collapses to a compact one-line summary pill; on mobile it becomes a full-screen stepped flow.

## Accessibility
Each segment is a button with a visible label; panels need focus management and Esc to close.
Calendar must be keyboard navigable.

## Weaknesses
Complex to implement well; overkill for single-field search.

> Base-pack entry written from knowledge of the site; re-capture with **ux-add** to attach real screenshots.
