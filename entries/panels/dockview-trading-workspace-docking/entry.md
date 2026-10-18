---
title: Dockable trading workspace with drag-to-dock overlays, floating groups, pop-outs and edge panels
pattern: panels
page_type: app
tags: [open-source, dense, data-viz, b2b, interactive]
source_url: https://dockview.dev/demo/
source_site: dockview.dev
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 4
why_it_works: A full IDE-style docking model (tab groups, split by dragging to an edge, Shift+click to float, pop out to a new window, collapsible edge groups) shown on a realistic dense trading screen, with a clear half-pane drop preview while dragging.
use_when: Power-user workspaces where people arrange many views themselves (trading terminals, monitoring consoles, IDE-like tools). For fixed two- or three-pane layouts use split panes instead.
has_example: false
---

## What it is
The Dockview demo (dockview 8.6.0, MIT core) is a trading terminal: correlation matrix, order book, FX rates with
G10/EM/Crosses sub-tabs, an order blotter, a vol surface, news and tech view. It also has "Explorer" and "Outline" edge
groups and a Terminal/Output/Problems bottom panel. Captured: the default layout, a tab mid-drag over the Orders group's left
edge (the drop preview shades the left half), and a Shift+click floating group.

## Key techniques
- Each group header has a tab strip, "+" (add), and on the right **Open In New Window** (pop-out) and **Maximize View**.
- While dragging a tab, an overlay shades the target region: centre to add as a tab, a half to split
  (`dv-drop-target-selection`). The preview is large and unambiguous.
- Shift+click a tab floats it as an overlay window (hint shown in the top bar: "Shift + click a tab to float it").
- Edge groups ("Explorer", "Outline") collapse to vertical tabs on the window edges and peek open on click, with pin and close.
- 4 px sashes between groups. Dense 12–13 px monospace numerics.

## Accessibility (measured)
- Tabs are `role="tab"` inside 11 `role="tablist"`s, with `aria-selected`. ArrowRight moves focus within a group
  (Orders → Positions). Tab panels use `aria-labelledby` pointing at their tab.
- **Sashes are not focusable**: no `role`, no `tabindex` on any of the 9 `.dv-sash` elements, so groups can't be
  resized from the keyboard in this demo.
- Group actions "Open In New Window" and "Maximize View" are `<div title=…>` with no role or tabindex, so they are
  mouse-only.
- No keyboard or menu alternative to drag-to-dock was found in the demo (WCAG 2.5.7 needs a single-pointer
  alternative such as a "Move to…" menu).
- Layout is not persisted: nothing written to `localStorage` (the library supports `toJSON`/`fromJSON`; the demo doesn't use it).

## Weaknesses
- Copy the docking model and drop preview. Add keyboard sashes, real buttons for group actions, a "Move to group /
  New window" menu on each tab, and layout save/restore with a Reset.
- Floating and pop-out windows multiply focus contexts. Give each a name and a way back ("Dock back").
- Some features shown on dockview.dev may be in the paid dockview-enterprise; check before relying on them.

## Related entries
- `panels/flexlayout-docking-keyboard-splitters` (same model, better keyboard support), `panels/vscode-workbench-parts`,
  `panels/react-resizable-panels-keyboard-splitter-collapse`, `data-table/ag-grid-dense-grid-column-menus`.
