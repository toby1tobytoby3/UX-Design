---
title: TanStack Table v9 + TanStack Virtual
kind: source
pattern: data-table
page_type: dashboard
tags: [headless, open-source, shadcn, virtualised, react, tailwind]
source_url: https://tanstack.com/table/latest
source_site: tanstack.com
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: "@tanstack/react-table 9.3.1 + @tanstack/react-virtual 3.14.21"
licence: MIT
s_look: 3
s_interact: 3
s_coverage: 4
s_a11y: 2
s_perf: 5
s_react: 5
s_bundle: 4
s_licence: 5
why_it_works: Headless table state (sort, multi-sort, filters, selection, sizing, pinning, visibility, grouping) with no markup of its own, so the table is ours in Tailwind and shadcn/ui's Data Table recipe is written against it. Fast at 10,000 rows when paired with TanStack Virtual.
use_when: Record tables in our own design system (the shadcn Data Table), from simple lists to virtualised 10k-row views, where we want full control of markup and are happy to write the keyboard layer if cells become interactive.
avoid_when: You need a finished editing grid with APG arrow-key navigation now (use AG Grid Community or react-data-grid), or the team can't own the markup, ARIA and keyboard code.
alternatives: [react-data-grid, ag-grid-community, react-aria-table]
has_example: false
---

## Verdict
**Our default for owned UI, as long as the gaps are budgeted.** The state engine is complete and fast (234 ms sort, 67 ms filter, 67 ms p95
scroll gaps at 4× throttle), with Shift+click multi-sort, pinning, resizing and visibility all native, at **29.9 KB gz** with Virtual.
Everything you see is our markup, though. Rendered as the semantic `<table>` the shadcn recipe uses, it **passed 1/5 grid keyboard
checks** (Tab only). That's correct for a read-mostly table (APG: a table *"is not an interactive widget"*), but arrow-key cell
navigation, editing and `aria-rowcount` are code we write.

## Benchmark (same 10,000 rows × 8 columns and four tasks as every kit)
Code: `benchtable/libs/tanstack-table.jsx`, 119 lines (markup, sticky CSS, resize handle and editor are ours). Timings are at 4× CPU
throttling (median of 3) and are only comparable within this bench.

| Probe | Result |
|---|---|
| Library size (React subtracted) | **29.9 KB gz** for Table + Virtual |
| First render / sort Amount / filter Status | 292 ms / 234 ms / 67 ms |
| Scroll (50 wheel steps) | p95 frame gap **67 ms** (best); 30 DOM rows; reaches row 10,000 |
| Semantics | `<table>` (role table), `aria-rowcount=10001` and `aria-rowindex` **set by us** |
| Layout | Sticky header ✓ (CSS), pinned ID column ✓ (`columnPinning` + `column.getStart()` + our sticky CSS), drag resize ✓ (`getResizeHandler`), keyboard resize ✗, hide ✓ (`toggleVisibility`) |
| Multi-sort | **✓ Shift+click**, 2 columns, native |
| Keyboard selection | 1/5: Tab reaches the select-all checkbox; no arrow-key cell navigation (table semantics; checkboxes are separate tab stops) |
| Select all | Our header checkbox (`getToggleAllRowsSelectedHandler`) selects all 10,000 |
| Edit Amount (**hand-built**, not counted as native) | Enter/F2 opens our input; Enter commits, Esc cancels, invalid shows `role=alert` "Enter a number"; Tab commits and moves to the next focusable element (the next row's checkbox) |
| axe-core (WCAG 2.2 AA), all four tasks | 0 violations |

## Coverage (all free; headless state only)
| Feature | Support |
|---|---|
| Sort / filter | ✓ multi-sort, column and global filters, faceting (counts and min/max) |
| Columns | ✓ sizing and resizing, pinning (start/end), visibility, ordering |
| Rows | ✓ selection, pinning, pagination, expanding (tree data), grouping and aggregation |
| v9 examples | Cell selection, experimental spreadsheet (docs, not tested) |
| Virtualisation | Separate package, `@tanstack/react-virtual` (included above) |
| Editing, export, ARIA grid keyboard model | ✗ (patterns in the docs; you build them) |

## Styling with Tailwind/shadcn
The best fit: it renders nothing, so shadcn/ui's `Table`, `Checkbox` and `DropdownMenu` (the copy-in Data Table recipe, now v9) are
the markup. Pinned columns need `position: sticky` with `left: column.getStart('start')` and an opaque background; the virtualised body
needs `display: grid` rows with fixed heights.

## Weaknesses
- Every interactive behaviour beyond state is ours: APG grid keys, roving focus, editing, `aria-rowcount`/`rowindex`, resize handles.
- v9 changed the API (`useTable` with `tableFeatures`, `createColumnHelper().columns`); v8 blog posts and older shadcn copies need migrating.
- Sticky pinned columns and virtual rows are easy to get subtly wrong (backgrounds, z-index, row heights).

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Headless (capped at 3); shadcn's Data Table recipe is the look |
| Interactivity | 3 | All state native (multi-sort, pin, resize, hide, select), but no UI or editing without our code |
| Coverage | 4 | Grouping, aggregation, tree/expanding, faceting, pinning all free; no export |
| Accessibility | 2 | Semantic table only; 1/5 grid keyboard checks; counts and keys are ours to add |
| Performance | 5 | 234 ms sort, 67 ms filter, 67 ms p95 scroll gaps with 30 DOM rows |
| React/Next fit | 5 | Hooks, typed, any markup, the shadcn default |
| Bundle size | 4 | 29.9 KB gz with Virtual |
| Licence & health | 5 | MIT, release 9.3.1 on 12 October 2026 (9.0.0 on 4 August 2026) |
