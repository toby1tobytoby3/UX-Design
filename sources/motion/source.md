---
title: Motion (Motion for React)
kind: source
pattern: motion
page_type: app
tags: [animated, open-source, react, springs, layout-animation]
source_url: https://motion.dev
source_site: motion.dev
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 14.3.0
licence: MIT
s_look: 3
s_interact: 5
s_coverage: 5
s_a11y: 4
s_perf: 4
s_react: 5
s_bundle: 2
s_licence: 5
why_it_works: The most complete React animation library, with springs that keep velocity when interrupted, `layout` (FLIP) for size and position changes, `AnimatePresence` for exits, gestures and drag, and transforms and opacity handed to the browser's animation engine where it can.
use_when: App motion that CSS can't do well, such as interruptible springs, drag and gestures, list reorder and exit animations, `layoutId` tab underlines, or orchestrated sequences.
avoid_when: The motion is a hover, a popover fade or a route change (CSS transitions and React's `<ViewTransition>` do it with no JavaScript), or a marketing page needs a lighter bundle.
alternatives: [native-css, react-spring, gsap]
has_example: false
---

## Verdict
**The pick when an app needs real motion, not just transitions.** It passed all four bench tasks with its built-in features
and ran presence and drawer animations through the browser's animation engine (WAAPI). It is also the only library tested
whose springs are documented to keep velocity when retargeted. Two defaults must change: the default spring
**overshoots by 12%**, and **reduced motion is off by default**.

## Benchmark (same four tasks as every other library)
4/4 tasks passed with built-in features. **49.5 KB gz** for the library with `motion.*`, `AnimatePresence`, `layout` and `useScroll`
(React and the shared shell subtracted). Code: `benchmotion/libs/motion.jsx`. Trajectories: `guides/img/motion-curves.png`.

| Task | Result |
|---|---|
| Shared element (`layout`) | Animated open and close, ~440 ms, measured and applied per frame in JavaScript (layout projection) |
| Enter and exit (`AnimatePresence` + `layout`) | Enter, exit and siblings closing the gap all animated, via WAAPI |
| Interrupted drawer (default spring) | No jump on reversal; settled 548 ms after start, swinging 25 px past the start point on the way back |
| Scroll-linked (`useScroll` + `whileInView`) | Bar at 0.50 at half scroll, reveal fired; driven by a JavaScript scroll listener in this setup, not a scroll timeline |
| 60 boxes at 4× CPU throttle | 81 ms script (median of 5); native CSS took 57 ms, GSAP 47 ms, React Spring 150 ms |
| Reduced motion | Honoured with `<MotionConfig reducedMotion="user">` (drops transforms, keeps opacity). **Default is `"never"`** |

Found in the benchmark:
- **The default spring is bouncy for UI.** An `x` move of 300 px overshot by 35 px (12%) and took 517 ms to settle. Set an app default:
  `<MotionConfig transition={{ type: 'spring', visualDuration: 0.25, bounce: 0 }}>`.
- **Lazy loading roughly halves the first load.** `LazyMotion` with async `domAnimation` features: **~10 KB gz** initial plus a
  **32 KB** chunk loaded afterwards (measured; the docs say "as low as 5 KB"). Loading the features synchronously saves nothing (~42 KB).
- Scroll animations through `useScroll` motion values ran on a JavaScript listener. Motion's docs describe hardware-accelerated scroll for
  some cases; for a progress bar, a CSS `animation-timeline` does it off the main thread with no library.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Default tween is fine; the default `x`/`y` spring (500/25) overshoots 12%, too bouncy for UI chrome |
| Interactivity | 5 | Springs keep velocity when interrupted (docs), drag, gestures, `whileHover`/`whileTap` |
| Coverage | 5 | Layout and shared element (`layoutId`), presence, scroll, SVG paths, sequences |
| Accessibility | 4 | Built-in `reducedMotion="user"` that reduces rather than removes; off by default |
| Performance | 4 | WAAPI for transforms and opacity; layout projection is per-frame JavaScript |
| React/Next fit | 5 | `motion/react`, typed, works in client components; the de facto React standard |
| Bundle size | 2 | 49.5 KB gz as used; ~10 KB initial with `LazyMotion` + async features |
| Licence & health | 5 | MIT, released 15 Oct 2026. Some extras (`AnimateNumber`, premium examples) are in the paid Motion+ tier |
