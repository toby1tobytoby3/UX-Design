---
title: Gallery-to-detail navigation with React's ViewTransition
pattern: motion
page_type: app
tags: [dark, animated, minimal]
source_url: https://react-view-transitions-demo.labs.vercel.dev
source_site: react-view-transitions-demo.labs.vercel.dev
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: The official Next.js demo of React's ViewTransition component: clicking a photo carries it into the detail page while the header and controls stay put and the text blurs in, so a route change feels like one continuous object rather than a page swap.
use_when: Next.js App Router apps that move between a collection and an item (gallery → photo, list → record) and want shared-element continuity without an animation library.
has_example: false
---

## What it is
"Frames", a small photo gallery built by Vercel to show React's `<ViewTransition>` with the App Router. The grid page links to
`/photo/<id>`. Our frame captures show the grid, then the detail page with the title "Alpine Morning" still blurred mid-transition,
then the settled detail page.

## Key techniques
- **Named elements persist across routes:** computed `view-transition-name` values on the detail page include `site-header`,
  `gallery-back-link`, `gallery-nav-prev`, `gallery-nav-next` and `gallery-controls` (plus `root`). Naming the chrome stops it cross-fading, so only content moves.
- **Text enters with blur + fade** rather than a slide: it reads as "coming into focus", which suits a shared image arriving.
- React drives the transition from navigation (`startTransition`), so no hand-written `document.startViewTransition` calls are needed.
  Per `research/A5-A6-motion-states.md`, `<ViewTransition>` is stable as of React 19.3 and works in Next 16 without configuration; `<Link transitionTypes>` sets forward/back variants.

## Accessibility
View transitions should be turned off under `prefers-reduced-motion` with a CSS rule on the `::view-transition-*` pseudo-elements;
check the demo's CSS before reusing it. Focus moves with normal navigation, unaffected by the animation.

## Weaknesses
- Headless capture caught the text blur-in but not the image morph between frames; watch it in a real browser before copying timings.
- Same-document view transitions work in Chrome, Safari 18+ and Firefox 144+; cross-document ones don't work in Firefox yet (research file).
- Transitions are snapshot-based and can't be interrupted mid-flight the way springs can.

## Related entries
- `motion/scroll-driven-cover-to-header`: CSS-only scroll-linked motion
- `motion/numberflow-digit-roll`

> Captured live on 2026-10-17 with a Playwright script (gallery, click first photo, frames at ~60, ~140 and ~220 ms, settled).
> `view-transition-name` values read from computed styles.
