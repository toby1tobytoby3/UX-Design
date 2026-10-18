---
title: Docking layout with keyboard-operable splitters, edge borders, tab overflow and layout undo
pattern: panels
page_type: app
tags: [open-source, accessible, keyboard, dense, interactive]
source_url: https://caplin.github.io/FlexLayout/demos/v0.11/demo/
source_site: caplin.github.io
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 4
why_it_works: The docking library with the most complete keyboard story. Splitters are labelled APG separators that move with arrow keys behind a 2 px focus ring, tabs follow the APG tabs pattern, and shortcuts are remappable through a keyMap prop (WCAG 2.1.4).
use_when: Dockable multi-view tools where keyboard and screen-reader users must be able to resize and navigate as well as pointer users.
has_example: false
---

## What it is
FlexLayout's demo (flexlayout-react 0.11.1, MIT). Tabsets hold an OpenLayers map, ChartJS, AG Grid, MUI Grid,
Wikipedia and an editor. Borders sit on three edges ("Model Explorer", "Theme"/"SubLayout 1",
"Terminal"/"Action Log"/"Layout JSON"). A toolbar has layout presets, undo/redo, To-From JSON, size and theme
selects, and Add Drag/Active/Float. Captured: the default layout after moving a splitter with the keyboard.

## Key techniques
- Borders: collapsible edge tab strips (vertical text on the sides) for secondary tools. Tabsets have maximise and
  close, and an overflow menu ("▾ 4") when tabs don't fit.
- Undo/redo of layout changes in the toolbar. This is cheap insurance against an accidental drag.
- Layout as JSON (`To-From JSON`), so presets ("Simple", "Mosaic Style", "Tab Groups", "Complex") are just data.
- Size presets (xx-small to large) and themes, including an "Aria" theme.

## Accessibility (measured)
- 4 splitters: `role="separator"`, `tabindex="0"`, `aria-valuenow` (33 / 50 / 66), `aria-orientation`,
  `aria-label="Resize"`. The label is the same everywhere; name the panes ("Resize map and chart").
- Keyboard: focusing the first splitter and pressing ArrowRight ×5 moved it 50 px (10 px per press).
  Focus ring: `2px solid rgb(59,125,231)`.
- Tabs are `role="tab"` with roving tabindex (selected 0, others −1) in 8 tablists. The documented keys are
  Ctrl+Delete to close, F2 to rename, Enter to move into the content, and Esc to close a border overlay.
- The splitter position survived a reload; nothing was written to `localStorage`.
- Docking itself is still drag-only. The docs list no keyboard or menu "move tab to…" command, so add one
  (WCAG 2.5.7).

## Weaknesses
- The demo toolbar is a developer harness, not a pattern to copy.
- Generic "Resize" labels on every splitter.
- Dense default spacing and tiny border text. Pick the "medium" size or larger for general audiences.

## Related entries
- `panels/dockview-trading-workspace-docking`, `panels/react-resizable-panels-keyboard-splitter-collapse`,
  `panels/vscode-workbench-parts`.
