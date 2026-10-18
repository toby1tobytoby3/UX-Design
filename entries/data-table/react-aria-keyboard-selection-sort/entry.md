---
title: Keyboard-first selectable table with disabled rows and a sortable header
pattern: data-table
page_type: app
tags: [accessible, keyboard, selection, open-source]
source_url: https://react-aria.adobe.com/Table
source_site: react-aria.adobe.com
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 4
why_it_works: Arrow keys move between cells, skip disabled rows and Shift extends selection, with a clear 2px focus ring on the selected row, which is the APG grid keyboard model done properly in a small semantic table.
use_when: Moderate-size tables in app UI where keyboard users must select, sort and act on rows; the reference for how selection and focus should behave.
has_example: false
---

## What it is
React Aria Components' Table docs, captured live. In the multi-select example ("Favorite pokemon") a cell was clicked,
then ArrowDown and Shift+ArrowDown pressed: focus skipped the disabled Venusaur row and landed on Pikachu, now selected.
The sorting example was captured after clicking the Name header (sorted descending).

## Key techniques
- Disabled rows render at reduced opacity and are skipped by the keyboard (`disabledKeys`).
- Selected row: solid purple fill with white text; the focused cell inside it gets a **2px white outline**.
- Header checkbox shows indeterminate for partial selection; a live "Current selection: pikachu" line under the table.
- Sorted header gets a tinted background, coloured label and a chevron; `aria-sort="descending"`.
- Unstyled library: every state is a `data-*` attribute (`data-selected`, `data-focus-visible`, `data-disabled`), so these
  styles are the docs' theme, reproducible with Tailwind data variants.

## Accessibility
- `role="grid"` with `aria-multiselectable="true"`, `aria-selected` on rows, `aria-sort` on the sortable column.
- Focus ring visible on the selected (dark) background, which many tables get wrong.
- Selection state is announced; disabled rows are exposed as disabled rather than hidden.

## Weaknesses
- Numbers (Level) are left-aligned; right-align numeric columns.
- Solid purple selection is loud for multi-row selection in dense tables; a tint plus checkbox scales better.

## Related entries
- `data-table/mui-x-checkbox-selection-count`, `data-table/ag-grid-dense-grid-column-menus`, `accessibility/react-aria-combobox`.
