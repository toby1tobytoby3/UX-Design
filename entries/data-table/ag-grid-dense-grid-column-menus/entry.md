---
title: Dense data grid with grouped headers, floating filters, column menus and inline edit
pattern: data-table
page_type: app
tags: [dense, keyboard, interactive, data-grid, b2b]
source_url: https://www.ag-grid.com/example/
source_site: ag-grid.com
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 4
why_it_works: Every column carries its own sort, filter and menu affordances in a compact 42px row, so a 1,000-row dataset stays scannable and directly editable without leaving the grid.
use_when: Spreadsheet-like work over large tables: ops consoles, admin back offices, trading blotters, anything where users sort, filter and edit in place.
has_example: false
---

## What it is
AG Grid's public performance demo (1,000 rows × 22 columns, theme "Quartz"). Two-level grouped headers (Participant,
Game of Choice, Performance), a floating filter row under the headers, a ⋮ menu per column, checkbox selection, a
row-number column, a status bar ("Rows: 1,000 · Selected: 1") and a side panel. Captured live: the grid at rest, the
Language column menu open, keyboard focus moved with arrow keys, and a cell in inline edit after a double-click.

**Edition check:** the row-group drop zone ("Drag here to set row groups"), the Columns/Filters side panel, Pivot Mode,
the Values aggregation chips and the "Group by Language" menu item are **AG Grid Enterprise** (paid). The headers, sort,
text/number floating filters, column menu sort/pin/autosize, checkbox selection and cell editing are in Community (MIT).
Check the edition matrix before relying on any feature shown.

## Key techniques
- Row height 42px, 14px IBM Plex Sans; numbers (Bank Balance) right-aligned with `font-variant-numeric: tabular-nums`,
  negative values in accounting brackets `($2,947)`.
- Header sort shows an arrow before the label (`↑ Bank Bal…`) and sets `aria-sort="ascending"` on the header cell.
- Column menu: Sort Ascending/Descending, Pin Column ▸, Autosize This/All, then column-chooser items, grouped by dividers.
- Floating filter row keeps filtering one click away; the funnel button opens the full filter.
- Inline edit: double-click (or Enter) swaps the cell for an input with the value pre-selected and a 2px focus border;
  the header checkbox turns indeterminate once one row is selected.
- Virtualised: only 21 row elements in the DOM for 1,000 rows.

## Accessibility
- `role="grid"` with `aria-rowcount="1003"` and `aria-colcount="24"`, so screen readers get the full size despite virtualisation.
- Arrow keys move a roving `gridcell` focus. The focus indicator is a **1px** `#2196f3` border: 3.12:1 against white,
  just over the 3:1 minimum and thin (fails the WCAG 2.4.13 area guidance). Use a 2px ring.
- Selected-row tint is very light; selection is also shown by the checkbox, so it isn't colour-only.

## Weaknesses
- Everything visible at once (filters, menus, side panel, drop zone) is heavy for occasional users; hide the side panel by default.
- Several eye-catching features are Enterprise; a team copying this look can accidentally design for paid features.
- The truncated "Bank Bal…" header shows the cost of narrow columns with sort icons.

## Related entries
- `data-table/mui-x-checkbox-selection-count` (selection footer), `data-table/react-aria-keyboard-selection-sort` (keyboard model),
  `data-table/primer-datatable-density-actions-loading` (density and row actions), `data-table/govuk-numeric-semantic-table`.
