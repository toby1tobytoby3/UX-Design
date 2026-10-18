---
title: Allotment
kind: source
pattern: panels
page_type: app
tags: [open-source, react, resizable]
source_url: https://allotment.mulberryhousesoftware.com/
source_site: allotment.mulberryhousesoftware.com
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: 1.20.6
licence: MIT
s_look: 4
s_interact: 3
s_coverage: 2
s_a11y: 1
s_perf: 3
s_react: 4
s_bundle: 4
s_licence: 5
why_it_works: VS Code's split view ported to React, so it looks and drags like the editor out of the box, with snap-to-collapse and double-click reset.
use_when: Rarely; a mouse-only internal tool that wants the VS Code look with no styling work.
avoid_when: Anything that must be keyboard-accessible or show a saved layout without a jump: use react-resizable-panels.
alternatives: [react-resizable-panels]
has_example: false
---

## Verdict
**Not recommended: use react-resizable-panels.** Allotment drags well and is small, but its sashes can't be reached or
moved from the keyboard and have no separator semantics, and a saved layout paints at the wrong size first.

## Benchmark (same three-pane workspace as every other library, `benchpanels/`)
**3/12 checks**, 0 axe violations (the sashes are plain `div`s, so axe has nothing to flag), **11.0 KB gz** including
1.0 KB of CSS. Code: `benchpanels/libs/allotment.jsx`, 19 lines.

Found in the benchmark:
- Grab area **8 px** (−4 to +3), below the 10 px we ask for.
- Keyboard: **0/7**. The sash isn't focusable and has no `role`, value or name.
- Double-click reset Explorer to its 240 px preferred size.
- Persistence through `defaultSizes` + `onChange` restored 360 px, but the **first painted frame showed 300 px**
  before it jumped (CLS 0.73).
- Drag with heavy panes: p95 frame 16.8 ms, like every other library.

## Weaknesses
- No keyboard resizing and no separator semantics, so resizing fails WCAG 2.1.1 (Keyboard).
- Measures after mount, so saved sizes cause a visible jump. The docs say it *"only works in a browser"*
  (`dynamic(…, { ssr: false })` in Next).

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Styling ergonomics | 4 | VS Code look by default; CSS variables for the separator |
| Interactivity | 3 | Drag, snap collapse, double-click reset; no keyboard; persistence is yours to wire |
| Coverage | 2 | Split panes only |
| Accessibility | 1 | 0/7 keyboard checks; 8 px grab area |
| Performance | 3 | 60 fps drag, but CLS 0.73 restoring a saved layout; client-only |
| React/Next fit | 4 | React components; needs `ssr: false` |
| Bundle size | 4 | 11.0 KB gz |
| Licence & health | 5 | MIT; release 12 Oct 2026; ~150k weekly downloads |
