---
title: Recharts
kind: source
pattern: chart
page_type: dashboard
tags: [data-viz, open-source, react, dashboard, accessible]
source_url: https://recharts.org
source_site: recharts.org
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 3.10.1
licence: MIT
s_look: 4
s_interact: 4
s_coverage: 3
s_a11y: 4
s_perf: 2
s_react: 5
s_bundle: 3
s_licence: 5
why_it_works: Charts are plain React components (<BarChart><Bar/></BarChart>), so they compose, theme and type like the rest of a Next app, with sensible defaults and a built-in keyboard accessibility layer.
use_when: Everyday product and dashboard charts in our React/Next app (lines, bars, areas, donuts) with up to a few thousand points.
avoid_when: Very large or streaming data (SVG slows down), or specialist charts such as heatmaps, candlesticks or geo maps.
alternatives: [echarts, visx, tremor]
has_example: false
---

## Verdict
**Our default for everyday charts in the React/Next app.** It's the most idiomatic fit for our stack:
composable JSX, React 19 support, keyboard navigation out of the box, and a very active project. It's also
the foundation of shadcn/ui charts and Tremor. Choose ECharts instead when you need zoom, morphs, specialist
types or big data.

## Benchmark
All 4 charts drawn natively. **125 KB gz for the library** (182.5 KB including React 19's 57 KB, which our
app already ships). SVG. Zoom is a `<Brush>` range slider, not wheel or drag on the plot. Code: `bench/libs/recharts.jsx`.

Found in the benchmark:
- `accessibilityLayer` makes charts keyboard-focusable (1–3 focusable elements per chart). The best result among the React libraries.
- The Brush slider's accessible name reads **"Min value: undefined, Max value: undefined"**, which is a bug. Label it yourself.
- The legend sorts series **alphabetically** by default, so it doesn't match the stack order. Set `itemSorter` or pass a `payload`.
- Pie labels inherit the slice colour, which is low contrast. Pass `label` with a text colour.
- No default categorical palette (you set every colour), so ours drops straight in.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Clean, balanced spacing; legend order and label colours need fixes |
| Interactivity | 4 | Tooltips, legend, Brush range slider, animations; no wheel/drag zoom or chart-type morphs |
| Coverage | 3 | Line, area, bar, composed, pie, radar, radial bar, scatter, funnel, treemap, sankey; no heatmap, candlestick, geo |
| Accessibility | 4 | Keyboard layer and ARIA, with a broken Brush label |
| Performance | 2 | SVG DOM per point; fine to low thousands, not 100k |
| React/Next fit | 5 | Native components, typed, React 19, works with Tailwind tokens via props/CSS vars |
| Bundle size | 3 | 125 KB gz library cost for four charts |
| Licence & health | 5 | MIT; v3.10 released Oct 2026 |

## Using it in our stack
`npm i recharts`; use `"use client"` components; wrap each chart in `ResponsiveContainer`; pass our validated
colours; add `accessibilityLayer`; set legend `itemSorter`; give Brush handles proper labels.
