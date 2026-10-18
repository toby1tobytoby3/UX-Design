---
title: react-resizable-panels
kind: source
pattern: panels
page_type: app
tags: [accessible, open-source, keyboard, react, resizable]
source_url: https://react-resizable-panels.vercel.app/
source_site: react-resizable-panels.vercel.app
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: 4.14.5
licence: MIT
s_look: 3
s_interact: 5
s_coverage: 3
s_a11y: 5
s_perf: 5
s_react: 5
s_bundle: 4
s_licence: 5
why_it_works: Split panes that follow the WAI-ARIA window splitter (focusable separator with values, arrows, Home/End, Enter to collapse), with a 10 px minimum grab area, double-click reset and a persistence hook that restores without a visible jump.
use_when: Default for any fixed set of resizable regions (sidebar, list-detail-inspector, chat-artefact, preview over timeline), and through shadcn's Resizable, which wraps it.
avoid_when: Users must move, tab, float or pop out views (use a docking library), or rearrange dashboard tiles (react-grid-layout).
alternatives: [allotment, flexlayout-react, dockview, react-grid-layout]
has_example: false
---

## Verdict
**The default for split panes.** It is the only library in the benchmark that passed every check (12/12), with no
axe violations, and the persisted layout came back on the first painted frame. It does one model, split panes (plus a
fixed 2-D `Grid`), so docking workbenches need something else.

## Benchmark (same three-pane workspace as every other library, `benchpanels/`)
**12/12 checks**, **0 axe violations**, **20.0 KB gz** (React and the shared panes subtracted). Code:
`benchpanels/libs/react-resizable-panels.jsx`, 20 lines.

Found in the benchmark:
- **Grab area 11 px** (−5 to +5 around a 1 px line), measured by dragging from every pixel offset. The rendered
  separator is 0 px wide; the library hit-tests the pointer itself (`resizeTargetMinimumSize`, 10 px fine / 20 px coarse).
- Keyboard: reached with Tab; `role="separator"`, `aria-valuenow/min/max` (in percent), `aria-controls` = the Explorer
  pane. ArrowRight moved 72 px (5 % of the group), Home collapsed (the pane is `collapsible`), End went to the 480 px
  max, Enter collapsed and Enter restored. The name comes from the `aria-label` you pass: it renders none by default.
- Double-click reset Explorer from 360 px to its 240 px default.
- `useDefaultLayout({ id, storage: localStorage })` restored 360 px **on the first painted frame**, CLS 0. Cookie storage
  is documented for server rendering.
- Dragging the sash 240 px over 60 frames while both affected panes redrew a 20,000-point canvas: p95 frame 16.8 ms.
  Every library tied here, so performance doesn't separate them.

## Weaknesses
- Unstyled: you draw the line, hover and focus states (shadcn's `Resizable` does it for you).
- No tabs, docking, floating or pop-outs.
- Pass `aria-label` on each `Separator`: without it the separator has no name.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Styling ergonomics | 3 | Headless; `data-separator` state attribute and `className`; shadcn `Resizable` gives a ready skin |
| Interactivity | 5 | Drag, keyboard, collapse, double-click reset, persistence, all built in |
| Coverage | 3 | Split panes and a fixed 2-D grid; no docking or user-arranged tiles |
| Accessibility | 5 | 12/12 checks including the full APG window-splitter keyboard model; 11 px grab area; 0 axe |
| Performance | 5 | Restores on the first frame (CLS 0); 60 fps drag with heavy panes; SSR cookie storage |
| React/Next fit | 5 | React components and hooks; server-rendering examples |
| Bundle size | 4 | 20.0 KB gz |
| Licence & health | 5 | MIT; release 12 Oct 2026; ~19.7M weekly downloads |
