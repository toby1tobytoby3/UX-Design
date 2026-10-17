---
title: Grouped products mega menu with icons and one-line descriptions
pattern: mega-menu
page_type: landing
tags: [saas, b2b, animated, progressive-disclosure]
source_url: https://stripe.com
source_site: stripe.com
captured_at: 2026-10-17
captured_by: base-pack
input: base-pack
rating: 5
why_it_works: A large product suite becomes navigable because items are grouped by job-to-be-done, each with an icon and a short description, and the panel morphs smoothly between top-level menus instead of flashing.
use_when: Sites with 8+ products or solution areas that need to be navigable from the header.
has_example: false
needs_capture: true
---

## What it is
Hovering a top-nav item opens a white floating panel with a small caret, containing columns of
grouped links (e.g. Payments, Revenue, Banking-as-a-service). Each link: coloured icon, bold name,
one-line grey description. Moving between nav items animates the panel's size and position.

## Key techniques
- Single shared panel whose width/height transition between menus (~250ms) — no close/reopen flicker.
- Hover intent delay (~100–150ms) so diagonal mouse movements don't switch menus.
- Columns with small uppercase group headings; generous 16–24px padding.
- Panel has large soft shadow and 8–12px radius.

## Accessibility
Must also open on click/Enter with `aria-expanded`; Esc closes and returns focus. On mobile
collapse to an accordion inside a full-screen sheet.

## Weaknesses
Hover-only menus fail on touch; the morphing animation is complex to build well.

> Base-pack entry written from knowledge of the site; re-capture with **ux-add** to attach real screenshots.
