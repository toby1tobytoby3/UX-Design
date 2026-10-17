---
title: Radix Primitives
kind: source
pattern: ui-primitives
page_type: app
tags: [accessible, open-source, keyboard, react, headless]
source_url: https://www.radix-ui.com/primitives
source_site: radix-ui.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 1.8.1
licence: MIT
s_look: 4
s_interact: 5
s_coverage: 2
s_a11y: 5
s_perf: 3
s_react: 5
s_bundle: 4
s_licence: 5
why_it_works: The most widely used headless primitives, with clean asChild composition and solid keyboard behaviour for overlays, menus and tabs at the lowest weight tested.
use_when: Overlays, menus, tabs, tooltips and toasts where you don't need a combobox, date picker, table or tree, and small bundle matters.
avoid_when: You need a combobox, date picker, data table, tree or drag and drop: Radix has none of them, so you'd mix libraries.
alternatives: [react-aria, base-ui, ariakit]
has_example: false
---

## Verdict
**Best for the common overlays at the lowest weight.** Every check it could run passed, and it's the lightest tested.
But it has no combobox, date picker, table or tree, so a data-heavy app ends up mixing libraries. For a new app
that needs those, React Aria or Base UI cover more with one API.

## Benchmark (same four components as every other library)
3/4 components: **no combobox** (Select has no text filtering). **23/23 keyboard and ARIA checks** for the three it has,
**0 axe violations**. **33.8 KB gz** for three components (React subtracted), so not directly comparable with the
four-component totals. Code: `benchui/libs/radix-ui.jsx`, 40 lines.

Found in the benchmark:
- Tabs use a roving tab stop on the tab list: Tab lands on the selected tab, the next Tab leaves. Arrow keys move
  focus one tick later (in a timeout), which a test must wait for but a user won't notice.
- The dialog warns in development if `Description` is missing, a useful nudge toward described dialogs.
- Menus support typeahead, Home/End and return focus to the trigger on Escape.

## Coverage of the hard components
| Component | Available |
|---|---|
| Combobox / autocomplete | ✗ (pair with cmdk or another library) |
| Date and time pickers | ✗ |
| Toast | ✓ `Toast` |
| Tree | ✗ |
| Table | ✗ |
| Drag and drop | ✗ |
| Also | Select, slider, navigation menu, menubar, context menu, toolbar, tooltip, hover card; OTP and password fields (unstable) |

## Styling with Tailwind
State is exposed as `data-state` (`open`/`closed`, `active`/`inactive`) and `data-highlighted`, which Tailwind's
`data-[state=open]:` variants target directly. `asChild` lets you render your own element. One attribute carries
several states, so selectors are a little more verbose than Headless UI's.

## Weaknesses
- No combobox, date picker, table, tree or drag and drop.
- One `data-state` attribute holds several states, so Tailwind selectors are wordier.
- Screen-reader output was not tested, only Chrome's accessibility tree.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Styling ergonomics | 4 | `data-state` / `data-highlighted`, `asChild` |
| Interactivity | 5 | Floating positioning, typeahead, presence for exit animations, submenus |
| Coverage | 2 | 1 of 6 hard components (toast) |
| Accessibility | 5 | 23/23 checks, 0 axe violations (combobox not available to test) |
| Performance | 3 | No virtualisation (not benchmarked) |
| React/Next fit | 5 | Typed React components, `asChild` composition, the most widely adopted |
| Bundle size | 4 | 33.8 KB gz for three components |
| Licence & health | 5 | MIT, WorkOS, release on 14 October 2026; ~17M weekly downloads (`radix-ui`) |
