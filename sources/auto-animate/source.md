---
title: AutoAnimate
kind: source
pattern: motion
page_type: app
tags: [animated, open-source, react, lists]
source_url: https://auto-animate.formkit.com
source_site: auto-animate.formkit.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 0.10.0
licence: MIT
s_look: 4
s_interact: 1
s_coverage: 1
s_a11y: 5
s_perf: 4
s_react: 5
s_bundle: 5
s_licence: 3
why_it_works: One hook on a parent animates its children being added, removed or reordered, with sensible 250 ms defaults, WAAPI under the hood and reduced motion honoured by default.
use_when: Lists, tables and stacks whose items come and go (notifications, filters, kanban columns) and you want motion with one line of code.
avoid_when: Anything except child add, remove and move: in-place size changes, drawers, springs, scroll or gestures.
alternatives: [motion, native-css]
has_example: false
---

## Verdict
**The best value for list motion and nothing else.** One hook gave enter, exit and sibling movement, with reduced motion on by
default, in 3.4 KB. It does nothing else: in-place layout changes didn't animate, and it can't tween or spring.

## Benchmark (same four tasks as every other library)
1/4 tasks passed (enter and exit). **3.4 KB gz.** Code: `benchmotion/libs/auto-animate.jsx` (21 lines, the shortest).

| Task | Result |
|---|---|
| Shared element | **Not animated.** It watches children being added, removed or moved; a card growing in place isn't one of those |
| Enter and exit (`useAutoAnimate`) | Enter, exit and siblings gliding all animated, via WAAPI |
| Interrupted drawer, scroll-linked | Out of scope: not a tween, spring or scroll library |
| Reduced motion | **Honoured by default** (opt out with `disrespectUserMotionPreference`) |

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | 250 ms defaults look right for list changes |
| Interactivity | 1 | No interruption control, gestures or springs |
| Coverage | 1 | List add/remove/move only |
| Accessibility | 5 | Reduced motion respected by default |
| Performance | 4 | WAAPI animations |
| React/Next fit | 5 | One hook |
| Bundle size | 5 | 3.4 KB gz |
| Licence & health | 3 | MIT, still 0.x, FormKit-maintained, released Jul 2026 |
