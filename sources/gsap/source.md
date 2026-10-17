---
title: GSAP
kind: source
pattern: motion
page_type: landing
tags: [animated, scroll-scene, timelines, free-licence]
source_url: https://gsap.com
source_site: gsap.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 3.15.0
licence: GSAP Standard "no charge" licence (free, not OSI open source)
s_look: 4
s_interact: 4
s_coverage: 5
s_a11y: 3
s_perf: 4
s_react: 3
s_bundle: 1
s_licence: 3
why_it_works: The most capable timeline engine on the web. Flip, ScrollTrigger, SVG morphing, text splitting and Draggable are all free since 3.13, with precise sequencing and cross-browser scroll choreography.
use_when: Marketing and storytelling pages, where sequenced timelines, pinned scroll scenes and SVG/text effects must behave the same in every browser.
avoid_when: Everyday app UI in React (exit animations are hand-rolled and it is the heaviest library here), or any product that is itself a no-code visual animation builder (licence restriction).
alternatives: [motion, animejs, native-css]
has_example: false
---

## Verdict
**The specialist for storytelling, not the default for app UI.** All four tasks passed and it had the lowest main-thread
cost, but exits in React must be hand-built, it is the heaviest bundle with Flip and ScrollTrigger, and its licence is free but **not
open source**: the GSAP Standard licence (from Webflow) bans use in no-code visual animation builders that compete with Webflow.
That's fine for our product but must be stated.

## Benchmark (same four tasks as every other library)
4/4 tasks passed, one partly hand-rolled. **54.6 KB gz** with `Flip`, `ScrollTrigger` and `@gsap/react` (React and shell subtracted).
Code: `benchmotion/libs/gsap.jsx`.

| Task | Result |
|---|---|
| Shared element (Flip plugin) | Animated open and close, ~470 ms |
| Enter and exit | Enter via `gsap.from`; **exit hand-rolled**: removed items stay rendered until their tween ends, then Flip moves the siblings |
| Interrupted drawer (`overwrite: 'auto'`) | No jump: the new tween starts from the current position; settled 651 ms after start, no overshoot |
| Scroll-linked (ScrollTrigger, `scrub`) | Bar at 0.50, reveal fired; JavaScript scroll listener |
| 60 boxes at 4× CPU throttle | **47 ms script** (median of 5), the lowest measured |
| Reduced motion | Honoured with `gsap.matchMedia()` (we sped the global timeline up); opt-in |

Found in the benchmark:
- Default tween: 500 ms, `power1.out`, a sensible starting point. A retargeted tween restarts its easing curve, so it doesn't
  keep momentum the way a spring does.
- `useGSAP` handles cleanup well, but the API stays imperative: selectors and refs, not declarative props.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | 500 ms `power1.out` looks considered with no tuning |
| Interactivity | 4 | Draggable and Inertia plugins (free); tweens retarget without velocity |
| Coverage | 5 | Flip, ScrollTrigger, MorphSVG, SplitText, timelines: the widest set |
| Accessibility | 3 | `gsap.matchMedia()` makes reduced motion straightforward but manual |
| Performance | 4 | Lowest script time, though everything is per-frame JavaScript (no compositor hand-off) |
| React/Next fit | 3 | `useGSAP` hook; imperative; no presence for exits |
| Bundle size | 1 | 54.6 KB gz with the two plugins used here |
| Licence & health | 3 | Free under a proprietary licence with a field-of-use restriction (not OSI); actively released (3.15.0, Apr 2026) |
