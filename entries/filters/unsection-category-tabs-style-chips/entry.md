---
title: Category rail plus source tabs and style dropdown with counts
pattern: filters
page_type: search-results
tags: [dark, minimal, saas, progressive-disclosure]
source_url: https://www.unsection.com
source_site: unsection.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: Browsing splits into independent axes: what the section is (a big category rail), where it comes from (Website / Community tabs with counts) and how it looks (a Style dropdown listing every style with its count), so people can narrow 5,000+ items in a couple of clicks.
use_when: Large galleries or catalogues where items have one primary type plus several visual or attribute traits, including our own gallery.
has_example: false
---

## What it is
Unsection's homepage on a black canvas. On the left, a **large-type category rail** (Hero, Testimonials, Feature,
CTA, Footer, Blog, Navbar, Pricing, Logo, FAQs, Team, Contact…). Above the results, a filter bar: segmented tabs
**Website 5,228 / Community 90**, then **Style** and **Type** dropdowns and **Sort: Latest**. Opening Style
shows each style with how many items it has (3D 314, Bento 320, Black & White 534, Card 1,446, Colorful 468…).

## Key techniques
- **Counts everywhere**: tabs and style options show result counts, so you know before you click whether a filter is worth it.
- **Category as navigation, style as a filter**: the rail is big and permanent, while style lives in a dropdown and stays out of the way.
- **Source tabs** separate curated website sections from community submissions.
- **Sort as a separate control** ("Latest") instead of mixing it with filters.

## Accessibility
Dropdowns need proper listbox semantics and keyboard support. The grey rail text on black is borderline for contrast.

## Weaknesses
Style options are hidden until opened, so visual browsing by style is less discoverable than the old chip row.

## Related entries
- `content-grid/unsection-captioned-thumbnail-grid` (the results)
- `navigation/unsection-dark-nav-submit-pill` (the top bar)

> Recaptured live on 2026-10-17 (desktop, mobile, Style dropdown opened). Unsection was redesigned after the Instagram reel this entry was first built from, so the description now follows the live site; the reel crop has been replaced.
