---
title: Base UI
kind: source
pattern: ui-primitives
page_type: app
tags: [accessible, open-source, keyboard, react, headless]
source_url: https://base-ui.com
source_site: base-ui.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 1.9.0
licence: MIT
s_look: 5
s_interact: 5
s_coverage: 3
s_a11y: 4
s_perf: 3
s_react: 5
s_bundle: 1
s_licence: 5
why_it_works: Unstyled components from the people behind Radix, Floating UI and Material UI, with a consistent part-based API, data-* state for Tailwind and a broader set than Radix (combobox, autocomplete, toast, drawer, number field).
use_when: A Radix-style API that also needs a combobox, autocomplete or toast, maintained by a funded team (MUI).
avoid_when: Bundle size matters most (heaviest tested), or you need date pickers, tables or trees today.
alternatives: [react-aria, radix-ui, ariakit]
has_example: false
---

## Verdict
**The strongest Radix successor, with a combobox caveat.** Clean API, excellent styling hooks, monthly releases since
1.0 (December 2025). It passed 28 of 29 checks; the combobox loses its name while open, and it was the heaviest
library tested.

## Benchmark (same four components as every other library)
4/4 components. **28/29 keyboard and ARIA checks**, **1 axe violation**. **84.2 KB gz** for the four components
(React subtracted), imported per component (`@base-ui/react/dialog` etc.). Code: `benchui/libs/base-ui.jsx`, 59 lines.

Found in the benchmark:
- **The combobox loses its accessible name while the list is open**, the same issue as Headless UI: the visible
  `<label>` is `aria-hidden` while open, so Chrome reports an empty name.
- `Combobox.Label` only labels a `Combobox.Trigger`. With `Combobox.Input` you need a native `<label>`; the
  development build warns about this, but the wrong version looks fine.
- Tabs use **manual activation** by default (arrows move focus, Enter or Space selects). The APG allows both.
- The dialog moves focus back inside one tick after Tab (Floating UI focus guards); users won't notice.
- The combobox filters `items` for you.

## Coverage of the hard components
| Component | Available |
|---|---|
| Combobox / autocomplete | ✓ `Combobox`, `Autocomplete` |
| Date and time pickers | ✗ (temporal internals are present; no picker exported yet) |
| Toast | ✓ `Toast` |
| Tree | ✗ |
| Table | ✗ |
| Drag and drop | ✗ |
| Also | Drawer, number field, OTP field, menubar, navigation menu, context menu, select, slider, meter, scroll area |

## Styling with Tailwind
State as `data-*` (`data-highlighted`, `data-selected`, `data-open`, `data-starting-style`/`data-ending-style` for
transitions), plus a `className` function that receives state and a `render` prop. As easy as Headless UI.

## Weaknesses
- Heaviest tested: 84.2 KB gz for four components.
- The combobox name issue and the `Combobox.Label` pitfall above.
- No date picker, table or tree yet.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Styling ergonomics | 5 | `data-*` state, `className` functions, `render` prop |
| Interactivity | 5 | Floating UI positioning, typeahead, transition states, submenus |
| Coverage | 3 | 2 of 6 hard components (combobox, toast) |
| Accessibility | 4 | 28/29 checks; combobox loses its name while open (1 axe violation) |
| Performance | 3 | No built-in virtualisation (not benchmarked) |
| React/Next fit | 5 | Typed part-based components, `render` prop |
| Bundle size | 1 | 84.2 KB gz for the four components |
| Licence & health | 5 | MIT, MUI team, 1.0 in December 2025, 1.9.0 on 9 October 2026; ~17M weekly downloads |
