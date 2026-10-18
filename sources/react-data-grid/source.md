---
title: react-data-grid
kind: source
pattern: data-table
page_type: dashboard
tags: [data-grid, open-source, editing, virtualised, keyboard, react]
source_url: https://github.com/adazzle/react-data-grid
source_site: github.com
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: 7.0.0-beta.61
licence: MIT
s_look: 4
s_interact: 4
s_coverage: 3
s_a11y: 4
s_perf: 5
s_react: 4
s_bundle: 5
s_licence: 4
why_it_works: A lean, fast spreadsheet-style grid. At 17 KB gz it was the smallest and fastest kit, with frozen columns, Ctrl+click multi-sort, keyboard column resize, a checkbox column, cell editing and full grid ARIA.
use_when: Editable record grids in a React 19 app where size and speed matter and you're happy to sort, filter and validate rows yourself (Supabase Studio's table editor is built on it).
avoid_when: You want filtering, export or number editing with validation out of the box, or you can't accept a library still versioned as a 7.0 beta.
alternatives: [ag-grid-community, tanstack-table, react-aria-table]
has_example: false
---

## Verdict
**The best value grid: smallest, fastest and keyboard-friendly.** **17.1 KB gz** and the fastest sort (99 ms), filter (26 ms) and
first render (194 ms) at 4× throttle. Frozen columns, Ctrl/⌘+click multi-sort, drag and **keyboard** column resize, checkbox
selection, editing and grid ARIA are built in. It's lean on purpose, though: the app sorts and filters rows itself, there's
only a text editor, and nothing validates input. It's still a perpetual 7.0 beta, so pin the exact version.

## Benchmark (same 10,000 rows × 8 columns and four tasks as every kit)
Code: `benchtable/libs/react-data-grid.jsx`, 59 lines. Timings are at 4× CPU throttling (median of 3) and are only comparable
within this bench.

| Probe | Result |
|---|---|
| Library size (React subtracted) | **17.1 KB gz** (2 KB of it CSS) |
| First render / sort Amount / filter Status | **194 ms / 99 ms / 26 ms** (fastest; the sort and filter are our `useMemo`) |
| Scroll (50 wheel steps) | p95 frame gap 83 ms; 21 DOM rows; reaches row 10,000 |
| Semantics | `role=grid`, `aria-rowcount=10001`, `aria-rowindex`, `aria-colindex`, `aria-multiselectable` |
| Layout | Sticky header ✓, frozen ID column ✓ (`frozen: true`), drag resize ✓, **keyboard resize ✓ (Ctrl+←/→ on a focused header)**, hide ✓ (by removing the column) |
| Multi-sort | Shift+click ✗; **Ctrl/⌘+click ✓** (2 columns, priority numbers). **`aria-sort` is dropped from every header once more than one column is sorted** |
| Keyboard selection (APG) | 4/5: Tab in, ↓ → move, Space selects (`aria-selected`); Shift+↓ doesn't extend (Shift+click does) |
| Select all | Header checkbox: from a partial selection the first click clears, the second selects all 10,000; no count |
| Edit Amount | Enter opens `renderTextEditor`; Enter commits, Esc cancels, Tab commits and moves right |
| Invalid value | **✗ "abc" is stored** (we got `NaN` after `Number()`); no number editor, no validation hook, no message |
| axe-core (WCAG 2.2 AA), all four tasks | 0 violations |

## Coverage (all free)
| Feature | Support |
|---|---|
| Sort | Native sort state, multi-sort with priority; the app sorts rows |
| Filter | ✗ (filter rows yourself; header filters are a docs example) |
| Columns | Frozen, resize (drag and keyboard), reorder (`onColumnsReorder`); hide by removing |
| Selection | Checkbox column, Shift+click ranges; cell copy/paste and fill-handle hooks (`onCopy`, `onPaste`, `onFill`) |
| Editing | Text editor; custom editors via `renderEditCell`; no validation |
| Structure | Row grouping (`TreeDataGrid`), summary rows; ✗ pivot, export, master/detail (examples only) |

## Styling with Tailwind/shadcn
Ships a small stylesheet in CSS layers with `rdg-light`/`rdg-dark` and CSS variables (`--rdg-background-color`,
`--rdg-selection-color`, …). Map those to our tokens and pass `className`/`cellClass`/`headerCellClass` for Tailwind on cells.
Plain-looking by default.

## Weaknesses
- No validation or number editor: invalid text reaches your data unless your editor or `onRowsChange` rejects it.
- `aria-sort` disappears under multi-sort, so screen-reader users lose the sort state; announce it yourself.
- Perpetual beta (7.0.0-beta.61, released 14 July 2026, inside the six-month window) and peers on React ^19.2.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Finished but plain grid with light/dark themes |
| Interactivity | 4 | Frozen, resize (incl. keyboard), multi-sort, reorder, select and edit are native; sort/filter logic is the app's |
| Coverage | 3 | Row grouping and summary rows; no export, pivot or master/detail |
| Accessibility | 4 | Grid ARIA with row/col indexes, 4/5 keyboard, keyboard resize, 0 axe; `aria-sort` dropped under multi-sort; no invalid feedback |
| Performance | 5 | Fastest kit: 194 ms render, 99 ms sort, 26 ms filter, 83 ms p95 scroll gaps |
| React/Next fit | 4 | React-first and typed; needs React ^19.2 and its own stylesheet |
| Bundle size | 5 | 17.1 KB gz |
| Licence & health | 4 | MIT, release on 14 July 2026, but a beta label for years: pin versions |
