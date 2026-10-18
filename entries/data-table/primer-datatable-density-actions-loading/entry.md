---
title: Product data table with density modes, one default sort, row actions and a skeleton loading state
pattern: data-table
page_type: app
tags: [dense, devtools, b2b, accessible]
source_url: https://primer.style/product/components/data-table/
source_site: primer.style
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 5
why_it_works: GitHub's own table rules are spelled out and shown live: always one sorted column, density as a prop, at most one action pulled out of the overflow menu, and a skeleton that keeps the column layout while loading.
use_when: Product tables in dense app UI (repositories, users, invoices, jobs), especially when deciding row-action placement and loading states.
has_example: false
---

## What it is
GitHub Primer's DataTable docs, captured live: the sortable example (Updated column sorted by default), the density
example (spacious), the three row-action layouts, and the skeleton loading state.

## Key techniques
- Compact type: 12px cells, 12px/600 headers, ~37px rows at normal density; bold repository name as the row header.
- Density as one prop: condensed / normal (default) / spacious cell padding.
- Sorting rule: "If a table is sortable, one column must be sorted by default"; clicking a sorted column toggles
  direction, unsorted columns start ascending. Sort icon sits after the label (`Updated ⇅`), `aria-sort="descending"`.
- Row actions: put several actions in a `…` menu; pull out at most **one** frequent action inline (pencil + `…`).
  Inline icon pairs (edit, delete) only when there are two actions.
- Loading: `Table.Skeleton` keeps the title, header row and 10 rows of shimmer bars sized to each column, so nothing
  shifts when data arrives.
- Title and optional subtitle above the table, labelled by `aria-labelledby`.

## Accessibility
- Semantic table with a row header (`rowHeader: true`) and `aria-sort` on the sorted column.
- Icon-only row actions need accessible names (the docs' examples use labelled IconButtons; verify in your build).
- Primer has a separate Accessibility tab for DataTable; the component is marked Experimental.

## Weaknesses
- Marked Experimental in Primer React; treat it as a design reference, not a dependency for our stack.
- No selection or bulk actions in these examples.

## Related entries
- `data-table/govuk-numeric-semantic-table`, `data-table/mui-x-checkbox-selection-count`, `data-table/ag-grid-dense-grid-column-menus`, `feedback/sonner-stacked-toasts`.
