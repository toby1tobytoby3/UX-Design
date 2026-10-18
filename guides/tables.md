# Tables and data grids

`ux-find` reads this for any table, list-of-records, data grid or spreadsheet-like request. **Step 1** decides table or
grid. **Step 2** picks the library from the benchmark in `benchtable/` (same 10,000 rows in every library). **Step 3**
lists defaults. All are starting points: depart when the situation calls for it and say why.

Research behind this guide, with sources: `research/B6-tables.md`. Patterns: `pattern: data-table` in `catalog.json`.
Filter bars and saved views overlap B7 (search and filtering); empty states overlap B8. This guide owns filtering inside a
table's toolbar.

## 1. Table or grid?
| If users… | Use | Why |
|---|---|---|
| Read, sort and open records; act through a row menu or checkbox | **A semantic `<table>`**: `<caption>`, `<th scope>`, sort buttons inside `<th>` | APG: a table "is not an interactive widget"; screen readers already know how to read tables |
| Edit cells, select ranges, copy and paste, or each row holds several widgets | **A grid** (`role="grid"`: one tab stop, arrow keys between cells) | APG: grids are for editable or interactive tabular data; saves dozens of tab stops |

## 2. Library
TABLE_STACK

**Check the edition boundary before you commit** (checked 18 Oct 2026; recheck when upgrading):

| Feature people expect | TanStack Table | AG Grid Community | MUI X Community |
|---|---|---|---|
| Sort, column filters, pagination, selection | ✓ | ✓ | ✓ (single-column sort) |
| Multi-column sort | ✓ | see bench note | Pro (paid) |
| Virtualised rows beyond 100 | ✓ (with TanStack Virtual) | ✓ | **capped at 100** |
| Pinned columns, column reorder | ✓ | ✓ | Pro (paid) |
| Row grouping, aggregation, tree data | ✓ | **Enterprise (paid)** | Pro/Premium (paid) |
| Cell range selection, clipboard copy/paste | ✓ (v9 cell selection) | **Enterprise** | Premium |
| Excel export | (bring your own) | **Enterprise** | Premium |
| CSV export | (bring your own: `papaparse`) | ✓ | ✓ |
| Column menu, set filters, status bar, side bar | (you build them) | **Enterprise** | ✓ / Pro |

Not recommended: **Handsontable** (paid for production), **Glide Data Grid**, **mantine-react-table**,
**material-react-table**, **ReactGrid** (fail the six-month maintenance gate), **exceljs** and npm **xlsx** for export (stale;
use `papaparse` for CSV, `write-excel-file` for typed XLSX).

## 3. Defaults (guidance, not rules)
| Default | Why | When to depart |
|---|---|---|
| **40 px rows** with a 32 / 40 / 48 density toggle saved per user per view; header, toolbar, batch bar and pagination match the row height; 13–14 px text, 12–16 px cell padding | Carbon's default is 40 px; AG Grid 42; mixing heights reads as broken | Ops and trading grids 24–28 px; two-line rows 56–64 px |
| Text left; **numbers, currency and percentages right-aligned (header too) with `tabular-nums`**, fixed decimals per column, units in the header; **empty cells blank**, not "–"; never centre data | Primer and GOV.UK; dashes get read aloud | IDs, phone numbers and years align left as text |
| **Wrap** short-to-medium text; truncate with a tooltip only in fixed-width dense grids, with the full value in the accessible name or detail panel | Primer: truncation is a last resort | Spreadsheet grids clip to one line and expand on demand |
| **Sticky header always**; **freeze the identifier column** (human-readable name) with an edge shadow when there's horizontal scroll; pin row actions right; at most 2 pinned columns per side; CSS `position: sticky` | NN/g: freeze header rows and the identifier | No horizontal scroll: no frozen columns |
| Sort: a meaningful initial order shown in the header; click cycles asc → desc → default; only the active column shows an arrow; **Shift+click adds a secondary sort** with a priority badge; the whole `<th>` is the button | Primer, Carbon, APG sortable table | Rarely sorted grids: sort from the column menu |
| `aria-sort` on the **primary** sort column only, and a polite announcement: "Sorted by Amount, descending" | APG: multiple `aria-sort` has limited value | – |
| Up to ~8 filterable fields: a **filter bar of chips** ("+ Filter", **F**), result count and Clear all; column-header filters only in spreadsheet grids; **saved views** once combinations repeat; **filters, sort and page in the URL** (`nuqs`) | Linear's model; links share the view | Analysts: an AND/OR query builder (B7) |
| **Paginate record tables** (25 rows, 10/25/50/100, "1–25 of 1,234", server-side over ~1,000 rows); **virtualise** above ~300 rows or ~5,000 cells in one view; infinite scroll only for feeds and logs | Pagination keeps landmarks; virtualisation keeps the DOM small | Spreadsheet grids: one virtualised scroll with a row count footer |
| Selection: a checkbox column first; **tri-state** header (current page), then "Select all 1,234 matching"; **Shift+click** ranges; the **batch bar replaces the toolbar** ("3 selected · actions · Cancel"); **Esc** clears; selection survives paging and says so | Carbon, NN/g; never colour alone for selection (MUI's tint is 1.11:1, `data-table/mui-x-checkbox-selection-count`) | Single choice: radio column or row click |
| Editing: few simple fields **in the cell**, many fields in a **non-modal side panel**. Grid keys: Enter / F2 / typing starts, Esc cancels, Enter commits and moves down, Tab moves right; invalid values keep the cell in edit with a message; **optimistic save** with a pending dot, revert and Retry on failure; ⌘Z undoes | APG grid keys; NN/g on modals hiding context | Bulk or financial edits: "Save changes (12) / Discard" |
| Columns: drag the edge to resize, **double-click auto-fits**, keyboard resize; a "Columns" menu with checkboxes and move up/down, showing "3 hidden"; persist per user per view; Reset and "Save as default" for owners | NN/g: reordering must not depend on drag and drop | Fixed reports: no column controls |
| States: first load keeps header and toolbar with **5–10 skeleton rows** matching column widths; refetch keeps old rows dimmed with a thin progress bar; empty-of-data vs **no results** ("No issues match these filters" + Clear filters); errors inline with Retry; row or cell failures mark only that row or cell | Primer skeletons; no flash on refetch | Real-time grids: a "Paused / reconnecting" pill |
| Narrow desktop (< 1280 px): hide low-priority columns first, then scroll horizontally with the frozen identifier; < 768 px becomes a list or cards | Primer | Comparison tables keep the scroll |
| Grid accessibility: a name (`<caption>` or `aria-label`); row headers; APG keys (arrows, Home/End, Ctrl+Home/End, PageUp/PageDown, no wrap); one tab stop with roving `tabindex`; `aria-selected`; when virtualised **`aria-rowcount` (total incl. headers) and `aria-rowindex` on every rendered row**; a visible cell focus ring at ≥ 3:1 (AG Grid's 1 px border measured 3.12:1, too thin) | APG grid properties | – |
| Export the **current view** as CSV ("Export all N rows" when filtered), server-side over ~50k rows; copy selected cells as TSV | AG Grid and MUI make Excel paid; CSV covers most needs | Finance users: typed XLSX |
| Budget: **INP ≤ 200 ms** for sort, filter, select-all and edit commit on 10k client rows; 60 fps scroll with no blank gaps; ≤ ~1,500 mounted cells; stable row IDs; batch live updates (≥ 100 ms) | web.dev INP; benchmark numbers below | Live market grids: throttle to 4–10 Hz per cell, brief flash on change |

## References
Bench: `benchtable/`. Profiles: `sources/{tanstack-table,ag-grid-community,react-aria-table,mui-x-data-grid,react-data-grid,vtable}`.
Live references: `data-table/primer-datatable-density-actions-loading` (★5), `data-table/govuk-numeric-semantic-table`,
`data-table/react-aria-keyboard-selection-sort`, `data-table/ag-grid-dense-grid-column-menus`, `data-table/mui-x-checkbox-selection-count`.
Logged-in screens to capture (Linear, Airtable, Notion, Stripe, GitHub Projects, Retool): `research/B6-tables.md` §5.
