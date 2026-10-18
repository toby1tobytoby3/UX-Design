---
title: Split panes with a focusable APG splitter, keyboard resize, Enter to collapse and a saved layout
pattern: panels
page_type: docs
tags: [open-source, accessible, keyboard, devtools, minimal]
source_url: https://react-resizable-panels.vercel.app/examples/collapsible-panels
source_site: react-resizable-panels.vercel.app
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 5
why_it_works: Every separator is a focusable APG window splitter with live values, so arrow keys resize, Home/End jump to the limits and Enter collapses and restores. A collapsed panel keeps its separator, so it can always be reopened.
use_when: Two- or three-pane app layouts (list/detail, editor/preview, sidebar/content) where people resize and collapse panes and expect the layout back on reload.
has_example: false
---

## What it is
The react-resizable-panels docs (v4.14.5, MIT), with live demos captured: the collapsible panels page. The
separator was focused, moved with the keyboard and collapsed with Enter. The persistent-layout example was
resized and then reloaded.

## Key techniques
- API v4: `<Group>`, `<Panel collapsible minSize collapsedSize>`, `<Separator>`. Persistence is one hook,
  `useDefaultLayout({ id, storage })`, which feeds `defaultLayout` and `onLayoutChanged`.
- Sizes can be pixels or percentages (`minSize={100}`, `defaultSize="0%"`). The collapse threshold defaults to halfway
  between `collapsedSize` and `minSize`.
- `collapsedSize={35}` leaves a 35 px strip, the VS Code "Folders" pattern. It is better than collapsing to 0 when
  the panel has an icon rail.
- Separator: 7 px wide hit area. It shows a 1 px line at rest and turns solid accent blue on focus or drag
  (see `crop-keyboard-focus.jpg`).
- The docs recommend keeping a `<Separator>` beside a fully collapsible panel "to give users something to click to re-open it".

## Accessibility (measured)
- All 4 separators on the page: `role="separator"`, `tabindex="0"`, `aria-valuenow/min/max`, `aria-controls`
  pointing at the panel, and `aria-orientation`.
- Keyboard: ArrowRight ×3 moved 50 → 65 (5% steps). Home → 0 (collapsed), End → 75 (max). Enter collapsed to 0,
  and Enter again restored to 75.
- No `aria-label` on the separators. APG asks for a name (`aria-label`, or `aria-labelledby` the primary pane's
  heading). Add one in your build, e.g. "Resize sidebar".
- Persistence: resizing with the keyboard (33 → 53) survived a reload. The demo stores it in `sessionStorage`
  (`react-resizable-panels:unique-layout-id`), while the code sample shows `localStorage`. Pick the storage
  deliberately: per tab or per user.

## Weaknesses
- The demo's separator has no visible grip at rest (1 px line), so pointer users may not discover it. Show a grip
  or widen the line on hover.
- Neither the separators nor the collapsed state carry a name or a "collapsed" announcement out of the box.
- The docs site's purple chrome is not a styling reference. Copy the behaviour, not the look.

## Related entries
- `panels/flexlayout-docking-keyboard-splitters`, `panels/dockview-trading-workspace-docking`,
  `panels/vscode-workbench-parts`, `navigation/shadcn-sidebar-icon-rail`.
