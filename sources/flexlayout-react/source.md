---
title: FlexLayout
kind: source
pattern: panels
page_type: app
tags: [accessible, open-source, react, docking, resizable, keyboard]
source_url: https://caplin.github.io/FlexLayout/demos/v0.11/demo/
source_site: caplin.github.io
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: 0.11.1
licence: MIT
s_look: 4
s_interact: 5
s_coverage: 4
s_a11y: 3
s_perf: 4
s_react: 3
s_bundle: 3
s_licence: 4
why_it_works: A free docking engine whose splitters you can operate from the keyboard. Tabsets dock to centre or edge, tabs pop out with a built-in button, and every command shortcut is rebindable and announced through aria-keyshortcuts.
use_when: A docking workbench that must be keyboard-operable without paying for it (trading terminal, IDE-like tools), and you can live with a JSON model API.
avoid_when: A fixed set of regions (react-resizable-panels is simpler and passes every check), or you want the most polished drag and float experience (Dockview).
alternatives: [dockview, react-resizable-panels]
has_example: false
---

## Verdict
**The free docking engine to pick when keyboard access matters.** It's the only docking library here whose
splitters take focus, expose `separator` semantics and resize with the arrow keys. It also docks, splits and pops out
as well as Dockview. It still falls short of the APG splitter (no Home/End, no Enter to collapse), its splitters share
one generic name, and moving a tab needs a drag.

## Benchmark (same three-pane workspace as every other library, `benchpanels/`)
**12/17 checks**, 1 axe violation, **53.7 KB gz** (49.9 KB JS + 3.8 KB CSS). Code: `benchpanels/libs/flexlayout-react.jsx`,
19 lines.

Found in the benchmark:
- Keyboard: splitters are reached with Tab, have `role="separator"`, `aria-valuenow/min/max` and `aria-valuetext`
  ("16%"), and ArrowRight moved them **10 px**. Home, End and Enter did nothing. Every splitter is named just "Resize",
  and there's no `aria-controls`.
- Grab area **8 px** (−4 to +3), the visible 8 px splitter.
- Docking: Terminal dropped on Inspector joined that tabset; dropped on the Editor's bottom edge it made a new tabset.
  The built-in pop-out icon (`enablePopout` + `enablePopoutIcon`) opened a real window with the pane inside.
- No double-click reset.
- `model.toJson()` / `Model.fromJson` restored the layout on the first painted frame (CLS 0).
- No built-in non-drag way to move a tab to another tabset (the context menu is yours to build with `onContextMenu`
  and its exported `PopupMenu`).
- axe: `color-contrast` on the inactive tab label in the light theme.
- Drag with heavy panes: p95 frame 16.8 ms. Geometry is applied imperatively, so tab content doesn't re-render on resize.

## Weaknesses
- Sizes are weights, not pixels: a 240 px sidebar is "weight 240 of 1440".
- 0.x versioning and a JSON model with actions (`Actions.moveNode`) rather than React-style props.
- Fix the inactive-tab contrast and name each splitter yourself.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Styling ergonomics | 4 | Light, dark, rounded and other themes; CSS variables |
| Interactivity | 5 | Dock to centre and edge, pop out, maximise, borders, save/restore; no double-click reset |
| Coverage | 4 | Docking, borders, pop-outs, tab groups; split panes through tabsets; no tiles |
| Accessibility | 3 | Focusable separators with values and arrow keys; no Home/End/collapse; generic names; contrast failure; drag-only docking |
| Performance | 4 | Restores on the first frame; 60 fps drag; client-only |
| React/Next fit | 3 | React component over a JSON model and action API; client-only |
| Bundle size | 3 | 53.7 KB gz |
| Licence & health | 4 | MIT; Caplin; release 26 Sep 2026; ~80k weekly downloads; 0.x |
