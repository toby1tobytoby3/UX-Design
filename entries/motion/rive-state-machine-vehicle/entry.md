---
title: Designer-authored illustration animation with a state machine, played by the Rive runtime
pattern: motion
page_type: landing
tags: [animated, illustrative, playful, open-source]
source_url: https://rive.app/community/doc/web-js/docvlgbnS1mp
source_site: rive.app
captured_at: 2026-10-23
captured_by: toby
input: library-render
version: @rive-app/canvas 2.45.1
licence: MIT (runtime)
rating: 3
why_it_works: Designers author the illustration and its states (idle, bounce, curves) in Rive's editor, and the app drives them through a state machine, so playful illustrated motion can respond to app state without hand-coding keyframes.
use_when: Illustrated characters, mascots, icons or empty states whose motion must react to app state (hover, success, error, progress), where a pre-rendered clip is too rigid.
has_example: false
---

## What it is
Rive's public "vehicles" sample (`https://cdn.rive.app/animations/vehicles.riv`, not stored in this repo) played by
@rive-app/canvas 2.45.1. It exposes three animations (`idle`, `curves`, `bounce`) and one state machine (`bumpy`). Our
page adds a Pause/Play button and turns autoplay off under reduced motion. Rendered with SwiftShader.

## Key techniques
- `new rive.Rive({ src, canvas, autoplay, onLoad })`, then `resizeDrawingSurfaceToCanvas()` in `onLoad` for sharp output.
- Drive behaviour through the **state machine's inputs** (booleans, numbers, triggers), not by swapping animations.
- **Self-host the WebAssembly:** by default the runtime fetched `rive.wasm` from `unpkg.com` at runtime (seen in our
  network log). Call `RuntimeLoader.setWasmUrl()` with your own copy for production and offline use.
- **Reduced motion is your job:** Rive doesn't check it. We set `autoplay: !reduced`; also offer a pause control
  (WCAG 2.2.2 for anything that moves for more than 5 s).
- In React use `@rive-app/react-canvas` (`useRive`, `useStateMachineInput`).

## Accessibility
The canvas has no role or name by default; we added `role="img"` and an `aria-label`. Pause button with `aria-pressed`.

## Weaknesses
- Heavy for a UI detail: 74 KB gz JavaScript **plus 884 KB gz WebAssembly** (2.1 MB raw). Use `@rive-app/canvas-lite`
  for simpler files, or a pre-rendered clip (see `navigation/airbnb-3d-category-icon-tabs`) when the motion never changes.
- Authoring needs the Rive editor (paid plans for teams); the runtime alone is MIT.

## Related entries
- `navigation/airbnb-3d-category-icon-tabs`: the pre-rendered-clip approach for fixed animations.
