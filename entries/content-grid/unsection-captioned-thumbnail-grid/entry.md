---
title: Featured preview over a captioned thumbnail grid
pattern: content-grid
page_type: search-results
tags: [dark, minimal, saas, responsive]
source_url: https://www.unsection.com
source_site: unsection.com
captured_at: 2026-10-17
captured_by: toby
input: screenshot
rating: 4
why_it_works: Every thumbnail is a uniform crop of one section with a "Category · Title" caption, so a dense grid of very different designs stays scannable, and the caption doubles as searchable, linkable metadata.
use_when: Galleries, template libraries, portfolios or any collection of visual items users browse and compare.
has_example: false
needs_capture: true
---

## What it is
The results area of Unsection's browse screen. A large featured preview sits at the top (a big hero
screenshot with a small caption, `Hero · Bunsen Studio Home Page Section Hero`). Below it is a 4-column
grid of fixed-ratio thumbnails on near-black. Under each thumbnail is a single caption line:
a muted category prefix, then a brighter descriptive title, e.g. `Feature · The Grid Cost Benefit Process
Overview Design`, `Footer · The Grid Marketing Call Footer Navigation Design`.

## Key techniques
- **Uniform crops:** every thumbnail shows one section at the same aspect ratio, never a full page. That keeps rows aligned and comparisons fair.
- **Two-tone caption:** a dim category prefix plus a bright title. The prefix says what kind of thing it is at a glance, and the title names it.
- **Descriptive titles carry search terms:** "<Site> <what it does> <section type> Design" reads like keywords, which helps both SEO and in-app search.
- **No card chrome:** no borders, backgrounds or shadows around cards. The screenshots themselves are the cards, with tight gaps (~16px) and captions directly beneath.
- **Native ad slot:** a sponsored item uses the same card and caption format with an `Ad` prefix. It's clearly labelled and doesn't break the grid rhythm.
- **The content provides the colour:** the near-black page lets light and dark screenshots sit side by side without either dominating.

## Accessibility
Captions are small grey-on-black text, which is probably below 4.5:1 for the prefix. Each card should be
one link with the full caption as its accessible name, and thumbnails need `alt` text or `alt=""` with the
caption as the label.

## Weaknesses
At 4 columns the thumbnails are too small to judge detail, so the user has to click in. A hover zoom or
quick-look would help. The featured preview takes a lot of space before the first result.

## Relevance to us
Our gallery cards could adopt the `pattern · site` two-tone caption and drop the card borders.

> Cropped from a phone screenshot of an Instagram reel (ferdie.dev) showing the desktop site, so the
> image is low resolution. Re-capture with `npm run capture -- https://www.unsection.com <dir> --selector "<grid css>"`
> for a sharp image and the grid's code.
