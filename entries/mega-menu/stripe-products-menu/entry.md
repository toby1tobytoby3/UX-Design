---
title: Five-column products mega menu with a featured promo
pattern: mega-menu
page_type: landing
tags: [saas, b2b, progressive-disclosure]
source_url: https://stripe.com
source_site: stripe.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: A large product suite becomes navigable because products are grouped by job (Payments, Revenue, Money Management, Embedded Finance), each with a one-line description, plus routes for people who don't know what they need.
use_when: Sites with 8+ products that need to be reachable from the header.
has_example: false
---

## What it is
Hovering **Products** opens a full-width white panel under the nav with five columns: **Payments**, **Revenue**,
**Money Management**, **Embedded Finance** and **More**. Each item is a blue product name with a short grey
description (e.g. "Payment links · No-code payments", "Billing · Recurring revenue"). On the right sits a featured
card (Stripe Sessions, with an image and "Watch now →"). A footer row offers "Not sure where to start? · Get
recommendations · See all products".

## Key techniques
- **Grouped by job, not alphabetically**: the column headings are the buying intents.
- **Name + one-line description** for every item, so scanning works without knowing product names.
- **Escape hatches** for undecided visitors ("Get recommendations", "See all products").
- **One promotional slot** inside the menu, visually separate from navigation.
- Clean typographic hierarchy: no icons, so dozens of items still read calmly.

## Accessibility
Must also open on click or Enter with `aria-expanded`, close on Esc and return focus. On mobile the nav
collapses into a menu button (captured); keep the same groups as accordions.

## Weaknesses
It's a lot of choice in one panel; the promo competes slightly with navigation.

> Recaptured live on 2026-10-17 with `scripts/capture.mjs` (desktop + mobile, interactions where noted). The `preview.html` rebuild from the original base pack is kept as a code starting point; the screenshots are the reference.
