---
title: Checkbox row selection with an indeterminate header and a selected-count footer
pattern: data-table
page_type: app
tags: [selection, data-grid, b2b, minimal]
source_url: https://mui.com/x/react-data-grid/row-selection/
source_site: mui.com
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 4
why_it_works: Selection state is shown three ways at once (checked boxes, a tinted row, and "3 rows selected" in the footer), and the header checkbox goes indeterminate, so partial selection is never ambiguous.
use_when: Any table where users act on several rows at once (bulk archive, export, assign); pair the count with a bulk-actions bar.
has_example: false
---

## What it is
MUI X Data Grid (Community, MIT) checkbox-selection demo, captured live after selecting three rows by clicking their
checkboxes. The footer shows "3 rows selected" on the left and pagination ("Rows per page: 100 · 1–10 of 10") on the right.

## Key techniques
- 52px rows (MUI's standard density; compact and comfortable modes exist), 14px text.
- Header checkbox switches to indeterminate (a dash) for partial selection; all-selected shows a check.
- Selected rows get a pale blue tint (`#edf4fb`); the checkbox remains the primary signal.
- Quantity column right-aligned; email values styled as links.
- Selection count lives in the footer next to pagination, so it never shifts the table.

## Accessibility
- `role="grid"` with `aria-multiselectable="true"` and `aria-rowcount`.
- Cell focus shows a 1px `#1976d2` outline (4.6:1 on white); thin but compliant at AA.
- The row tint alone is only 1.11:1 against white, too faint to carry meaning, so it must stay paired with the checkbox (as here).

## Weaknesses
- The count is in the footer, far from the rows on tall tables; a sticky bulk-actions bar above the table that appears on
  selection (with the count and actions) is easier to act on.
- No bulk actions are shown in this demo.

## Related entries
- `data-table/ag-grid-dense-grid-column-menus`, `data-table/react-aria-keyboard-selection-sort`, `data-table/primer-datatable-density-actions-loading`.
