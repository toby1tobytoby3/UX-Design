---
title: CSS + View Transitions (the platform)
kind: source
featured: motion/scroll-driven-cover-to-header
pattern: motion
page_type: app
tags: [animated, open-source, native, view-transitions, scroll-driven]
source_url: https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API
source_site: developer.mozilla.org
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: React 19.3.1 + Chromium (Playwright)
licence: Web platform (no library)
s_look: 3
s_interact: 2
s_coverage: 4
s_a11y: 3
s_perf: 5
s_react: 5
s_bundle: 5
s_licence: 5
why_it_works: CSS transitions, `@starting-style`, CSS scroll-driven animations and View Transitions (through React 19.3's stable `<ViewTransition>`) cover most app motion with no animation library, and they run on the compositor.
use_when: The default for app motion, such as hover, press, popover and dialog enter/exit, route and shared-element transitions in Next, scroll progress bars and condensing headers.
avoid_when: Motion must follow a gesture or be retargeted mid-flight with momentum (drag, swipe, interruptible layout), or must look identical in Firefox today (no scroll-driven animations; no cross-document View Transitions).
alternatives: [motion, auto-animate]
has_example: false
---

## Verdict
**Start here.** All four bench tasks passed with no animation library: React's `<ViewTransition>` for the shared element and for
enter and exit, a CSS transition for the drawer, and `animation-timeline` for scroll. It had the lowest bundle and the only
scroll animation that ran off the main thread. Reach for Motion when you need springs, gestures or interruptible layout.

## Benchmark (same four tasks as every other library)
4/4 tasks passed. **~1 KB** of our own code (React 19.3.1 subtracted, which includes `<ViewTransition>`). Code: `benchmotion/libs/native.jsx`.

| Task | Result |
|---|---|
| Shared element (`<ViewTransition name>` + `startTransition`) | Animated open and close as View Transition snapshots, ~300 ms |
| Enter and exit (`<ViewTransition>` per item) | Enter, exit and siblings gliding all animated (default cross-fade plus group move) |
| Interrupted drawer (CSS `transition`, 300 ms, our ease-out curve) | No jump: the transition retargets from the current position; settled 216 ms after start |
| Scroll-linked (`scroll-timeline` + `view()`) | Bar at 0.50, reveal fired; **runs on a scroll timeline (compositor)**, the only one tested that did |
| 60 boxes at 4× CPU throttle | 57 ms script (median of 5): React's own render cost, the animations run as CSS transitions |
| Reduced motion | Honoured with our `@media (prefers-reduced-motion)` rules; nothing happens automatically |

Found in the benchmark:
- **View Transitions can't be retargeted.** Starting a new one skips the running one, and the page is a snapshot while it runs (docs).
  Use them for navigation and one-shot changes, not for anything the user can interrupt mid-flight.
- CSS has no default timing: we chose 300 ms and `cubic-bezier(0.22, 1, 0.36, 1)`. Put durations and easings in tokens (`guides/motion.md`).
- Reduced motion for View Transitions needs explicit CSS for `::view-transition-group(*)`, `-old(*)` and `-new(*)`.

## Browser support (MDN browser-compat-data, via `research/A5-A6-motion-states.md`)
| Feature | Support |
|---|---|
| Same-document View Transitions | Chrome 111, Safari 18, Firefox 144 (Baseline) |
| Cross-document (`@view-transition`) | Chrome 126, Safari 18.2; **not Firefox** |
| Scroll-driven animations | Chrome 115, Safari 26; **Firefox behind a flag**: wrap in `@supports (animation-timeline: view())` |
| `@starting-style`, `transition-behavior` | Chrome 117, Firefox 129, Safari 17.4–17.5 (Baseline) |
| `interpolate-size` (animate to `height: auto`) | **Chrome only** |

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | View Transitions default to a tidy 250 ms cross-fade; everything else needs your own durations and curves |
| Interactivity | 2 | Transitions retarget position but not velocity; no gestures; View Transitions can't be interrupted |
| Coverage | 4 | Shared element, presence, scroll-driven, enter/exit; no springs with momentum, browser gaps |
| Accessibility | 3 | Easy with Tailwind's `motion-safe:`/`motion-reduce:`, but never automatic |
| Performance | 5 | Compositor transitions and scroll timelines; no per-frame JavaScript |
| React/Next fit | 5 | `<ViewTransition>` stable in React 19.3; Next 16 App Router supports it with no config; CSS works in Server Components |
| Bundle size | 5 | ~1 KB |
| Licence & health | 5 | Web standards |
