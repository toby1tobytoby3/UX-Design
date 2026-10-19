---
title: MUI X Data Grid (MIT)
kind: source
featured: data-table/mui-x-checkbox-selection-count
pattern: data-table
page_type: dashboard
tags: [data-grid, open-core, material, editing, keyboard, react]
source_url: https://mui.com/x/react-data-grid/
source_site: mui.com
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: @mui/x-data-grid 8.29.5 (+ @mui/material 7.3.11, Emotion 11)
licence: MIT (DataGrid); Pro and Premium are commercial
s_look: 5
s_interact: 3
s_coverage: 2
s_a11y: 5
s_perf: 2
s_react: 3
s_bundle: 2
s_licence: 5
why_it_works: A finished Material grid with the best keyboard result in the bench (5/5, including Shift+Arrow range select), a visible "n rows selected" count, and native editing with validation through preProcessEditCellProps.
use_when: The app already uses MUI/Material and the grid fits in pages of 100 rows with one sort column and no pinned columns, e.g. settings and admin lists.
avoid_when: You need to scroll thousands of rows, multi-sort, pinned or reordered columns (all Pro), a Tailwind/shadcn look without Material and Emotion, or a small bundle.
alternatives: [ag-grid-community, react-data-grid, tanstack-table]
has_example: false
---

## Verdict
**Good keyboard behaviour, but the free edition is a demo of Pro.** The MIT `DataGrid` passed 5/5 keyboard checks and had
0 axe violations. The source forces `pagination: true`, `disableMultipleColumnsSorting`, `disableMultipleColumnsFiltering` and
`disableColumnReorder`, and **throws if `pageSize` > 100** ("cannot exceed 100 in the MIT version"). So 10,000 rows are
paginated 100 at a time, not virtualised, and pinning, multi-sort and reordering need **Pro**. It also brings `@mui/material` and
Emotion into a Tailwind app.

## Benchmark (same 10,000 rows × 8 columns and four tasks as every kit)
Code: `benchtable/libs/mui-x-data-grid.jsx`, 39 lines. Timings are at 4× CPU throttling (median of 3) and are only comparable
within this bench.

| Probe | Result |
|---|---|
| Library size (React subtracted) | **219.9 KB gz** (includes the Material and Emotion parts the grid pulls in) |
| First render / sort Amount / filter Status | 660 ms / 481 ms / 381 ms (sort and filter run over all 10,000 rows) |
| Scroll | **Only one 100-row page scrolls**: p95 100 ms, 16 DOM rows; **row 10,000 unreachable by scrolling** (paged). Not comparable with the virtualised kits |
| Semantics | `role=grid`, `aria-rowcount=10001`, `aria-multiselectable` |
| Layout | Sticky header ✓, **pinned column ✗ (Pro)**, drag resize ✓, keyboard resize ✗, hide ✓ (`setColumnVisibility`) |
| Multi-sort (Shift+click, then Ctrl/⌘+click) | **✗ one column** (forced off in MIT) |
| Keyboard selection (APG) | **5/5**: Tab in, ↓ →, Space selects, **Shift+↓ extends** (`aria-selected`); footer shows "3 rows selected" |
| Select all | Header checkbox selects all 10,000 (across pages) |
| Edit Amount | Enter opens the number editor; Enter commits, Esc cancels, Tab commits and moves right |
| Invalid value | `preProcessEditCellProps` returning `error: true` blocks the commit and sets `aria-invalid`; **no message** (yours to add). Enter pressed within ~200 ms of the last keystroke is ignored while validation runs |
| axe-core (WCAG 2.2 AA), all four tasks | 0 violations |

## Coverage: free (MIT) vs paid
| Feature | MIT `DataGrid` | Pro | Premium |
|---|---|---|---|
| Rows | Paginated, **max 100 per page** (virtualised within the page) | Unlimited virtualisation, lazy loading | |
| Sort / filter | **Single column**; one filter at a time; quick filter | Multi-sort, multi-filter, header filters | |
| Columns | Resize, hide, column groups | **Pinning, reordering** | |
| Selection and editing | Row checkboxes, cell/row editing, validation | | Cell selection, clipboard paste, undo/redo |
| Structure | Save/restore state, density | Tree data, master/detail | Row grouping, aggregation, pivot |
| Export | CSV, print | | Excel |

## Styling with Tailwind/shadcn
Styled with Emotion and the MUI theme. Match a shadcn app through `createTheme` tokens and `sx`/`slotProps`, mapped to our
CSS variables. Tailwind classes work on custom cell renderers only. Expect two styling systems in one app.

## Weaknesses
- The 100-row page cap and single-column sort make the MIT grid a poor fit for analyst or ops grids.
- Brings `@mui/material` and Emotion (styled runtime) into a Tailwind codebase.
- Invalid edits get no message, and a fast Enter after typing is swallowed while validation is pending.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 5 | Finished Material grid with footer, pagination and selection count |
| Interactivity | 3 | Sort, filter, resize, hide, select and edit work; no pinning, multi-sort or reordering in MIT |
| Coverage | 2 | Free edition: CSV/print and column groups only; grouping, tree, pivot, master/detail, Excel are paid |
| Accessibility | 5 | 5/5 keyboard including Shift+Arrow, grid ARIA with `aria-rowcount`, visible selection count, 0 axe |
| Performance | 2 | Can't scroll 10,000 rows: hard 100-row page cap; sort 481 ms and filter 381 ms over the full set |
| React/Next fit | 3 | Idiomatic, typed React; but needs Material + Emotion alongside Tailwind |
| Bundle size | 2 | 219.9 KB gz |
| Licence & health | 5 | MIT, release 8.29.5 on 16 October 2026; Pro/Premium upsell noted above |
