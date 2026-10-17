---
title: Two-axis browse with category tabs and style chips
pattern: filters
page_type: search-results
tags: [dark, minimal, saas, progressive-disclosure]
source_url: https://www.unsection.com
source_site: unsection.com
captured_at: 2026-10-17
captured_by: toby
input: screenshot
rating: 4
why_it_works: Browsing splits into two independent axes, what the section is (category tabs) and how it looks (style chips), so you can ask for something like "dark bento feature sections" in two clicks without a search box.
use_when: Any gallery or catalogue where items have one primary type plus several visual or attribute traits, including our own UX library gallery.
has_example: false
needs_capture: true
---

## What it is
Unsection is a curated library of 1,500+ individual website sections (not full pages), plus hover
effects and an SVG library. The browse screen is dark and stacks three bands:

1. **Top nav:** wordmark, then `Sections · Community · Hover Effects · SVG`; on the right `Deals`,
   `More ▾`, a yellow **Submit** pill and the avatar.
2. **Category tab row:** pill tabs for section types, which scroll sideways: `Feature Section Design`,
   `Hero Section Design`, `CTA Section Design`, `Footer…`, `Testimonial…`, `Blog…`, `Logo…`,
   `Pricing…`, `Navbar…`, `FAQ…`, `Team…`.
3. **Style chip row:** compact text chips for visual traits, with a `RESET` at the far right:
   `UI Mockup, Flat Color, Light, Text Heavy, Table View, Video, Black & White, Card, Bento,
   Visible Border, Image, Vector, Minimal, Colorful, Dark, Large Type, 3D, Uncommon, Gradient, Pastel`.

Below the chips sits the results grid; see the related entries for the grid and the nav.

## Key techniques
- **Two orthogonal filter rows:** categories are mutually exclusive tabs, while style chips stack as AND filters. One `RESET` clears the chips.
- **Different visual weights per axis:** the category tabs are bordered pills (primary choice) and the style chips are plain small text (secondary refinement), so the hierarchy of the two filters reads instantly.
- **Paid tier gates depth, not the first look:** the free tier gives homepage inspiration, and Pro (about $3/month billed yearly, or $99 lifetime) unlocks the full section library and categories.

## Accessibility
The chip labels are very small, low-contrast grey on near-black, which likely fails 4.5:1. The active
state of tabs and chips needs more than a subtle colour change (use fill plus `aria-pressed`). The tab row
scrolls sideways, so it needs visible overflow cues and keyboard reachability.

## Weaknesses
Twenty-odd style chips in one undifferentiated row is a lot to scan. Grouping them (colour · layout ·
media) would help. Thumbnails are small, so the detail of a section only shows on click.

## Related entries
- `content-grid/unsection-captioned-thumbnail-grid`: the results grid below these filters.
- `navigation/unsection-dark-nav-submit-pill`: the top nav.

## Relevance to us
This is a direct model for our gallery, `gallery/index.html`. Our `pattern` corresponds to their category tabs and our
`tags` to their style chips. Worth adopting: a tab row for patterns instead of a dropdown, and
`<pattern> · <site>` captions on cards.

> Captured from a phone screenshot of an Instagram reel (ferdie.dev) showing the desktop site, so
> image quality is low. Site details come from that screenshot plus public search results; the
> site itself couldn't be fetched from this session. Re-capture locally with `npm run capture -- https://www.unsection.com <dir>` for a sharp screenshot and code.
