---
title: React Spring
kind: source
pattern: motion
page_type: app
tags: [animated, open-source, react, springs]
source_url: https://www.react-spring.dev
source_site: react-spring.dev
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 10.1.2
licence: MIT
s_look: 3
s_interact: 4
s_coverage: 3
s_a11y: 3
s_perf: 2
s_react: 4
s_bundle: 3
s_licence: 4
why_it_works: Physics-first animation for React, where every value is a spring (`useSpring`, `useTransition`, `useTrail`), so motion stays continuous when targets change.
use_when: Physics-driven values in an existing React Spring codebase, or data visualisations interpolating many values with springs.
avoid_when: New app work (Motion covers more with better performance), shared-element or layout animation (no FLIP primitive), or many simultaneous animations.
alternatives: [motion, native-css]
has_example: false
---

## Verdict
**Capable, but Motion does more for less work.** All four tasks passed, but the shared element had to be hand-written (FLIP
with `useSpring`), every animation ran as per-frame JavaScript, and it had the **highest main-thread cost** in the bench.

## Benchmark (same four tasks as every other library)
4/4 tasks passed, one hand-rolled. **20.6 KB gz** (React and the shared shell subtracted). Code: `benchmotion/libs/react-spring.jsx`.

| Task | Result |
|---|---|
| Shared element | **No layout primitive**: we measured before/after and sprang the inverse transform (20 lines). Animated, ~680 ms |
| Enter and exit (`useTransition`) | Enter, exit and siblings closing the gap all animated (height spring) |
| Interrupted drawer (default spring 170/26) | No jump; no overshoot; settled 652 ms after start |
| Scroll-linked (`useScroll` + `useInView`) | Bar at 0.50, reveal fired; JavaScript scroll listener |
| 60 boxes at 4× CPU throttle | **150 ms script** (median of 5), about 3× GSAP and 2.6× native CSS |
| Reduced motion | Honoured with `useReducedMotion()` + `Globals.assign({ skipAnimation })`; this removes all motion and is off by default |

Found in the benchmark:
- The default spring is smooth (no overshoot) but slow for UI: **683 ms** to open a 300 px drawer. Set `config={{ tension: 300, friction: 30 }}` or similar.
- Combining several animated values into one `transform` needs the `to([a, b, c], fn)` helper; using `.get()` inside an interpolation silently stops updating.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Smooth, no overshoot, but ~680 ms is sluggish for interface chrome |
| Interactivity | 4 | Springs retarget with velocity (docs); gestures through the separate `@use-gesture` package |
| Coverage | 3 | Presence, trails, scroll; no layout/shared-element primitive |
| Accessibility | 3 | `useReducedMotion` + global skip; opt-in and all-or-nothing |
| Performance | 2 | Everything per-frame JavaScript; highest script time in the bench |
| React/Next fit | 4 | Hooks API, typed; interpolation syntax is clumsier than Motion's |
| Bundle size | 3 | 20.6 KB gz |
| Licence & health | 4 | MIT; v10.1.2 released 1 Oct 2026, v11 in beta; smaller community than Motion |
