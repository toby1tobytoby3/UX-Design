---
title: Plain semantic table with a caption, row headers and right-aligned tabular figures
pattern: data-table
page_type: docs
tags: [accessible, minimal, editorial]
source_url: https://design-system.service.gov.uk/components/table/numbers/index.html
source_site: design-system.service.gov.uk
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 4
why_it_works: Nothing but structure and typography (a caption, scoped headers, row headers, right-aligned tabular numbers and hairline rules) makes a small numeric table instantly comparable and fully readable by screen readers.
use_when: Read-only comparisons of a few rows (pricing, rates, settings summaries, reports), where a grid component would be overkill.
has_example: false
---

## What it is
GOV.UK Design System "numbers in a table" example, captured live with the table's HTML and computed styles
(`source.html`, `styles.json`).

## Key techniques
- `<caption>` as the visible title ("Months and rates", 24px bold).
- Column headers `<th scope="col">`, row headers `<th scope="row">` in bold, so each value is announced with its month and column.
- Numeric cells use `govuk-table__cell--numeric`: `text-align: right` and `font-variant-numeric: tabular-nums`, so
  £85 / £165 line up by digit. Numeric headers are right-aligned to match.
- 19px text, 10px vertical padding, 20px gap between columns, one 1px `#cecece` rule under each row; no zebra, no borders between columns.

## Accessibility
- Native table semantics with caption and scopes: the best possible screen-reader experience, no ARIA needed.
- Row rules are decorative (1.57:1), which is fine because structure, not borders, carries the meaning.

## Weaknesses
- No sorting, density control or overflow handling; wide tables need a scroll container with a focusable, labelled region.

## Related entries
- `data-table/primer-datatable-density-actions-loading`, `data-table/react-aria-keyboard-selection-sort`, `accessibility/govuk-error-summary`.
