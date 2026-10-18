---
title: VisActor VTable (watch)
kind: source
pattern: data-table
page_type: dashboard
tags: [canvas, data-grid, pivot, open-source, watch]
source_url: https://visactor.io/vtable
source_site: visactor.io
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: "@visactor/vtable 1.26.8 + @visactor/react-vtable 1.26.8 + @visactor/vtable-editors 1.26.8"
licence: MIT
s_look: 4
s_interact: 4
s_coverage: 5
s_a11y: 1
s_perf: 3
s_react: 2
s_bundle: 1
s_licence: 5
why_it_works: A canvas grid with a wide free feature set (pivot tables, tree, Gantt, frozen columns, multi-sort, checkbox selection, editors) that renders zero DOM rows, so DOM size never grows with the data.
use_when: Watch only. Consider it for internal, sighted-user analytics views (dense pivots, very wide tables) where accessibility requirements have been explicitly waived.
avoid_when: Anything customer-facing or covered by accessibility requirements. It has no grid semantics, so screen-reader users get nothing, and keyboard users can't start navigation without a mouse.
alternatives: [ag-grid-community, react-data-grid, tanstack-table]
has_example: false
---

## Verdict
**Watch, don't use.** It did every layout and edit task natively (frozen columns, multi-sort, drag resize, hide, select all,
Enter/Esc/Tab editing). It's also free for pivot and tree views. But it draws everything on a `<canvas>`. **In the DOM there are 5
elements and no ARIA roles at all**: a `tabindex=0` div, an unlabelled hidden `<input>` (axe "label", critical) and the canvas.
Screen readers get nothing. Keyboard users can Tab in, but no cell is selected until someone clicks, so the arrow keys do nothing.
It's also **662 KB gz**.

## Benchmark (same 10,000 rows × 8 columns and four tasks as every kit)
Code: `benchtable/libs/vtable.jsx`, 71 lines. Probes use VTable's own API (cell rects, values, sort state) because there's no DOM
to read. Timings are at 4× CPU throttling (median of 3) and are only comparable within this bench.

| Probe | Result |
|---|---|
| Library size (React subtracted) | **662 KB gz** (vtable + react-vtable + vtable-editors) |
| First render / sort Amount / filter Status | 2,085 ms / 639 ms / 326 ms |
| Scroll (50 wheel steps) | p95 frame gap 217 ms; **0 DOM rows** (canvas); reaches row 10,000 |
| Semantics | **None**: no `grid`/`table` role, no `aria-rowcount`; confirmed in the DOM (5 elements) and by source grep (only `aria-hidden`) |
| Layout | Sticky header ✓, frozen ID column ✓ (`frozenColCount`), drag resize ✓, keyboard resize ✗, hide ✓ (`hide: true` via `updateColumns`) |
| Multi-sort | ✓ with `multipleSort: true` (each click adds a column; no modifier). Sorting starts from the header's sort icon; clicking elsewhere selects the column |
| Keyboard selection | 1/5: Tab focuses the canvas, but with no selected cell ↓ → do nothing. **After a mouse click** the arrows move the cell selection and Shift+arrow extends a cell range; Space doesn't tick the row checkbox |
| Select all | Header checkbox selects all 10,000; no count |
| Edit Amount | Enter opens `InputEditor` (after a click selects the cell); Enter commits, Esc cancels, Tab commits and moves right |
| Invalid value | **✗ "abc" is stored** (no validation in `InputEditor`; a custom editor's `validateValue` is the hook, not tested) |
| axe-core (WCAG 2.2 AA) | 4 violations across the tasks, all the unlabelled focus `<input>` ("label", critical) |

## Coverage (all free)
| Feature | Support |
|---|---|
| Table types | List table, **pivot table**, pivot chart, Gantt (separate package) (docs) |
| Sort / filter | ✓ multi-sort, `updateFilterRules` (no filter UI in the core) |
| Columns | ✓ frozen left/right, resize, hide, drag to reorder (docs) |
| Rows | ✓ checkbox column, tree and grouping (docs), merged cells |
| Editing | ✓ input, date, list editors; custom editors with validation hooks |
| Export | ✓ CSV/Excel via `@visactor/vtable-export` (docs, not tested) |

## Styling with Tailwind/shadcn
Not possible with classes: styles are a JS theme object (`themes.DEFAULT.extends({...})`) drawn on canvas. Map our tokens into the
theme by hand (font, colours, row heights). Custom cell content is drawn with VTable's own layout primitives, not React DOM.

## Weaknesses
- No accessibility tree: fails WCAG for any user-facing table. This alone keeps it on the watch list.
- Keyboard navigation needs a mouse click first; Ctrl+F, text selection and browser translation don't see the content.
- 662 KB gz and a 2 s first render at 4× throttle; an imperative option-object API in a thin React wrapper.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Finished canvas grid with sort icons, frozen shadow and checkboxes |
| Interactivity | 4 | Frozen, multi-sort, resize, hide, select and edit native; sort starts only from the icon; no validation |
| Coverage | 5 | Pivot, tree, grouping, Gantt and export, all MIT (docs) |
| Accessibility | 1 | Canvas with no roles or ARIA, unlabelled input, 1/5 keyboard, 4 axe violations |
| Performance | 3 | 0 DOM rows, but 2.1 s first render, 639 ms sort, 217 ms p95 scroll gaps at 4× throttle |
| React/Next fit | 2 | Thin wrapper over an imperative option object; canvas can't use React components or Tailwind |
| Bundle size | 1 | 662 KB gz |
| Licence & health | 5 | MIT, VisActor, release 1.26.8 on 11 September 2026 |
