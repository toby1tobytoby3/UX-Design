---
title: React Aria Components
kind: source
featured: accessibility/react-aria-combobox
pattern: ui-primitives
page_type: app
tags: [accessible, open-source, keyboard, react, headless]
source_url: https://react-spectrum.adobe.com/react-aria/
source_site: react-spectrum.adobe.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 1.22.1
licence: Apache-2.0
s_look: 5
s_interact: 5
s_coverage: 5
s_a11y: 5
s_perf: 4
s_react: 5
s_bundle: 2
s_licence: 5
why_it_works: Adobe's unstyled components with the most complete accessibility behaviour available, covering the hard components (combobox, date picker, table, tree, drag and drop) that other libraries leave out.
use_when: Default for an app UI in our stack, and the only free choice when you need accessible date pickers, data tables, trees or drag and drop.
avoid_when: A marketing site that needs one dialog and a menu (it is the heaviest per component after Base UI), or a team already standardised on Radix-style asChild composition.
alternatives: [radix-ui, base-ui, ariakit, headless-ui]
has_example: false
---

## Verdict
**The default for app UI.** It passed every keyboard and ARIA check with zero axe violations, it is the only library
with the hard components (date picker, table, tree, drag and drop, colour picker), and its state is easy to style
with Tailwind. The price is weight: 69 KB gz for these four components.

## Benchmark (same four components as every other library)
4/4 components built from the library. **29/29 keyboard and ARIA checks**, **0 axe violations** with each component
open. **68.8 KB gz** for the four components (React subtracted). Code: `benchui/libs/react-aria.jsx`, 47 lines.

Found in the benchmark:
- The combobox keeps its accessible name ("Country") while the list is open: it labels the input with
  `aria-labelledby`, so hiding the rest of the page doesn't remove the name (Headless UI and Base UI lose it).
- The combobox filters `defaultItems` for you; the other libraries make you filter the list yourself (Base UI excepted).
- Tabs activate on arrow keys (automatic activation); the dialog wraps Tab inside it, as the APG describes.
- Menu popovers size themselves to the available space, so a long menu scrolls instead of overflowing.

## Coverage of the hard components
| Component | Available |
|---|---|
| Combobox / autocomplete | ✓ `ComboBox`, `Autocomplete` |
| Date and time pickers | ✓ `DatePicker`, `DateRangePicker`, `Calendar`, `TimeField` |
| Toast | ◐ `UNSTABLE_Toast` (marked unstable) |
| Tree | ✓ `Tree` |
| Table | ✓ `Table` with column resizing, `Virtualizer` for long lists |
| Drag and drop | ✓ `useDragAndDrop` for lists, grids, tables and trees |
| Also | Color picker, number field, tag group, slider, sheet, file drop zone, i18n for 30+ locales (docs) |

## Styling with Tailwind
Every component exposes state as `data-*` attributes (`data-focused`, `data-focus-visible`, `data-selected`,
`data-entering`, `data-exiting`) and accepts a `className` function with render-prop state. Our single stylesheet
styled it as easily as the others. Adobe publishes a Tailwind plugin for the state variants (docs, not tested here).

## Weaknesses
- Weight: 68.8 KB gz for four components, the second heaviest tested.
- Large API surface and its own vocabulary (`onPress`, slots, collections); expect a learning curve.
- Toast is still marked unstable. Screen-reader output was not tested, only Chrome's accessibility tree.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Styling ergonomics | 5 | `data-*` state plus `className` functions; styled by the same CSS as every library |
| Interactivity | 5 | Positioning, typeahead, entering/exiting states, scroll-aware popovers |
| Coverage | 5 | All six hard components (toast unstable) |
| Accessibility | 5 | 29/29 checks, 0 axe violations, keeps the combobox name while open |
| Performance | 4 | Built-in `Virtualizer` (exported; not benchmarked) |
| React/Next fit | 5 | Typed React components; client components in Next |
| Bundle size | 2 | 68.8 KB gz for the four components |
| Licence & health | 5 | Apache-2.0, Adobe, release on 9 October 2026; ~4.9M weekly downloads |
