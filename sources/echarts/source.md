---
title: Apache ECharts
kind: source
pattern: chart
page_type: dashboard
tags: [data-viz, open-source, interactive, dashboard, large-data]
source_url: https://echarts.apache.org
source_site: echarts.apache.org
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 6.1.0
licence: Apache-2.0
s_look: 3
s_interact: 5
s_coverage: 5
s_a11y: 3
s_perf: 5
s_react: 3
s_bundle: 2
s_licence: 5
why_it_works: The broadest free charting engine: 23 chart families, wheel and slider zoom, morphing transitions, decal textures and canvas rendering for very large data, all from one declarative options object.
use_when: Data-heavy dashboards that need zoom, drill-down, live updates, large datasets or specialist charts (sankey, heatmap, candlestick, treemap, geo).
avoid_when: A page needs only a few simple charts (205 KB gz even tree-shaken), or the team wants charts as composable JSX.
alternatives: [recharts, ag-charts, uplot, visx]
has_example: false
---

## Verdict
**The pick for rich, interactive, data-heavy dashboards.** It's the highest-scoring library overall: nothing free matches its
breadth plus interactivity plus large-data performance. You pay for that in weight, in an imperative API, and in
defaults you must fix (colours, screen-reader text, time-axis labels).

## Benchmark (same four charts as every other library)
All 4 charts drawn natively, including zoom. **205 KB gz** tree-shaken to just these charts via `echarts/core`
(the full build is 360 KB gz). SVG renderer in the benchmark; canvas available. Code: `bench/libs/echarts.js`.

Found in the benchmark:
- Time-axis labels collide at default density ("29Aug" overlap). Set `axisLabel.hideOverlap` or fewer ticks.
- `aria.enabled` writes a description, but it reads raw timestamps aloud ("1782777600000, 1136…"). Supply `aria.label.description`.
- No keyboard focus on data points (0 focusable elements).
- v6 default palette passes colour-blind separation but fails contrast (6 of 9 below 3:1). v5's failed both. Always pass `color`.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Clean chrome, but colliding time labels and a low-contrast default palette |
| Interactivity | 5 | Inside + slider zoom, axis tooltips, legend toggling, `universalTransition` morphs (see pattern entries) |
| Coverage | 5 | 23 chart modules in the package: line, bar, pie, scatter, boxplot, heatmap, candlestick, parallel, radar, graph, chord, sankey, lines, tree, treemap, sunburst, funnel, gauge, themeRiver, map, custom… |
| Accessibility | 3 | Auto description and decal textures, but the description is raw data and there's no keyboard navigation |
| Performance | 5 | Canvas renderer, progressive rendering and sampling for large series |
| React/Next fit | 3 | Imperative `init`/`setOption` in an effect, client-only, needs a wrapper. Types included |
| Bundle size | 2 | 205 KB gz for four charts, tree-shaken |
| Licence & health | 5 | Apache-2.0, Apache Software Foundation, v6.1 in 2026 |

## Patterns in our library from this source
- `chart/echarts-datazoom-time-series`: zoom + slider overview (★★★★★)
- `chart/echarts-universal-transition-morph`: bar ↔ donut morph (★★★★)
- `chart/echarts-aria-decal-patterns`: accessibility textures (★★★★)

## Using it in our stack
Import from `echarts/core` plus only the charts and components you use (see the benchmark file), init in a
`"use client"` component, `dispose()` on unmount, resize via `ResizeObserver`, pass our validated `color` array,
and write `aria.label.description` yourself.
