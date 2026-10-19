---
title: Quick-look panel over a component gallery, with details and code on the left and a live preview on the right
pattern: modal
page_type: docs
tags: [minimal, devtools, open-source, progressive-disclosure, interactive]
source_url: https://ui.watermelon.sh/animated-components/category/dialog
source_site: ui.watermelon.sh
captured_at: 2026-10-19
captured_by: toby
input: url
rating: 4
why_it_works: Clicking a card opens everything needed to judge and take the component (description, dependencies, install command, code) next to a live, replayable preview, without leaving the gallery or losing your place in it.
use_when: A gallery of things people preview and then take (components, templates, references), including our own gallery's detail view.
has_example: false
---

## What it is
Watermelon UI's animated-component gallery (MIT). The category page is a grid of live cards (`crop-grid.jpg`). Pressing a card
opens a large panel over the grid (`desktop.jpg`):
- **Left**: breadcrumb and title ("Components / Dialog · Edit Profile"), "81 · Full page ↗", a one-line description,
  **Dependencies** (motion/react, tailwindcss), "Inspired by", **Copy for AI** (v0, Bolt, Lovable…), **Installation** with
  CLI/Manual and npm/pnpm/yarn/bun tabs and a copy button, then the demo code.
- **Right**: the live preview with **Preview / Code**, **Original / Custom theme**, a dark-mode toggle, **replay** and ✕.

## Key techniques
- **Preview and "how to take it" side by side**: no tab-switching between a demo page and an install page.
- **Replay button** for one-shot animations, so people can watch the motion again.
- **Theme toggles on the preview only**, to see the component in light and dark without changing the site.
- **Dependencies listed before the code**, so the cost is visible first.
- "Full page ↗" for people who want a shareable URL.

## Accessibility
Measured: the panel is `role="dialog"` named "Edit Profile" and the close button is labelled; Escape closes it. But **focus
stays on the card behind the panel** (it doesn't move in, and there's no `aria-modal`), so keyboard and screen-reader users
have to find their way into it. This component's source has no reduced-motion handling, and only 2 of the kit's 131 animated
components check for it.

## Weaknesses
- Move focus to the panel title on open and back to the card on close.
- The panel doesn't change the URL, so a specific component can't be linked without "Full page".

## Related entries
- `filters/getlayers-faceted-chips-counts-url` (the browsing side of a gallery)

> Captured live on 19 Oct 2026 with Playwright (screenshots plus keyboard probes). Supplied as an Instagram reel screenshot; the live site replaced it.
