---
title: React Aria Table
kind: source
featured: data-table/react-aria-keyboard-selection-sort
pattern: data-table
page_type: dashboard
tags: [accessible, headless, keyboard, table, react]
source_url: https://react-aria.adobe.com/Table
source_site: react-aria.adobe.com
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: react-aria-components 1.22.1 (Table + Virtualizer + ResizableTableContainer)
licence: Apache-2.0
s_look: 3
s_interact: 2
s_coverage: 1
s_a11y: 5
s_perf: 2
s_react: 5
s_bundle: 3
s_licence: 5
why_it_works: The most correct accessible table in the bench. Row and cell keyboard focus, Space and Shift+Arrow selection, sortable headers and column resizing come with full grid ARIA and zero axe violations, and every state is a data attribute Tailwind can target.
use_when: Admin and settings tables of up to a few thousand rows where keyboard and screen-reader correctness matter more than grid features, especially if the app already uses React Aria Components.
avoid_when: Large client-side datasets (it was the slowest kit at 10,000 rows), or briefs needing pinned columns, filtering or cell editing out of the box.
alternatives: [tanstack-table, react-data-grid, ag-grid-community]
has_example: false
---

## Verdict
**The accessibility reference, not a data grid.** It passed 5/5 keyboard checks, `aria-rowcount=10001`, and had 0 axe
violations. Selection, sorting and drag resizing are native. But there's no filter API, no pinning, no editing and single-column
sort only. At 10,000 rows it was **the slowest kit by far** (2.9 s sort at 4× throttle), because the whole collection is rebuilt on
every change, even though only 19 rows are in the DOM.

## Benchmark (same 10,000 rows × 8 columns and four tasks as every kit)
Code: `benchtable/libs/react-aria-table.jsx`, 112 lines (the editor and filter are ours). Timings are at 4× CPU throttling
(median of 3) and are only comparable within this bench.

| Probe | Result |
|---|---|
| Library size (React subtracted) | **78.1 KB gz** |
| First render / sort Amount / filter Status | **3,220 ms / 2,917 ms / 1,762 ms** (slowest in the bench) |
| Scroll (50 wheel steps) | p95 frame gap 417 ms; 19 DOM rows (`Virtualizer` + `TableLayout`); reaches row 10,000 |
| Semantics | `role=grid`, `aria-rowcount=10001`, `aria-multiselectable`, `rowheader` cells |
| Layout | Sticky header ✓, **pinned column ✗ (no API)**, drag resize ✓ (`ColumnResizer`), hide ✓ (by removing the column) |
| Keyboard resize | ✗ as wired. The API exists: `startResize()` from a column menu, then arrow keys. It needs app wiring (docs example) |
| Multi-sort | ✗ (one `sortDescriptor`) |
| Keyboard selection (APG) | **5/5**: Tab focuses the row, → enters cells, ↓ and → move, Space selects, Shift+↓ extends (`aria-selected`) |
| Select all | Header checkbox selects all 10,000; no built-in count |
| Edit Amount (**hand-built**, not counted as native) | Enter/F2 opens our input; Enter commits, Esc cancels, invalid shows `role=alert` "Enter a number". Tab commits, but focus stays on the cell because the table restores focus to it |
| axe-core (WCAG 2.2 AA), all four tasks | 0 violations |

## Coverage (all free)
| Feature | Support |
|---|---|
| Sort | ✓ single column (`sortDescriptor`; the app sorts rows) |
| Filter | ✗ (filter the items yourself) |
| Selection | ✓ single/multiple, checkbox or highlight behaviour, `disabledKeys` |
| Columns | ✓ resize (`ColumnResizer`); ✗ pinning, hiding API, reorder (drag and drop reorders rows) |
| Long lists | ✓ `Virtualizer`, `onLoadMore` |
| Editing, grouping, tree, pivot, export, master/detail | ✗ |

## Styling with Tailwind/shadcn
The best of the bench: unstyled, with state as `data-*` attributes (`data-selected`, `data-focus-visible`, `data-resizing`) and
`className` render functions. A shadcn look takes a handful of classes. The virtualised layout sets row positions itself, so cell
heights must match `rowHeight` exactly (we hit this: rows misaligned until cells were fixed to 36 px).

## Weaknesses
- Slow with large client-side data: 2.9 s sort and 1.8 s filter at 4× throttle on 10,000 rows. Page or window the data on the server.
- No pinning, filtering, editing or multi-sort; keyboard resize needs a column menu you build.
- Row-first focus (Tab lands on the row, → enters cells) differs from AG Grid and MUI, which focus cells directly.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Headless (capped at 3); excellent styling ergonomics via `data-*` state |
| Interactivity | 2 | Sort, select and drag resize are native; filter, pin and edit are not |
| Coverage | 1 | None of grouping, tree data, pivot, export or master/detail |
| Accessibility | 5 | 5/5 keyboard, grid ARIA with `aria-rowcount`, row headers, 0 axe |
| Performance | 2 | Slowest kit: 3.2 s render, 2.9 s sort, 417 ms p95 scroll gaps at 4× throttle |
| React/Next fit | 5 | Typed React components, Tailwind-friendly, same package as our UI primitives |
| Bundle size | 3 | 78.1 KB gz (shared with other React Aria components if you already use them) |
| Licence & health | 5 | Apache-2.0, Adobe, release 1.22.1 on 9 October 2026 |
