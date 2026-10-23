---
title: Rive runtime (@rive-app/canvas, @rive-app/react-canvas)
kind: source
featured: motion/rive-state-machine-vehicle
pattern: motion
page_type: landing
tags: [animated, illustrative, playful, open-source]
source_url: https://github.com/rive-app/rive-wasm
source_site: github.com
captured_at: 2026-10-23
captured_by: toby
input: library-render
version: 2.45.1
licence: MIT (runtime); editor is a paid product for teams
s_look: 5
s_interact: 4
s_coverage: 2
s_a11y: 1
s_perf: 3
s_react: 4
s_bundle: 1
s_licence: 3
why_it_works: Designers build illustrated, state-driven animation in the Rive editor and the app plays it with a small API, so mascots, icons and empty states can react to app state without hand-written keyframes.
use_when: Illustrated motion that must respond to state (hover, success, error, progress); the maintained replacement for Lottie Web in that role.
avoid_when: UI motion (dialogs, layout, lists: use CSS or Motion), fixed one-shot clips (use a pre-rendered video like Airbnb's tabs), or pages where ~1 MB of WebAssembly is too much.
alternatives: [motion, native-css]
has_example: false
---

## Verdict
**An illustration runtime, not a UI motion library.** Pick it when an illustration needs states; otherwise a
pre-rendered clip or CSS is far lighter. Self-host its WebAssembly and gate it on reduced motion yourself. The runtime
is MIT; authoring needs the Rive editor, which is paid for teams (named here per the rubric).

**Maintenance check (23 Oct 2026):** @rive-app/canvas 2.45.1 and @rive-app/react-canvas 4.37.1 published October 2026.

## Benchmark (rough, not in `benchmotion/`: it doesn't do the four UI tasks)
Rendered Rive's public "vehicles" sample with @rive-app/canvas 2.45.1 (SwiftShader): loaded in 553–802 ms; three
animations and one state machine exposed.

Found in the benchmark:
- The runtime fetched `rive.wasm` from **unpkg.com** at runtime by default; use `RuntimeLoader.setWasmUrl()` to self-host.
- **No reduced-motion handling**: it autoplays unless you pass `autoplay: false`.
- Size: 74 KB gz JavaScript + **884 KB gz WebAssembly** (2.1 MB raw).
- The canvas has no role or name by default.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 5 | Plays designer-authored art exactly; crisp vector rendering |
| Interactivity | 4 | State machines with inputs, pointer events, events back to the app |
| Coverage | 2 | Illustration animation only; no layout, presence or scroll features |
| Accessibility | 1 | No reduced-motion support, unlabelled canvas |
| Performance | 3 | WASM renderer; not measured in the motion bench |
| React/Next fit | 4 | `@rive-app/react-canvas` hooks (`useRive`, `useStateMachineInput`) |
| Bundle size | 1 | ~958 KB gz including WebAssembly |
| Licence & health | 3 | MIT runtime, active; authoring tool paid for teams |

Pattern entries: `motion/rive-state-machine-vehicle`.
