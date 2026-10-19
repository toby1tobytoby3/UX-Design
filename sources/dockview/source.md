---
title: Dockview (free core)
kind: source
featured: panels/dockview-trading-workspace-docking
pattern: panels
page_type: app
tags: [open-source, react, docking, resizable]
source_url: https://dockview.dev/
source_site: dockview.dev
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: 8.6.0
licence: MIT
s_look: 5
s_interact: 5
s_coverage: 4
s_a11y: 2
s_perf: 4
s_react: 4
s_bundle: 2
s_licence: 4
why_it_works: The most polished free docking engine. Tabs drag between groups with a clear drop overlay, edges split, groups float or pop out into real browser windows, and the layout saves and restores as JSON without a jump.
use_when: A mouse-first workbench with many views and multiple monitors (trading terminal, monitoring console), when pop-outs and polish matter more than keyboard resizing, and you will add the keyboard layer yourself.
avoid_when: A fixed set of regions (use react-resizable-panels), or keyboard access to resizing and docking is a requirement and you can't build it (FlexLayout gets closer for free). Never install dockview-enterprise by accident.
alternatives: [flexlayout-react, react-resizable-panels]
has_example: false
---

## Verdict
**The best free docking UX, with the weakest free accessibility.** In the benchmark it docked a tab into a group,
split to an edge and popped a group into a new window. It also restored the saved layout on the first frame. But its
sashes are 4 px `div`s that can't be focused, and keyboard docking and the F6 keymap are paid (Enterprise). Choose it
for docking only if you'll add separators or commands on top.

## Benchmark (same three-pane workspace as every other library, `benchpanels/`; free `dockview-react` only)
**7/17 checks**, 1 axe violation, **104.2 KB gz** (93.7 KB JS + 10.5 KB CSS). Code: `benchpanels/libs/dockview.jsx`,
28 lines.

Found in the benchmark:
- Docking: dragging the Terminal tab onto the Inspector pane joined that group, and dropping it on the Editor's bottom
  edge made a new group. The drop overlay tints the target (screenshot). Pop-out opened a real window with the pane in
  it, but the free core has **no built-in pop-out button**: we added a 3-line header action calling `addPopoutGroup`.
- Grab area **4 px** (−2 to +1) on `.dv-sash`. The sash isn't focusable and has no `role`, value or name: **0/7
  keyboard checks**.
- No double-click reset on sashes.
- `toJSON` / `fromJSON` restored the layout on the first painted frame (CLS 0).
- No built-in non-drag way to move a tab (Shift+F10 on a tab opens nothing), which WCAG 2.2 SC 2.5.7 asks for.
- axe: `nested-interactive`. The default tab (`role="tab"`) contains a focusable close button.
- Drag with heavy panes: p95 frame 16.8 ms, like every other library.

## Free vs paid (checked 18 Oct 2026, `dockview.dev/docs/overview/licence`)
Free: floating groups, pop-out windows, edge groups, save/restore, ARIA tabs and regions, announcements. Paid
(dockview-enterprise): keyboard docking, the F6/spatial keymap, layout history, pinned and multi-row tabs, auto-hide
edges. A side-effect import of the enterprise package turns them on, so lock it out of `package.json`.

## Weaknesses
- No keyboard resizing in the free core; 4 px sashes.
- The heaviest library tested: 104 KB gz with CSS.
- Client-only DOM engine: render it in a client component and load the layout JSON after mount.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Styling ergonomics | 5 | Ready themes (light, dark, VS, spaced), tabs, drop overlays; CSS variables |
| Interactivity | 5 | Dock to centre and edge, float, pop out, save/restore; no double-click reset |
| Coverage | 4 | Docking, floating, pop-outs, edge groups, and split panes through its gridview; no tiles |
| Accessibility | 2 | Tabs and regions have roles, but 0/7 splitter checks, 4 px sashes, nested-interactive tab, keyboard docking paid |
| Performance | 4 | Restores on the first frame; 60 fps drag; client-only |
| React/Next fit | 4 | `dockview-react` component and API object; client component |
| Bundle size | 2 | 104.2 KB gz |
| Licence & health | 4 | MIT core, open-core with paid features; release 16 Oct 2026; ~256k weekly downloads (React package) |
