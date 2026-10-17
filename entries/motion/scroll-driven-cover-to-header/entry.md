---
title: Full-height cover that shrinks into a fixed header, in CSS only
pattern: motion
page_type: landing
tags: [animated, sticky, editorial, open-source]
source_url: https://scroll-driven-animations.style/demos/cover-to-fixed-header/css/
source_site: scroll-driven-animations.style
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: A cover image with a big title shrinks, darkens and settles into a slim fixed header as you scroll, driven by the scroll position itself (CSS animation-timeline), so it tracks the finger exactly and runs off the main thread with no JavaScript.
use_when: Article, case-study or profile pages with a hero image that should give way to a compact header; any reading-progress or reveal effect tied to scroll.
has_example: false
---

## What it is
One of Bramus Van Damme's demos on scroll-driven-animations.style. At scroll 0 a full-viewport photo with a large title fills the
screen. As you scroll (frames at 0, 8, 20 and 60% of the page), the cover shortens, a blue tint increases, the title shrinks and
re-centres, and it ends as a slim fixed header bar (about 90px tall) over the article text.

## Key techniques
- **`animation-timeline: scroll()`**: in the live page, `document.getAnimations()` returned one `CSSAnimation` with a **ScrollTimeline**,
  `linear` easing and `duration: auto`. The animation's progress *is* the scroll position, so there's no lag or easing to fight.
- One keyframe set animates height, tint and font size together; `animation-range` limits it to the first part of the scroll.
- The same site has a "JS version" of each demo using WAAPI with `ScrollTimeline`, which is the fallback route for libraries.

## Accessibility
Scroll-linked motion follows the user's own input, which is gentler than autoplaying motion, but large size changes can
still bother vestibular-sensitive users: wrap it in `@media (prefers-reduced-motion: no-preference)` and keep a plain fixed header otherwise.

## Weaknesses
- Scroll-driven animations are in Chromium (115+) and Safari 26 only, not Firefox (research file), so it must be an enhancement over a static layout.
- A demo, not a product: the type and tint are illustrative.
- Animating `height` triggers layout each frame; for heavy pages, animate transform/scale on an inner element instead.

## Related entries
- `motion/nextjs-viewtransition-photo-gallery`: navigation transitions
- `3d/apple-airpods-scroll-story`: the same idea done with scroll-scrubbed media

> Captured live on 2026-10-17 with a Playwright script scrolling to 0/8/20/60% of the page; animation timeline type read from
> `document.getAnimations()`.
