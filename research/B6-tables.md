# B6. Tables and data grids: research notes

Research for row B6 of `research/categories.md`: tables and data grids in desktop web apps (record lists, admin tables,
spreadsheet-like grids, live grids). Researched 2026-10-18 for our stack: React/Next + Tailwind, with shadcn/ui allowed as
copy-in code. The same-task benchmark (`benchtable/`: TanStack Table + Virtual, AG Grid Community, React Aria Table, MUI X
DataGrid, react-data-grid, VTable) is being built in parallel, so this file doesn't benchmark anything. Early captures are in
`entries/data-table/*` (not yet catalogued).

Evidence key (same as E6): **[V]** checked today (npm, curl, page text, package source). **[D]** from a vendor's own docs,
fetched today. **[M]** from memory or product observation, not re-verified today.

---

## 0. Headline findings
1. **"AG Grid Community for a full grid" overstates what's free** [V, doc front-matter `enterprise: true`]. These are all
   Enterprise: row grouping, aggregation, pivoting, tree data, master/detail, the server-side row model, **cell range selection,
   the clipboard, Excel export**, the set, multi and advanced filters, **the column menu** (*"AG Grid Community does not have a
   menu"*), the context menu, side bar and tool panels, the status bar, the fill handle, batch editing, find, formulas and row
   numbers. Community does include sorting, column filters, pagination, the infinite row model, row selection, cell and full-row
   editing, undo/redo of edits, CSV export, column pinning, moving and sizing, and row pinning.
2. **AG Grid's own pages disagree on multi-sort** [V]. The edition page lists *"Row Grouping & Multi-Column Sorting"* under
   Enterprise, but the Row Sorting page has no Enterprise flag and documents Shift+click multi-sort. The bench should settle it.
3. **MUI X Community (MIT) has two hard caps** [V docs]. Row virtualisation is *"limited to 100 rows"*, and pages are
   *"limited to … up to 100 rows"*. Multi-sort, column pinning, column reordering, header filters, tree data and lazy loading
   need **Pro**. Row grouping, aggregation, pivot, Excel export, cell selection, clipboard paste and undo/redo need **Premium**.
4. **TanStack Table v9 is current** (9.0.0 shipped 2026-08-04; latest 9.3.1) [V]. shadcn/ui's Data Table recipe is now written
   against v9 (*"TanStack Table v9 is feature-based"*) [V]. v8-era blog posts and copies of the shadcn recipe need migrating. The v9
   examples now include `cell-selection` and an experimental `spreadsheet`.
5. **There are two clear categories of semantics.** APG says a table *"is not an interactive widget"*, and the grid pattern
   is *"particularly useful if the tabular information is editable or interactive"* [V]. Primer: *"Use a data grid if the primary
   purpose is to edit or otherwise interact with the cells"* [V]. VTable (canvas) ships **no grid ARIA at all**: its package has
   only `aria-hidden` [V source grep]. react-data-grid ships `aria-rowcount`, `aria-rowindex`, `aria-colindex`, `aria-sort` and
   `aria-selected` [V].
6. **Desktop density has converged on 40 px.** Carbon now makes **md 40 px the default** (xs 24, sm 32, lg 48, xl 64) [V]. AG Grid
   Quartz uses 42 px [V]. MUI uses 52 px (compact ×0.7 ≈ 36, comfortable ×1.3 ≈ 68) [V source]. Airtable defaults new views to
   **Short**, its densest setting [V].

---

## 1. Topics the guide must answer
1. **Table or grid?** When you need cell focus, editing, range selection or copy, and when a semantic `<table>` with buttons is better.
2. **Density and row height:** the default, the toggle, how header, toolbar and pagination heights pair with it, and multi-line rows.
3. **Alignment and number formatting:** right-aligned numbers, tabular numerals, units, empty cells and truncation versus wrapping.
4. **Sticky header and frozen columns:** what to freeze, how many, and the edge shadow.
5. **Sorting:** the default order, the click cycle, the indicator, multi-sort priority, and the screen-reader announcement.
6. **Filtering:** column filters vs a filter bar vs saved views; filters in the URL; result counts and Clear all.
7. **Pagination vs Load more vs infinite scroll vs virtualisation:** row and cell thresholds, and server versus client.
8. **Row selection and bulk actions:** the checkbox column, Shift-range, "select all N", the batch bar, and selection across pages.
9. **Editing:** inline vs side panel, the keyboard model, validation, optimistic save, conflicts and undo.
10. **Column layout:** resize (including by keyboard), reorder, hide, pin, and saving layouts per user or per workspace view.
11. **States inside the table:** first load, refetch, empty vs no results, errors (whole table, row or cell), and stale data.
12. **Narrow desktop widths (1024–1280 px)** and the hand-off to a list or cards on mobile.
13. **Accessibility:** caption and label, row headers, the APG grid keyboard model, `aria-rowcount`/`rowindex` when virtualised, and sort announcements.
14. **Export and copy:** what gets exported (the current view or everything), CSV vs XLSX, and TSV copy to a spreadsheet.
15. **Performance budgets:** INP for sort, filter and select; scroll frame time; DOM size; live-update batching.

---

## 2. Recommended defaults
| Topic | Default | Why (source) | Depart when |
|---|---|---|---|
| Table vs grid | **Semantic `<table>`** (`<caption>`, `<th scope>`, sort `<button>` in `<th>`) for read-mostly record lists, where the only interactive parts are sort, row link, checkbox and a row menu. **`role="grid"`** (one tab stop, arrow keys between cells) only when users edit cells, select ranges, copy and paste, or rows hold several widgets | APG Table: *"not an interactive widget"*. APG Grid: *"In a grid, every cell contains a focusable element or is itself focusable"* [V]. Primer's "Use a data grid" rule [V]. NN/g's four table tasks: find, compare, view/edit a row, act on records [V] | Many interactive widgets per row in a read-only list: a grid saves dozens of tab stops (APG's reason). Otherwise stay with a table |
| Density | Default **40 px** rows (body = header height). Offer a 3-step toggle: **32 compact / 40 default / 48 comfortable**, saved per user per view. Toolbar, batch bar and pagination match the row height. 13–14 px text, 12–16 px horizontal cell padding | Carbon: md 40 *"default and most commonly used"*; *"Don't mix row heights for the table and header rows"*; toolbar/batch bar/pagination *"should always match the row height"* [V]. AG Grid 42 px [V]. Primer `cellPadding` condensed/normal/spacious [V]. Airtable: Short is the default [V] | Ops and trading grids: 24–28 px (Carbon xs 24). Two-line rows (title + meta): 56–64 px (Carbon xl 64 *"only… two lines"*) |
| Alignment | Text left. **Numbers, currency and percentages right-aligned, header included**, with `tabular-nums` (Tailwind `tabular-nums`). Fixed decimals per column. Units in the header ("Amount (USD)"), not in every cell. Dates in a fixed-width format. Never centre data. Icons and status chips left. **Empty cells blank**, not "–" | Primer: *"Right-align numeric values and use the tabular-num font variant"*; *"Don't use a character like 'x' or '-'"* (screen readers) [V]. GOV.UK: *"When comparing columns of numbers, align the numbers to the right"* (`govuk-table__cell--numeric`) [V] | Identifier-like numbers (IDs, phone numbers, years) align left as text |
| Wrap vs truncate | **Wrap** short-to-medium text. Truncate with an ellipsis plus a tooltip *only* in fixed-width or dense grids, and give the full value in the cell's accessible name or the detail panel | Primer: wrapping *"is the preferred way… because it doesn't hide the content"*; truncation *"as a last resort"* [V] | Spreadsheet grids: clip to one line; the full value shows in the edit or expanded view (Airtable Shift+Space) [V] |
| Sticky / frozen | **Sticky header always** once the table scrolls. **Freeze the identifier column** (first column, a human-readable name) when there's horizontal scroll, with a shadow on its edge. Pin the row-actions column right. At most 2 pinned columns per side. Use CSS `position: sticky`, not a JS sync | NN/g: *"Freeze header rows and header columns"*; the drop shadow helps orientation; the first column *"should be a human-readable record identifier"* [V] | No horizontal scroll: no frozen columns. Multi-pane comparison: let users pin |
| Sort | The initial order is meaningful (**newest first**, or by the task's key) and shown in the header. Clicking a header cycles **asc → desc → (back to default)**. Only the active column shows an arrow; the others show one on hover or focus. **Shift+click adds a secondary sort**, with a small "1 / 2" priority badge. The whole `<th>` is the button | Primer: *"Data should be initially rendered in an intuitive order"* [V]. Carbon: *"Only the sorted column displays an icon, and unsorted icons are only visible on hover"* [V]. AG Grid: Shift is the default multi-sort key [V]. APG sortable table: the button fills the header cell; the sort description goes in the caption [V] | Grids where sort is rarely used: put sort in the column menu only |
| Sort announcements | Set `aria-sort` on **the primary sort column only**. Announce changes in a polite live region: "Sorted by Amount, descending". Describe secondary sorts in that text | APG: *"ARIA does not provide a way to indicate levels of sort… limited value to applying aria-sort… to more than one column"* [V] | – |
| Filtering | **≤ ~8 filterable fields → a filter bar of chips above the table** ("+ Filter", **F** shortcut, field → operator → value), with the result count and **Clear all**. **Column header filters** only in spreadsheet-style grids. **Saved views** (named tabs) once users repeat combinations. Put the **main filters, sort and page in the URL** (`nuqs`) so links share the view | Linear: *"type F"*; *"applied filters are also reflected in the browser URL… opening the link applies the same filters"*; AND/OR advanced builder [D]. MUI header filters are Pro [V]. NN/g: finding records is task #1 [V] | Analysts: an advanced AND/OR builder (overlaps B7 query builders). Personal-only state (density, widths) stays out of the URL |
| Paging model | **Paginate record tables**: start at **25 rows** (10/25/50/100 selector), show "1–25 of 1,234", server-side once data is over ~1,000 rows. **Virtualise** when one view renders more than **~300 rows or ~5,000 cells** (benchtable will tune this). **Infinite scroll** only for feeds and logs. Use **Load more** when order matters and there's a footer | Primer: *"20 rows is a good place to start"*; pagination *"helps with performance"* [V]. AG Grid: 1,000×20 plain DOM rows *"would drastically slow down the web page"*; a 10-row buffer each side [V]. NN/g: infinite scroll lacks *"landmarks"*; Load More is a compromise [V]. Thresholds are our call [M] | Spreadsheet or analyst grids: one virtualised scroll (Airtable, AG Grid) with a row count in the footer. Print or Ctrl+F needs: paginate instead of virtualising |
| Selection and bulk | A checkbox column first. Header checkbox is **tri-state** (selects the current page). After it, show **"Select all 1,234 matching"**. **Shift+click** selects a range. On first selection the **batch bar replaces the toolbar** at the top: "3 selected · actions · Cancel". Disable per-row actions while it's open. **Esc** clears. Keep selection across pages and say so | Carbon: tri-state header; *"batch action bar appears at the top"*; *"single action icons… should be disabled"* [V]. NN/g: batch actions with Select All [V]. "Select all matching" (Gmail) [M] | Single-choice tables: radio column (Carbon) or row click. Linear-style keyboard lists: **x** toggles, bulk bar at the bottom [M] |
| Editing | **Few, simple fields → edit in the cell.** **Many fields, or the user needs context → a non-modal side panel**, never a blocking modal. Grid keys: **Enter / F2 / typing** starts editing, **Esc** cancels, **Enter** commits and moves down, **Tab** commits and moves right. Validate on commit: the cell stays in edit mode with an inline message. **Optimistic save** with a pending dot; on failure revert, mark the cell and offer a toast with Retry. **⌘Z** undoes the last edit | NN/g: modals hide records users refer to; *"Nonmodal panel"* recommended; make edit mode look different [V]. APG: Enter, F2, alphanumeric keys; F2 toggles back [V]. AG Grid undo/redo of edits is Community; MUI undo is Premium [V] | Bulk or financial edits: batch edits with "Save changes (12)" / "Discard" (Retool-style [M]; AG Grid batch editing is Enterprise [V]) |
| Column layout | Drag the header edge to resize; **double-click auto-fits**; resize also works by keyboard. A **"Columns" menu** with checkboxes plus **drag or move-up/down** to reorder, showing "**3 hidden**". **Persist per user per view** (server for shared views, `localStorage` for personal tweaks). Offer "Reset" and, for owners, "**Save as default**" | NN/g: hiding and reordering must be easy *"and accessible for those that don't use drag and drop"*; show the hidden-columns state [V]. React Aria `ColumnResizer` [V]. Linear: personal preferences vs *"Set as default"* for the workspace [D]. MUI save/restore state is Community [V] | Fixed reports: no column controls at all |
| States | **First load:** keep the header and toolbar, show 5–10 **skeleton rows** matching column widths and alignment. **Refetch:** keep the old rows, dim them slightly, and add a thin progress bar (no skeleton flash). **Empty (no data):** an empty state in the body with the primary action. **No results:** "No issues match these filters" plus **Clear filters**. **Error:** an inline message in the body with **Retry**; keep the toolbar and filters. Row or cell failures mark that row or cell only | Primer: skeleton *"should match the real content as closely as possible"*; Blankslate when there's no data [V]. Atlassian dynamic table: highlight the affected row on error [V]. Refetch rule [M] | Real-time grids: show a "Paused / reconnecting" pill rather than blanking |
| Narrow desktop | At **< 1280 px**, hide low-priority columns first (a per-column `priority`), then scroll horizontally with the frozen identifier column. **< 768 px** becomes a list or cards (one record per item), not a squeezed table | Primer: remove less important columns, scroll horizontally [V]. MUI list view (Pro) [V]. NN/g mobile tables [V URL] | Comparison tables where columns are the point: keep the scroll and freeze the first column |
| Accessibility | A table needs a name (`<caption>` or `aria-label`), and row header cells (`<th scope="row">` or MUI `rowHeader`). For grids, **APG data-grid keys**: arrows, Home/End, **Ctrl+Home/End**, PageUp/PageDown, with **no wrap**. One tab stop with a roving `tabindex`. `aria-selected` on selected rows. When virtualised or paged in place: **`aria-rowcount` = the total including header rows** (−1 if unknown) and **`aria-rowindex` on every rendered row**, plus `aria-colcount`/`aria-colindex` for column virtualisation. Show a visible focus ring on the cell | APG Grid keyboard and properties section; `-1` when the count is unknown [V]. AG Grid sets `aria-rowcount`/`aria-rowindex` and recommends `ensureDomOrder`, or switching row virtualisation off and using pagination [V]. React Aria: `keyboardNavigationBehavior="tab"` for cells with inputs [V] | – |
| Export and copy | **Export the current view** (filters, sort, visible columns) as CSV, with "Export all N rows" when filtered. Use the server for over ~50k rows (email or download link). **Copy** selected cells as TSV with headers optional, so they paste into Sheets or Excel | AG Grid: CSV is Community; Excel and clipboard are Enterprise [V]. MUI: CSV/print Community; Excel Premium [V]. Thresholds [M] | Finance users: XLSX with types (`write-excel-file`) |
| Performance budget | **INP ≤ 200 ms** for sort, filter, select-all and edit commit on 10k client rows. Scroll at 60 fps with no blank gaps at normal speed. **≤ ~1,500 mounted cells**. Use stable row IDs and batch live updates (≥ 100 ms) | web.dev INP "good" ≤ 200 ms [V URL]. AG Grid: stable row IDs and transactions for frequent updates (catalogue note [M]). Numbers to be confirmed by `benchtable/` | Live market grids: throttle updates to 4–10 Hz per cell, and flash changes briefly (C6) |

---

## 3. Tools (npm checked 2026-10-18 [V]; "Modified" = `time.modified`, "Released" = the date of the current version)
| Package | Version | Licence | Modified | Released | Best at | React/Next fit and flags |
|---|---|---|---|---|---|---|
| `@tanstack/react-table` | 9.3.1 | MIT | 2026-10-12 | 2026-10-12 (9.0.0: 2026-08-04) | Headless state: sort, filter, facets, grouping, pinning, sizing, selection; v9 adds **cell-selection** and an experimental **spreadsheet** example | Peers `react >=18`. **Our default for owned UI.** No a11y or visual layer: we write the markup (table or grid) |
| `@tanstack/react-virtual` | 3.14.21 | MIT | 2026-10-16 | 2026-10-16 | Row and column windowing for TanStack Table | We must add `aria-rowcount`/`rowindex` ourselves |
| shadcn/ui Data Table (`shadcn` CLI) | 4.22.0 | MIT | 2026-10-18 | 2026-10-18 | Copy-in recipe = **TanStack Table v9** + shadcn Table, Checkbox, DropdownMenu; `/examples/tasks` shows facets, column visibility and selection | Copy-in code, so we own upgrades. Not a separate engine: count it as TanStack |
| `ag-grid-community` / `ag-grid-react` | 36.2.0 | MIT | 2026-09-16 | 2026-09-16 (`v32-lts` 32.3.9) | The most complete free DOM grid: editing, filters, pinning, CSV, row and column virtualisation, ARIA grid/treegrid | Client component. **Enterprise boundary above (§0.1).** Its themes (Quartz 42 px) need re-skinning to match Tailwind tokens |
| `ag-grid-enterprise` | 36.2.0 | **Commercial** | 2026-09-16 | 2026-09-16 | Grouping, pivot, range, clipboard, Excel, SSRM | **Excluded** (catalogue `excluded.csv`). Runs unlicensed only with a watermark and console error [D] |
| `react-aria-components` (Table) | 1.22.1 | Apache-2.0 | 2026-10-09 | 2026-10-09 | The most correct **accessible table/grid**: keyboard, selection, sort, column resizing, drag and drop, `onLoadMore`, `Virtualizer` | Headless and Tailwind-friendly. No editing or filter UI. Moderate datasets |
| `@mui/x-data-grid` | 8.29.5 | MIT | 2026-10-16 | 2026-10-16 (`next` 9.0.0-rc.0) | A finished grid with editing, column groups, quick filter, save/restore state | **Flags:** needs `@mui/material` + Emotion (clashes with Tailwind-only). Community: **100-row virtualisation and page caps**, single-column sort |
| `@mui/x-data-grid-pro` / `-premium` | 8.29.5 | SEE LICENSE (commercial) | 2026-10-16 | 2026-10-16 | Pro: multi-sort, pinning, reorder, tree, lazy load. Premium: grouping, aggregation, pivot, Excel, cell selection, paste, undo | Excluded (paid) |
| `react-data-grid` | **7.0.0-beta.61** | MIT | 2026-07-14 | 2026-07-14 | A lean spreadsheet-style grid (Comcast) with good ARIA (rowcount/rowindex/colindex/sort/selected), copy/paste and editing | **Flags:** in perpetual 7.0 beta; peers **React ^19.2**. Bundles its own CSS. Supabase Studio's table editor uses it [M] |
| `@visactor/vtable` / `react-vtable` | 1.26.8 | MIT | 2026-09-11 | 2026-09-11 | Canvas: very dense list, pivot and Gantt | **No grid ARIA** (only `aria-hidden` in source) [V], so no screen-reader access. 32 MB unpacked. Watch only |
| `handsontable` (+ `@handsontable/react-wrapper`) | 18.1.2 | SEE LICENSE (dual) | 2026-10-16 | 2026-10-07 | Excel-like editing and formulas | **Not free for commercial use**: non-commercial use is *"strictly personal or solely for evaluation"*; *"you can't enter the production stage"* [V LICENSE.txt + docs]. Exclude |
| `@glideapps/glide-data-grid` | 6.0.3 | MIT | 2026-09-16 | **2024-02-03** (alpha 6.0.4-alpha24: 2025-10-08) | Canvas grid, fast | **Fails the six-month gate**: last commit 2026-01-21 [V git]. Avoid |
| `mantine-react-table` | 1.3.4 | MIT | 2025-02-17 | **2023-11-06** (v2 beta.9: 2025-02-17) | Batteries-included TanStack + Mantine | **Stale**: v2 stuck in beta; last code commit 2025-09-30 (2026-06 only deleted CI) [V git]. Avoid |
| `material-react-table` | 3.2.1 | MIT | 2025-03-01 | 2025-03-01 | The same for MUI | Stale (19 months). Avoid |
| `tabulator-tables` | 6.6.1 | MIT | 2026-09-30 | 2026-09-30 | Vanilla JS, very full-featured and free (grouping, export, clipboard) | No official React wrapper [M]; imperative. Fallback only |
| `@revolist/react-datagrid` | 4.29.0 | MIT | 2026-10-15 | 2026-10-15 | Virtual spreadsheet web component | Pro tier sold separately [M]; web-component styling |
| `@silevis/reactgrid` · `react-datasheet-grid` | 4.1.17 · 4.11.6 | MIT · MIT | 2026-08-31 · 2026-03-03 | 2025-04-16 · 2026-03-03 | Spreadsheet-like React grids | Both over 6 months since release: fail the gate |
| `nuqs` | 2.10.2 | MIT | – | 2026-10-08 | Typed URL state for filters, sort and page in Next | Pairs with TanStack (tablecn uses it [M]) |
| `papaparse` · `write-excel-file` · `exceljs` | 5.7.0 · 4.1.1 · 4.4.0 | MIT ×3 | – | 2026-08-24 · 2026-06-08 · **2023-10-19** | CSV · typed XLSX · full XLSX | `exceljs` is stale; npm `xlsx` 0.18.5 (2022) is stale too (SheetJS ships from its own CDN [M]) |

**Suggested stack:** **TanStack Table v9 + TanStack Virtual**, rendered with shadcn/ui's copied Data Table. Use a semantic
`<table>` for record lists, and our own `role="grid"` layer (APG keys, roving focus, aria counts) where cells are editable.
Use **React Aria Table** when keyboard and screen-reader correctness matters more than features (admin and settings tables).
Use **AG Grid Community** when a brief needs a full editing grid *now* and none of the §0.1 Enterprise features. Check every
"must have" against the matrix first: clipboard and range selection catch people out most. URL state with `nuqs`; CSV with
`papaparse`.

---

## 4. Public reference pages (no login; `curl -sL -A "Mozilla/5.0"` status, 2026-10-18 [V])
| # | URL | Code | The moment | Suggested capture |
|---|---|---|---|---|
| 1 | https://www.tablecn.com/ and https://www.tablecn.com/data-grid | 200 / 200 | shadcn + TanStack **filter bar with three modes** (Plain / Advanced / **Command**), server vs client mode, sort and View menus. `/data-grid` is a **spreadsheet-style grid** with a row-height switcher ("Short"), Add row, and typed cells (status, skills, dates) | `/`: click `button:has-text("Filter")`, add Status = in-progress, screenshot the chip bar and the URL. Switch to "Command". `/data-grid`: click a cell, ArrowRight ×2, Enter, type, Esc, then screenshot the focus and edit states |
| 2 | https://ui.shadcn.com/examples/tasks | 200 | The canonical copy-in data table: faceted Status/Priority filters with counts, the **View** column toggle, checkbox selection ("n of N row(s) selected"), pagination, and a row menu | Tick 3 row checkboxes, open `button:has-text("Status")`, screenshot. Then `button:has-text("View")` |
| 3 | https://tanstack.com/table/latest/docs/framework/react/examples/virtualized-rows (+ `column-pinning-sticky`, `cell-selection`, `spreadsheet`, `filters-faceted`) | 200 each | Virtualised 50k rows with a sticky header; sticky pinned columns with an edge shadow; v9 cell range selection | The demos are **StackBlitz/CodeSandbox embeds** [V], so capture in a real browser or run locally (`npx degit tanstack/table/examples/react/virtualized-rows`). Scroll fast and screenshot; check the DOM row count |
| 4 | https://react-aria.adobe.com/Table | 200 | Keyboard focus moving between cells, row selection (checkbox and highlight behaviours), sortable headers, **column resizing**, drag-and-drop reorder, `keyboardNavigationBehavior="tab"` | Click the first row, press ArrowDown, ArrowRight, Space, screenshot the focus ring. Tab to a `ColumnResizer` and use the arrow keys |
| 5 | https://www.ag-grid.com/example/ (+ `/example-finance/`) | **403 with the bare UA, 200 with a full Chrome UA** [V] | Flagship dense grid; finance demo with **live ticking cells and flashes**. ⚠ It shows Enterprise features (grouping, side bar, range): label any capture "Enterprise" or crop to Community features | Use Playwright's default UA. Shift+click two `.ag-header-cell`s (multi-sort badges); double-click an `.ag-cell` to edit; screenshot. For docs use `https://www.ag-grid.com/<page>.md` (open to agents) |
| 6 | https://mui.com/x/react-data-grid/features/ (+ `/demos/real-time-data/`, `/demos/inventory/`) | 200 | A feature list rendered **as a grid with plan badges**; density selector; header filters; list view | Screenshot the feature grid filtered by "Community". Toolbar → Density → Compact |
| 7 | https://design-system.service.gov.uk/components/table/ | 200 | Plain semantic table: `<caption>`, **right-aligned numeric columns** | Screenshot the "Numbers in a table" example (already in `entries/data-table/govuk-numeric-semantic-table`) |
| 8 | https://primer.style/product/components/data-table/ (+ `/guidelines/`) | 200 | DataTable density (condensed/normal/spacious), row actions, **skeleton loading**, pagination footer | Already captured in `entries/data-table/primer-datatable-density-actions-loading` |
| also | https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/data-grids/ (200; keyboard reference); https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/ (200); https://react.carbondesignsystem.com/?path=/story/components-datatable--default (200; batch bar, sizes); https://comcast.github.io/react-data-grid/ (200; react-data-grid "AllFeatures" demo); https://visactor.io/vtable/demo (200; canvas pivot); https://atlassian.design/components/dynamic-table/examples (200) | | | |

**Failed or weak:** polaris-react.shopify.com (IndexTable) timed out today. spectrum.adobe.com/page/table/ returns 404 (use
react-spectrum.adobe.com/TableView, 200). Airtable Universe (200) shows templates, not a live grid. Linear has no public issue list.

## 5. Logged-in products: screens to capture
| Product | Exact screens |
|---|---|
| **Linear** | (1) The issue list in list layout, grouped by status, with the **Display options** popover open (ordering, grouping, properties, "Set as default"). (2) The **F** filter bar with two chips plus the AND/OR advanced builder. (3) Five issues multi-selected (x / Shift+click) showing the **bulk action bar**. (4) A saved custom view tab and its URL. (5) An empty "No issues match" state |
| **Airtable** | (1) Grid view at the **Short** row height with the frozen primary field and its edge shadow. (2) The row-height switcher menu. (3) A range selection plus the **fill handle** mid-drag. (4) The **summary bar** footer (sum/avg per column). (5) Expanded record (Space). (6) Hide fields menu ("3 hidden fields"). (7) Group + sort + filter toolbar chips |
| **Notion** | A database **table view**: the property header menu (sort, filter, hide, wrap, freeze up to this column), view tabs, an inline filter chip, and calculation footer |
| **Stripe Dashboard** | Payments list: **filter pills** (Date, Amount, Status), right-aligned amounts with currency, the status badges column, the **Export** dialog (columns, date range, timezone), and row click → detail page |
| **GitHub** | (1) Issues list (a semantic list, not a grid: filters in the URL query `is:open label:bug`). (2) **Projects table view**: field sums, group by, slice by, column menus, keyboard cell editing |
| **Retool** | Table component: inline edit with the pending-changes **"Save / Discard"** bar, the column settings panel, server-side pagination, and the row selection → bulk action button |
| **Google Sheets / Excel web** | The reference for range selection, freeze panes, a filter-by-condition menu, and paste from TSV |
| **Supabase Studio** | Table editor (react-data-grid): insert row, edit cell, column header menu, filter and sort chips |

---

## 6. Disagreements with the B6 row (`research/categories.md`, `research/catalogue/`)
1. **"Covers: sorting, grouping, inline edit, virtualised rows, frozen columns" misses the questions briefs actually ask:** density,
   alignment and number formatting, selection plus bulk actions, empty, loading and error states, column hide/reorder/saved layouts,
   export/copy, and the table-vs-grid semantics choice. Add them. Filters and saved views overlap **B7**, and empty states
   overlap **B8**, so say which guide owns what. B6 should own filtering *inside a table toolbar*.
2. **"AG Grid Community for a full grid" (catalogue) needs a caveat in the text, not only a footnote.** Clipboard, range selection,
   the column menu, set filters, Excel export and the status bar (all features users expect from "a grid") are Enterprise (§0.1). And
   **grouping**, listed under B6's "Covers", is paid in both AG Grid and MUI X. Free grouping means TanStack (or Tabulator).
3. **shadcn/ui isn't a separate tool for B6.** Its Data Table is TanStack Table v9 plus copy-in styling. Score it with TanStack and
   list it as the presentation layer.
4. **VTable as a curated B6 tool is too generous.** It's canvas with **no grid ARIA** [V], so it fails the rubric's accessibility
   axis outright. Keep it as "watch / dense pivot only", behind an explicit accessibility waiver.
5. **The shortlist is missing two bench libraries and an avoid list.** Add **MUI X DataGrid** (MIT core, but Material + Emotion and
   100-row caps) and **react-data-grid** (good ARIA, perpetual beta) as profiled sources. Add to `excluded.csv` or the guide's Avoid
   table: **Handsontable** (commercial), **Glide Data Grid**, **mantine-react-table**, **material-react-table**, **ReactGrid**
   (stale), and **exceljs / npm `xlsx`** (stale) for export.
6. **References: Airtable, Linear and Retool are right, but none can be captured without a login.** Add the public ones from §4
   (tablecn, shadcn tasks, TanStack examples, AG Grid finance, GOV.UK, Primer, Carbon), plus Stripe, GitHub Projects and Notion
   for the logged-in set. The catalogue's AG Grid reference URL returns **403 to a bare-UA curl** [V]. Capture scripts need a
   browser UA, or the `.md` docs.
7. **The guide question "Which required features cross a commercial edition boundary?" deserves a table in the guide.** Today's
   AG Grid and MUI X matrices (§0.1, §0.3) should go into `guides/tables.md`, dated, with a recheck rule. The two AG Grid pages
   already disagree on multi-sort.

## Sources
- WAI-ARIA APG: Grid https://www.w3.org/WAI/ARIA/apg/patterns/grid/ ; Table https://www.w3.org/WAI/ARIA/apg/patterns/table/ ; Grid and Table Properties https://www.w3.org/WAI/ARIA/apg/practices/grid-and-table-properties/ ; Sortable table https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/ [V]
- NN/g: Data Tables: Four Major User Tasks https://www.nngroup.com/articles/data-tables/ ; Infinite scrolling https://www.nngroup.com/articles/infinite-scrolling-tips/ ; Mobile tables https://www.nngroup.com/articles/mobile-tables/ [V]
- Carbon Data table usage and style https://carbondesignsystem.com/components/data-table/usage/ , …/style/ [V]
- Primer DataTable guidelines https://primer.style/product/components/data-table/guidelines/ [V]; GOV.UK Table https://design-system.service.gov.uk/components/table/ [V]
- Atlassian Dynamic table https://atlassian.design/components/dynamic-table/usage [V]; React Spectrum TableView (density compact/regular/spacious) https://react-spectrum.adobe.com/TableView [V]; Spectrum design data https://opensource.adobe.com/spectrum-design-data/components/table [D]
- AG Grid (fetched as `.md`): community-vs-enterprise, row-sorting, column-menu, accessibility, dom-virtualisation, row-height under https://www.ag-grid.com/react-data-grid/ [V]
- MUI X: https://mui.com/x/react-data-grid/features/ , /virtualization/ , /pagination/ , /sorting/ , /row-height/ , /accessibility/ [V]
- TanStack Table examples https://tanstack.com/table/latest/docs/framework/react/examples/ ; shadcn Data Table https://ui.shadcn.com/docs/components/data-table [V]
- Linear: https://linear.app/docs/filters , https://linear.app/docs/display-options [D]; Airtable grid view https://support.airtable.com/docs/airtable-grid-view [D]
- Handsontable licence https://handsontable.com/docs/react-data-grid/software-license/ + package `LICENSE.txt` [V]; web.dev INP https://web.dev/articles/inp [V URL]
