---
title: AG Grid Community
kind: source
pattern: data-table
page_type: dashboard
tags: [data-grid, open-core, editing, virtualised, keyboard, react]
source_url: https://www.ag-grid.com/react-data-grid/
source_site: ag-grid.com
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: ag-grid-community 36.2.0 + ag-grid-react 36.2.0
licence: MIT (Community); Enterprise is commercial
s_look: 5
s_interact: 5
s_coverage: 3
s_a11y: 4
s_perf: 3
s_react: 4
s_bundle: 1
s_licence: 5
why_it_works: The most complete free DOM grid. Sorting (including Shift+click multi-sort), column filters, pinning, resizing, hiding, checkbox selection and cell editing with validation all work from config, with full grid ARIA and APG arrow-key navigation.
use_when: A brief needs a finished editing grid now (admin tools, back-office record grids, ops consoles) and none of the Enterprise features below (range selection, clipboard, grouping, pivot, Excel, column menu, status bar).
avoid_when: Bundle size matters (322 KB gz, the heaviest DOM grid tested), the design must look like the rest of a Tailwind/shadcn app without re-theming, or the "must haves" include anything on the Enterprise list.
alternatives: [react-data-grid, tanstack-table, mui-x-data-grid]
has_example: false
---

## Verdict
**The pick when you need a full editing grid today and can afford the weight.** It passed every layout and edit probe with
native config: a pinned column, Shift+click multi-sort, drag resize, hide, Enter/Esc/Tab editing and blocked invalid values
with an announced message. Keyboard selection scored 4/5, with 0 axe violations. It costs **322 KB gz**, and it's open-core:
clipboard, range selection, the column menu, set filters, grouping, pivot and Excel export are **Enterprise (paid)**. Check every
must-have against the coverage table first.

## Benchmark (same 10,000 rows × 8 columns and four tasks as every kit)
Code: `benchtable/libs/ag-grid-community.jsx`, 42 lines, with only `AllCommunityModule` registered. Timings are at 4× CPU
throttling (median of 3) and are only comparable within this bench.

| Probe | Result |
|---|---|
| Library size (React subtracted) | **322.4 KB gz** (CSS is in the JS) |
| First render / sort Amount / filter Status | 988 ms / 591 ms / 589 ms |
| Scroll (50 wheel steps) | p95 frame gap 183 ms, 11 frames over 50 ms; 33 DOM rows; reaches row 10,000 |
| Semantics | `role=grid`, `aria-rowcount=10001`, `aria-multiselectable` |
| Layout | Sticky header ✓, pinned ID column ✓ (`pinned: 'left'`), drag resize ✓, keyboard resize ✗, hide ✓ (`setColumnsVisible`) |
| **Multi-sort (Shift+click), Community modules only** | **✓ 2 columns sorted, no watermark, no console warning or error.** The edition page lists multi-column sorting under Enterprise, but it works in Community |
| Keyboard selection (APG) | 4/5: Tab in, ↓ and → move between cells, Space selects (`aria-selected`); **Shift+↓ doesn't extend** (range selection is Enterprise) |
| Select all | Header checkbox selects all 10,000; no visible count (the status bar is Enterprise) |
| Edit Amount | Enter opens `agNumberCellEditor`; Enter commits, Esc cancels; Tab commits and moves to the **next editable cell** (Amount on the next row) |
| Invalid value | With `getValidationErrors` + `invalidEditValueMode: 'block'`: value kept, red outline, `aria-invalid`, screen-reader announcement "Enter a number". **No visible text** (tooltip on hover only) |
| axe-core (WCAG 2.2 AA), all four tasks | 0 violations |

## Coverage: free (Community) vs paid (Enterprise)
| Feature | Community (MIT) | Enterprise only |
|---|---|---|
| Sort, multi-sort, column filters (text/number/date) | ✓ | Set, multi and advanced filters |
| Pinning, resize, move, hide columns; row pinning | ✓ | Column menu, side bar, tool panels |
| Row selection with checkboxes | ✓ | Cell range selection, fill handle |
| Cell and full-row editing, validation, undo/redo of edits | ✓ | Batch editing |
| Export | CSV | Excel, clipboard copy/paste |
| Data models | Client-side, pagination, infinite | Server-side row model |
| Structure | – | Row grouping, aggregation, pivot, tree data, master/detail, status bar, formulas, find |

Enterprise runs unlicensed only with a watermark and console error (vendor docs, `research/B6-tables.md` §0.1).

## Styling with Tailwind/shadcn
AG Grid draws its own theme (Quartz by default, 42 px rows). Match a shadcn app through the Theming API's parameters (colours,
font, row height, borders) mapped to our CSS variables, not with Tailwind classes on cells. Custom cell renderers can use
Tailwind freely. Expect a day of theme work before it looks native.

## Weaknesses
- 322 KB gz for the Community modules we registered, ten times react-data-grid.
- Invalid-value feedback is only `aria-invalid` plus an announcement; sighted users see a red outline with no text unless they hover.
- No keyboard column resize. Shift+Arrow range selection, the clipboard and the column menu need Enterprise.
- Users and stakeholders often assume "AG Grid" includes the Enterprise demos they've seen; label captures carefully.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 5 | Finished Quartz theme: headers, filters, checkboxes, pinned shadow |
| Interactivity | 5 | Sort, multi-sort, filter, pin, resize, move, hide, select, edit with validation, all native |
| Coverage | 3 | Free edition: CSV export and infinite model, but no grouping, tree, pivot, master/detail or Excel |
| Accessibility | 4 | Grid ARIA with `aria-rowcount`, 4/5 keyboard, edit keys, 0 axe; no keyboard resize; invalid message not visible |
| Performance | 3 | Mid-pack: 591 ms sort, 589 ms filter, 183 ms p95 scroll gaps at 4× throttle |
| React/Next fit | 4 | `ag-grid-react` component, typed; imperative `api` for most actions; client component |
| Bundle size | 1 | 322.4 KB gz |
| Licence & health | 5 | MIT Community, release 36.2.0 on 16 September 2026; open-core upsell noted above |
