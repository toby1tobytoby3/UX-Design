---
title: Bar-to-share morph with universal transition
pattern: chart
page_type: dashboard
tags: [data-viz, saas, animated, interactive, open-source]
source_url: https://echarts.apache.org/handbook/en/basics/release-note/5-2-0
source_site: echarts.apache.org
captured_at: 2026-10-17
captured_by: toby
input: library-render
rating: 4
why_it_works: Switching between "compare amounts" (bars) and "see share" (donut) animates each item into its new shape, so the viewer keeps track of which channel is which instead of re-reading a new chart.
use_when: One small categorical dataset that people need to read two ways, amount and proportion, behind a simple toggle.
has_example: false
---

## What it is
Revenue by five channels shown as a horizontal bar chart with value labels. A segmented **Bar / Share**
toggle switches to a donut with percentage labels. ECharts' `universalTransition` morphs each bar into
its slice. The images show both states (`desktop.jpg` = bar, `crop-share.jpg` = share), rendered
from `option.js` with ECharts 5.5.1 on sample data.

## Key techniques
- Same series `id` in both options plus `universalTransition: true`. That's all it takes for ECharts to animate between chart types.
- `setOption(next, { replaceMerge: ['xAxis', 'yAxis', 'grid'] })` cleanly removes the axes when going to the donut.
- Colour is set per data item, so each channel keeps its colour in both views (colour follows the entity).
- Bars are sorted descending with direct value labels, so no legend is needed. The donut has a 2px surface border between slices.
- The toggle is a real segmented control with `aria-pressed`.
- `animationDurationUpdate: 700` is slow enough to follow, fast enough not to annoy.

## Accessibility
Respect `prefers-reduced-motion` by setting `animation: false` when it's on. The toggle buttons are keyboard-reachable;
announce the view change or keep a table view.

## Weaknesses
A donut is only readable for about five categories. Beyond that, keep the bar view only. The morph is decorative
if users never switch views.

## Using it in our stack
- Install: `npm i echarts` (Apache-2.0, free to use and modify in commercial products). Import only what you need with `echarts/core` plus the chart and component modules, to keep the bundle small.
- In Next.js, render client-side: `"use client"`, `echarts.init(ref.current, null, { renderer: "svg" })` in a `useEffect`, call `chart.dispose()` on unmount, and `chart.resize()` from a `ResizeObserver`.
- Our recommended palette: swap ECharts' default colours for the validated order in `option.js` (see the palette check below). Demos are written against 5.5.1 and run unchanged on 6.x.

## ECharts default palette check
**ECharts 5.x** default, run through our palette validator (light surface): CVD separation **fails** (`#fc8452` vs `#3ba272` ΔE 4.0 for protanopia), `#fac858` vs `#91cc75` is only ΔE 13.9 even for normal vision, `#73c0de` reads grey, and five colours are below 3:1 contrast. **ECharts 6.x** (current, 6.1.0) ships a new default (`#5070dd, #b6d634, #505372, …`) that **passes** CVD and normal-vision separation but still fails the lightness band, has a near-grey slot (`#505372`) and six colours below 3:1 contrast. Either way, override `color` with our validated order (or enable decals).

## Related entries
- `chart/echarts-datazoom-time-series`
- `chart/echarts-aria-decal-patterns`
- Source profile: `sources/echarts`
