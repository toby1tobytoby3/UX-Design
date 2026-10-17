---
title: Apache ECharts
kind: source
pattern: chart
page_type: dashboard
tags: [data-viz, open-source, interactive, accessible, dashboard]
source_url: https://echarts.apache.org
source_site: echarts.apache.org
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 6.1.0
licence: Apache-2.0
score: 8
rating: 4
why_it_works: The broadest free charting engine available: about 23 chart families, zoom, morphing transitions, built-in accessibility textures and smooth rendering of very large datasets, all from one declarative options object.
use_when: Interactive dashboards and data-heavy screens that need specialist charts (sankey, heatmap, candlestick, treemap) or 10k+ points.
avoid_when: A page needs only one or two simple charts (it's heavy), or you want charts written as idiomatic React components.
alternatives: [recharts, visx, observable-plot, highcharts, ag-charts, uplot]
has_example: false
---

## Verdict
**8 / 10. The default pick for rich, interactive dashboards on a free licence.** Nothing else free
matches its combination of breadth, interactivity and large-data performance. The costs are bundle
weight, an imperative (not React-native) API, and default colours you should replace.

## Scorecard
Scored against `guides/source-rubric.md`. Measured or rendered here unless marked.

| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | v6 default palette passes colour-blind separation but fails contrast (6 of 9 colours below 3:1) and has a near-grey slot. The chart chrome is clean. |
| Interactivity | 5 | dataZoom (inside + slider), axis crosshair tooltips, legend toggling, `universalTransition` morphs. All rendered in our pattern entries. |
| Coverage | 5 | 23 chart modules in the npm package (list below), plus geo maps and an extension for 3D. |
| Accessibility | 4 | `aria.enabled` writes a description; `aria.decal` adds textures. No keyboard navigation of individual data points (unverified in v6). |
| Performance | 5 | Canvas renderer, progressive rendering and sampling for large series. 100k+ points is widely reported (not benchmarked here yet). |
| React/Next fit | 3 | Imperative `init`/`setOption` in a `useEffect`, client-only. Needs a small wrapper (or `echarts-for-react`). Types included. |
| Bundle size | 2 | Full build 360 KB gz, "common" 234 KB gz, "simple" 165 KB gz (measured, 6.1.0). Tree-shaking via `echarts/core` can cut this substantially. |
| Licence & health | 5 | Apache-2.0, Apache Software Foundation project, v6.1.0 released 2026. |
| **Score** | **8.0** | Mean 4.0 × 2 |

## Coverage
Chart modules shipped in `echarts@6.1.0` (`lib/chart/`):

| Family | Types |
|---|---|
| Basic | line, bar, pie, scatter, effectScatter, pictorialBar |
| Statistical | boxplot, heatmap, candlestick, parallel, radar |
| Relationship | graph, chord, sankey, lines |
| Hierarchy | tree, treemap, sunburst |
| Other | funnel, gauge, themeRiver, map (geo), custom (draw anything) |

It also ships 37 bundled themes (`echarts/theme/`), e.g. dark variants. None of them is validated by us.

## Patterns in our library from this source
- `chart/echarts-datazoom-time-series`: time series with zoom (★★★★★)
- `chart/echarts-universal-transition-morph`: bar ↔ donut morph (★★★★)
- `chart/echarts-aria-decal-patterns`: accessibility textures (★★★★)

## When to pick it
- Dashboards with several chart types, drill-down, zoom or live updates.
- Specialist charts: sankey, heatmap, candlestick, treemap, geo.
- Large or streaming data.

## When not to
- One or two simple charts on a marketing page: use a lighter library.
- A team that wants charts as composable JSX: use Recharts or visx (profiles pending).
- Server-rendered static charts: it's client-side by default. SSR to SVG is possible but not set up here.

## Using it in our stack
`npm i echarts`, import from `echarts/core` plus only the charts and components you use, init in a
client component, `dispose()` on unmount, resize with `ResizeObserver`, and always pass our validated `color` array.

> Profile built from the npm package (installed and measured), our own renders and search results. The
> official site and examples gallery couldn't be reached from this session, so coverage comes from the package itself.
