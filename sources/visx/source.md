---
title: visx
kind: source
pattern: chart
page_type: dashboard
tags: [data-viz, open-source, react, bespoke]
source_url: https://airbnb.io/visx
source_site: airbnb.io
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 4.0.0
licence: MIT
s_look: 2
s_interact: 3
s_coverage: 4
s_a11y: 2
s_perf: 3
s_react: 5
s_bundle: 5
s_licence: 4
why_it_works: D3's maths as small, unstyled React components (scales, shapes, axes, brush), so you can build a fully custom, on-brand chart in idiomatic React and ship only the pieces you use.
use_when: Signature or bespoke charts where design control matters more than speed of build, inside the React app.
avoid_when: You want finished charts quickly; everything (tooltips, legends, a11y) is assembled by hand.
alternatives: [d3, recharts, observable-plot]
has_example: false
---

## Verdict
**The pick for bespoke charts in React.** It's the lightest React option by far: 38.5 KB gz for four charts
(Recharts is 125 KB). It gives complete design freedom without fighting React for the DOM. The cost is time:
it's a kit of parts, not a charting library.

## Benchmark
All 4 charts built, including a brush-to-zoom overview. **38.5 KB gz for the library** (95.8 KB with React).
SVG. Code: `bench/libs/visx.jsx`, roughly 3× the code of Recharts for the same four charts.

Found in the benchmark:
- Nothing is automatic. Axis domains, label placement and legend layout are all yours, and so are your bugs.
  Our first pass clipped the line and placed donut labels off-canvas.
- No keyboard focus or data descriptions. Accessibility is entirely up to you.
- The `Brush` primitive works well once wired, with a mini overview chart plus a draggable window.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 2 | Unstyled by design; quality depends on your design work |
| Interactivity | 3 | Brush, tooltip, zoom and drag primitives, all wired by hand |
| Coverage | 4 | Shapes for almost anything (heatmap, hierarchy, network, geo); you compose them |
| Accessibility | 2 | Only what you add (we added `role="img"` + `aria-label`) |
| Performance | 3 | SVG; canvas is possible but manual |
| React/Next fit | 5 | Pure React components; SSR-friendly SVG |
| Bundle size | 5 | 38.5 KB gz library cost |
| Licence & health | 4 | MIT; v4.0 June 2026; slower release cadence |
