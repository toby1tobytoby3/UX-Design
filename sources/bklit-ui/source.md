---
title: Bklit UI
kind: source
featured: chart/bklit-area-crosshair-date-pill-tooltip
pattern: chart
page_type: dashboard
tags: [data-viz, open-source, react, tailwind, shadcn, animated]
source_url: https://bklit.com
source_site: bklit.com
captured_at: 2026-10-21
captured_by: toby
input: library-render
version: registry @ 17de6a9 (2026-10-20; package is unversioned 0.0.0)
licence: MIT (core); Studio proprietary
s_look: 5
s_interact: 4
s_coverage: 4
s_a11y: 1
s_perf: 3
s_react: 4
s_bundle: 3
s_licence: 4
why_it_works: Polished, animated shadcn-style chart components on visx (crosshair tooltips, brush, donut centre totals, wide chart range) that drop into a Tailwind app with the look already done.
use_when: Marketing pages, product dashboards and demos in our Tailwind/shadcn stack where the chart has to look finished and animate nicely, and keyboard or screen-reader access to the data is covered elsewhere (a table next to it).
avoid_when: The chart is the only way to reach the data (no keyboard or screen-reader support at all), or you need stacked columns (stacked vertical bars overflow their plot in this version).
alternatives: [recharts, visx, echarts]
has_example: false
---

## Verdict
**Best-looking copy-in charts for our stack, but not accessible and not yet solid.** Bklit wraps visx in finished,
animated components: the polish visx leaves to you (tooltips, crosshair, brush, centre totals, enter animations) is
done. The trade-off is everything we care about underneath: the charts can't be focused or read by a screen reader, the
package has no versioned releases, and the stacked bar chart has a scaling bug. Use it for the look; keep a data table or
Recharts for anything people must operate.

## Benchmark
All 4 charts drawn with Bklit's own components (`bench/libs/bklit-ui.jsx`; 101 component files copied from the registry
into `bench/libs/bklit/`, plus a Tailwind v4 build of their classes). **129.7 KB gz for the library** (187 KB with React):
visx parts, Motion and Bklit's own code. SVG.

Found in the benchmark:
- **Stacked columns overflow their plot.** In vertical mode the y-scale is rebuilt per series group from the *largest single
  value* × 1.1 (`resolveDomain` in `bar-chart.tsx`) and ignores `stacked`, so any stack taller than that runs off the top
  (our tickets chart: totals of 1,000–1,230 drawn on a ~550 scale). Horizontal and grouped bars are fine.
- **Axis ticks repeat**: the time series y-axis reads 2k, 2k, 1k, 500 (values rounded to whole thousands).
- **Horizontal bars have no value axis or labels**, and long category names are cut ("Organic s…").
- Brush-to-zoom works out of the box (`ChartBrushLayout` with a mini overview), and the donut shows its total in the centre.
- **Accessibility probe: 0 focusable elements and 0 ARIA in three of four charts**; the donut's only text is "127,400".
  Live on bklit.com/charts/area-chart the chart `<svg>` has no role, label or title, and Tab goes from the Curve menu
  straight to Copy and View Code, so the chart never gets focus. In `packages/ui/src`, 0 of 143 component files handle
  keyboard events and 10 check reduced motion.
- Needs Tailwind: without its classes the axes and legends lay out wrongly.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 5 | Raised from 3 on 21 Oct 2026 after team review: monochrome, crosshair tooltips, patterned slices and smooth animation. The repeated ticks, cut labels and stacked overflow still need fixing in your copy |
| Interactivity | 4 | Crosshair tooltips, brush-to-zoom, hover legends and animated domain changes built in |
| Coverage | 4 | Area, line, bar (horizontal, grouped, stacked), pie/donut, ring, radar, scatter, candlestick, sankey, sunburst, heatmap, choropleth, funnel, gauge, live line; stacked columns are buggy |
| Accessibility | 1 | Nothing focusable, no roles or labels on the charts, no keyboard handling in any component |
| Performance | 3 | SVG with Motion animations on every chart; fine at benchmark sizes, not built for large data |
| React/Next fit | 4 | React 18/19 client components, installed with the shadcn CLI; ~100 files and Tailwind v4 for four charts |
| Bundle size | 3 | 129.7 KB gz library cost (charts scale: ≤ 150 KB) |
| Licence & health | 4 | MIT core (Studio is proprietary and not needed); commits daily (last 20 Oct 2026); no versioned releases, one maintainer |

## Compared with visx and Recharts
- **visx (7.0)** is what Bklit is built on: 38.5 KB, full control, but you build every tooltip, axis and legend yourself.
  Bklit is visx with that work done and styled, at three times the size and with its own bugs.
- **Recharts (7.5)** is the safer default: versioned releases, a keyboard layer (3 focusable elements on the time series,
  ARIA on every chart in the same benchmark) and correct stacking, at a similar size (125 KB). It looks plainer; style it
  with our tokens.

## Coverage
| Chart | Bklit |
|---|---|
| Time series with zoom | ✓ area chart + `ChartBrushLayout` |
| Sorted horizontal bars | ✓ (no value axis or labels) |
| Stacked composition | ✗ as shipped: stacked vertical bars overflow the plot |
| Donut with total | ✓ `PieChart` + `PieCenter` |

## Patterns in our library from this source
- `chart/bklit-area-crosshair-date-pill-tooltip` (the area chart's hover state, captured live)

## Using it in our stack
Install single charts with the shadcn CLI rather than the whole set, check the copied files into our repo, and pair each
chart with an accessible alternative (a table or a text summary). Don't use its stacked bar chart until the y-domain bug is
fixed upstream.
