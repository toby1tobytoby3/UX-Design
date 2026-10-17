---
title: Time series with inside zoom and a slider overview
pattern: chart
page_type: dashboard
tags: [data-viz, saas, b2b, interactive, responsive, open-source]
source_url: https://echarts.apache.org/examples/en/index.html#chart-type-dataZoom
source_site: echarts.apache.org
captured_at: 2026-10-17
captured_by: toby
input: library-render
rating: 5
why_it_works: Two zoom controls for one job. Scroll or drag inside the plot for quick exploration, and a slider with a mini overview of the full series shows where you are, so long time series stay readable without a date picker.
use_when: Any time series longer than about 60 points: usage, revenue, latency or event logs.
has_example: false
---

## What it is
A single-series area line chart from Apache ECharts with two `dataZoom` components sharing one
range: `inside` (wheel, pinch, drag on the plot) and `slider` (a draggable window over a
miniature of the whole series). It has an axis tooltip with a crosshair, a peak marker, and ECharts' own
`media` queries for a narrow-screen layout. Images are real renders of `option.js` with ECharts 5.5.1
on sample data.

## Key techniques
- `dataZoom: [{ type: 'inside' }, { type: 'slider' }]` with the same `start`/`end`. Both control one window.
- Open at the most recent half (`start: 50`), so the default view is the latest data and history is one drag away.
- `tooltip.trigger: 'axis'` + `axisPointer.type: 'cross'`, with formatted axis labels (date as "Wed, 26 Aug", value rounded).
- 2px line, faint vertical gradient fill, recessive grid (`#ecebe7`), no symbols until hover.
- `markPoint: { type: 'max' }` labels the peak automatically.
- `baseOption` + `media: [{ query: { maxWidth: 500 } }]` adapts the layout on phones (fewer ticks, compact axis labels, no marker).
- `renderer: 'svg'` gives crisp text and a smaller memory footprint for small to medium datasets. Use `canvas` for 10k+ points.

## Accessibility
`aria: { enabled: true }` generates a text description of the chart for screen readers. The slider
handles aren't keyboard-operable by default, so provide preset range buttons (7d / 30d / 90d) as an
accessible alternative, plus a table view.

## Weaknesses
The slider is fiddly on touch screens. Pair it with preset range buttons. The default tooltip and axis-pointer labels
show raw timestamps and decimals unless you add formatters (done here).

## Using it in our stack
- Install: `npm i echarts` (Apache-2.0, free to use and modify in commercial products). Import only what you need with `echarts/core` plus the chart and component modules, to keep the bundle small.
- In Next.js, render client-side: `"use client"`, `echarts.init(ref.current, null, { renderer: "svg" })` in a `useEffect`, call `chart.dispose()` on unmount, and `chart.resize()` from a `ResizeObserver`.
- Our recommended palette: swap ECharts' default colours for the validated order in `option.js`. The default 9-colour palette **fails** colour-blind and contrast checks (see below).

## ECharts default palette check
Run through our palette validator (light surface): CVD separation **fails** (`#fc8452` vs `#3ba272` ΔE 4.0 for protanopia), `#fac858` vs `#91cc75` is only ΔE 13.9 even for normal vision, `#73c0de` reads grey, and five colours are below 3:1 contrast. So always override `color` (or enable decals).

## Related entries
- `chart/echarts-universal-transition-morph`
- `chart/echarts-aria-decal-patterns`
- `dashboard/stripe-home-kpi-overview`
