---
title: anime.js
kind: source
pattern: motion
page_type: app
tags: [animated, open-source, timelines]
source_url: https://animejs.com
source_site: animejs.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 4.5.0
licence: MIT
s_look: 2
s_interact: 4
s_coverage: 4
s_a11y: 2
s_perf: 4
s_react: 2
s_bundle: 3
s_licence: 4
why_it_works: A small MIT animation engine with timelines, stagger, springs, layout animation (`createLayout`), scroll observers, SVG and text helpers, and an optional WAAPI mode.
use_when: Framework-agnostic or vanilla pages that want GSAP-style timelines under MIT, or small interactive pieces outside React.
avoid_when: React app UI (no bindings, exits hand-rolled, no reduced-motion support), or anywhere default timings will ship untuned.
alternatives: [gsap, motion]
has_example: false
---

## Verdict
**A capable MIT alternative to GSAP, but not a React tool.** All four tasks passed, but exits and React wiring were hand-written,
there is no reduced-motion support, and its default timing (1 s) is far too slow for UI.

## Benchmark (same four tasks as every other library)
4/4 tasks passed, one partly hand-rolled. **26.5 KB gz** (React and shell subtracted). Code: `benchmotion/libs/anime.jsx`.

| Task | Result |
|---|---|
| Shared element (`createLayout`: record → update → animate) | Animated open and close, ~400 ms |
| Enter and exit | Enter animated; **exit hand-rolled** (items kept until their animation completes), `createLayout` for siblings |
| Interrupted drawer (default `animate`) | No jump; but the default **1,000 ms** duration meant settling took 1,215 ms |
| Scroll-linked (`onScroll`, `sync`) | Bar at 0.50, reveal fired; JavaScript scroll listener |
| 60 boxes at 4× CPU throttle | 65 ms script (median of 5) |
| Reduced motion | **No built-in support**: we checked `matchMedia` ourselves and set durations to 0 |

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 2 | 1 s default duration: every UI animation needs tuning |
| Interactivity | 4 | Draggable, springs, animatable values that retarget |
| Coverage | 4 | Layout, scroll, SVG, text, timelines; no presence |
| Accessibility | 2 | Nothing built in for reduced motion |
| Performance | 4 | Low script time; per-frame JavaScript by default, WAAPI mode available |
| React/Next fit | 2 | No React bindings: refs, effects and manual cleanup |
| Bundle size | 3 | 26.5 KB gz |
| Licence & health | 4 | MIT, v4.5.0 released Aug 2026; essentially a one-maintainer project |
