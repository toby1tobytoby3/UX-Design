---
title: Headless UI
kind: source
pattern: ui-primitives
page_type: app
tags: [accessible, open-source, keyboard, react, headless]
source_url: https://headlessui.com
source_site: headlessui.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 2.2.10
licence: MIT
s_look: 5
s_interact: 3
s_coverage: 2
s_a11y: 4
s_perf: 3
s_react: 4
s_bundle: 2
s_licence: 4
why_it_works: Tailwind Labs' small set of unstyled components whose data-* state attributes map one-to-one onto Tailwind variants, so styling is the easiest of any library tested.
use_when: Simple Tailwind apps that need a dialog, menu, listbox, combobox or tabs and nothing harder.
avoid_when: You need date pickers, tables, trees, toasts, submenus or tooltips, or a combobox that keeps its accessible name while open.
alternatives: [react-aria, base-ui, radix-ui]
has_example: false
---

## Verdict
**The easiest to style, but the smallest set and slower releases.** It passed 28 of 29 checks; the miss is real (see
below). Good for a simple Tailwind app; for an app that will grow, React Aria or Base UI cover far more.

## Benchmark (same four components as every other library)
4/4 components. **28/29 keyboard and ARIA checks**, **1 axe violation**. **57.5 KB gz** for the four components
(React subtracted). Code: `benchui/libs/headless-ui.jsx`, 57 lines.

Found in the benchmark:
- **The combobox loses its accessible name while the list is open.** Opening it marks everything outside the input
  and list `inert` and `aria-hidden`, including the visible `<label>`. Chrome's accessibility tree then reports an
  empty name for the input, and axe flags `label`. React Aria and Ariakit keep the name.
- Typing in the combobox highlights the first match at once, so ArrowDown moves to the second.
- Dialog, menu and tabs passed everything; tabs activate on arrow keys.

## Coverage of the hard components
| Component | Available |
|---|---|
| Combobox / autocomplete | ✓ `Combobox` (you filter the list yourself) |
| Date and time pickers | ✗ |
| Toast | ✗ |
| Tree | ✗ |
| Table | ✗ |
| Drag and drop | ✗ |
| Also | Listbox, popover, disclosure, radio group, switch, form fields. No submenus, tooltip or context menu |

## Styling with Tailwind
The best fit: `data-focus`, `data-hover`, `data-active`, `data-selected`, `data-open`, `data-closed` are designed for
Tailwind's `data-*` variants, and `anchor="bottom start"` handles positioning.

## Weaknesses
- The combobox name issue above.
- Smallest component set; no submenus or tooltips.
- Releases have slowed: 2.2.10 on 7 April 2026, the first in six months.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Styling ergonomics | 5 | `data-*` states built for Tailwind variants |
| Interactivity | 3 | Anchor positioning and transitions, but no submenus, tooltip or context menu |
| Coverage | 2 | 1 of 6 hard components (combobox) |
| Accessibility | 4 | 28/29 checks; combobox loses its name while open (1 axe violation) |
| Performance | 3 | No virtualisation (not benchmarked) |
| React/Next fit | 4 | Simple typed components; small API |
| Bundle size | 2 | 57.5 KB gz for the four components |
| Licence & health | 4 | MIT, Tailwind Labs; last release 7 April 2026; ~7.4M weekly downloads |
