---
title: React Grid Layout
kind: source
pattern: panels
page_type: dashboard
tags: [open-source, react, resizable]
source_url: https://react-grid-layout.github.io/react-grid-layout/examples/00-showcase.html
source_site: react-grid-layout.github.io
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: 2.3.0
licence: MIT
s_look: 3
s_interact: 4
s_coverage: 3
s_a11y: 1
s_perf: 4
s_react: 4
s_bundle: 4
s_licence: 5
why_it_works: Dashboard tiles that users drag and resize on a snapping column grid, with compaction, responsive breakpoints and a layout array that's easy to save.
use_when: User-customisable dashboards where different roles arrange their own tiles, inside an explicit Edit layout mode that also gives keyboard users move up/down and S/M/L menus.
avoid_when: Curated dashboards (use CSS Grid), split panes (react-resizable-panels; its Grid covers fixed, resizable tiles), or docking views.
alternatives: [react-resizable-panels, dockview]
has_example: false
---

## Verdict
**The tiles library, with no keyboard support at all.** It moved and resized tiles cleanly with the mouse and
restored without a jump once you ask it to measure before mount. Tiles and handles can't be focused, so any
customisable dashboard needs a non-drag alternative you build yourself (WCAG 2.5.7 and 2.1.1).

## Benchmark (same three-pane workspace as every other library, `benchpanels/`, as three tiles on a 12-column grid)
**5/14 checks**, 0 axe violations, **24.9 KB gz** (24.0 KB JS + 0.9 KB CSS). Code: `benchpanels/libs/react-grid-layout.jsx`,
30 lines (east-edge handles so the resize task matches the other libraries).

Found in the benchmark:
- Drag-resizing snaps to columns: +120 px is one 120 px column, so only 14 canvas redraws happened during a 240 px drag
  (120 for the splitters). Neighbouring tiles reflow instead of shrinking.
- Grab area **25 px** (−15 to +9) on the 20 px handle.
- Dragging the Inspector tile by its title to the left edge moved it to x = 0 and pushed Explorer down (vertical
  compaction).
- Keyboard: **0/7** on the handle. Tiles have no `tabindex` or key handlers, so there's no keyboard move either.
- No double-click reset.
- Persistence with `onLayoutChange` restored the layout, **but only after we set `useContainerWidth({ measureBeforeMount:
  true })`**. With the default, the first frame used a 1280 px guess (Explorer 320 px) and then jumped.

## Weaknesses
- No keyboard operation of any kind.
- `useContainerWidth` defaults to a 1280 px guess. Use `measureBeforeMount` or an `initialWidth` matching your layout.
- The demo URL moved: `examples/00-showcase.html` (`0-showcase.html` is a 404).

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Styling ergonomics | 3 | Minimal placeholder and handle styles; you style the tiles |
| Interactivity | 4 | Drag to move, resize, compaction, responsive breakpoints, persistence via `onLayoutChange` |
| Coverage | 3 | Tiles only, but the main free tiles library |
| Accessibility | 1 | 0/7 keyboard checks; tiles and handles not focusable |
| Performance | 4 | 60 fps; snapping limits redraws; needs `measureBeforeMount` to restore without a jump |
| React/Next fit | 4 | v2 TypeScript rewrite with hooks; `measureBeforeMount` for SSR |
| Bundle size | 4 | 24.9 KB gz |
| Licence & health | 5 | MIT; release 5 Oct 2026; ~2.2M weekly downloads |
