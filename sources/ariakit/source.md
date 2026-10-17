---
title: Ariakit
kind: source
pattern: ui-primitives
page_type: app
tags: [accessible, open-source, keyboard, react, headless]
source_url: https://ariakit.org
source_site: ariakit.org
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 0.4.42
licence: MIT
s_look: 4
s_interact: 4
s_coverage: 2
s_a11y: 5
s_perf: 3
s_react: 4
s_bundle: 2
s_licence: 4
why_it_works: Low-level, store-driven primitives with excellent keyboard behaviour, best when you want to compose unusual widgets (comboboxes inside menus, nested composites) rather than use ready-made parts.
use_when: Custom composite widgets (command menus, comboboxes with tabs, toolbars) where you need fine control over focus and stores.
avoid_when: You want a ready-made date picker, table, tree or toast, or a 1.0 API with a large team behind it.
alternatives: [react-aria, base-ui, radix-ui]
has_example: false
---

## Verdict
**The most flexible toolkit for custom widgets, not the default.** It passed every check with zero axe violations
and keeps the combobox name while open. But it covers few of the hard components, is still pre-1.0, and is largely
one maintainer's project.

## Benchmark (same four components as every other library)
4/4 components. **29/29 keyboard and ARIA checks**, **0 axe violations**. **53.3 KB gz** for the four components
(React subtracted). Code: `benchui/libs/ariakit.jsx`, 49 lines.

Found in the benchmark:
- The modal dialog does **not** wrap Tab: after the last control, focus leaves to the browser UI (like native
  `<dialog>`), while the page behind stays inert. That deviates from the APG on purpose; it passed our "page behind
  is unreachable" check.
- Combobox filtering is yours to write (a `setValue` callback plus `useMemo`), which is flexible but more code.
- Tabs activate on arrow keys; menus have typeahead and Home/End.

## Coverage of the hard components
| Component | Available |
|---|---|
| Combobox / autocomplete | ✓ `Combobox` (also inside menus and selects) |
| Date and time pickers | ✗ |
| Toast | ✗ |
| Tree | ✗ |
| Table | ✗ |
| Drag and drop | ✗ |
| Also | Select, menubar, toolbar, hovercard, tooltip, composite and focus-trap building blocks |

## Styling with Tailwind
State is exposed through `aria-*` and `data-active-item`, `data-focus-visible`, `data-enter`/`data-leave`. The
`render` prop composes your own element. Workable with Tailwind, but less uniform than Headless UI or Base UI.

## Weaknesses
- Pre-1.0 (0.4.x) and largely maintained by one person.
- Few ready-made hard components; you build filtering and lists yourself.
- Tab leaving the dialog surprises people who expect APG wrapping.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Styling ergonomics | 4 | `data-active-item`, `data-focus-visible`, `render` prop |
| Interactivity | 4 | Positioning, typeahead, nested menus, enter/leave states |
| Coverage | 2 | 1 of 6 hard components (combobox) |
| Accessibility | 5 | 29/29 checks, 0 axe violations, keeps the combobox name while open |
| Performance | 3 | No virtualisation (not benchmarked) |
| React/Next fit | 4 | Typed; store hooks are more verbose than part-based APIs |
| Bundle size | 2 | 53.3 KB gz for the four components |
| Licence & health | 4 | MIT, frequent releases (14 October 2026), but pre-1.0 and one main maintainer; ~1.4M weekly downloads |
