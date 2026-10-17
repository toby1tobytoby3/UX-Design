---
title: Stacked bars with built-in accessibility textures
pattern: chart
page_type: dashboard
tags: [data-viz, b2b, accessible, open-source]
source_url: https://echarts.apache.org/en/option.html#aria.decal
source_site: echarts.apache.org
captured_at: 2026-10-17
captured_by: toby
input: library-render
rating: 4
why_it_works: One option line gives every series its own texture as well as a colour, so the chart still reads for colour-blind users, in greyscale print and in forced-colours mode, and ECharts also writes a screen-reader description.
use_when: Any multi-series categorical chart (stacked or grouped bars, pies) that needs to meet accessibility requirements.
has_example: false
---

## What it is
Monthly support tickets stacked by four channels, with `aria: { enabled: true, decal: { show: true } }`.
ECharts assigns a distinct pattern per series (diagonal lines, dots, stripes, checks). The patterns also
appear in the legend swatches, so the legend maps by texture as well as colour. Rendered from `option.js`
with ECharts 5.5.1 on sample data.

## Key techniques
- `aria.decal.show: true` auto-assigns patterns. Customise per series with `itemStyle.decal` (symbol, dash array, rotation).
- Validated 4-colour order (`#2a78d6, #eb6834, #1baf7a, #eda100`) instead of the failing default palette.
- A 1px surface-colour border separates stacked segments.
- `emphasis.focus: 'series'` dims the other series on hover, and `axisPointer: 'shadow'` highlights the whole month.
- Legend at the top right for 4 series. Labels and axes use text colours, never the series colours.

## Accessibility
This *is* the accessibility pattern. It still needs a table view for exact values. The auto-generated aria description is
generic ("This is a chart about…"); set `aria.label.description` to say what the chart actually shows.

## Weaknesses
Default patterns are fairly busy on large areas. Tone them down with `decal.color` (lower alpha) or show decals only
when the user turns on a "patterns" toggle.

## Using it in our stack
- Install: `npm i echarts` (Apache-2.0, free to use and modify in commercial products). Import only what you need with `echarts/core` plus the chart and component modules, to keep the bundle small.
- In Next.js, render client-side: `"use client"`, `echarts.init(ref.current, null, { renderer: "svg" })` in a `useEffect`, call `chart.dispose()` on unmount, and `chart.resize()` from a `ResizeObserver`.
- Our recommended palette: swap ECharts' default colours for the validated order in `option.js` (see the palette check below). Demos are written against 5.5.1 and run unchanged on 6.x.

## ECharts default palette check
**ECharts 5.x** default, run through our palette validator (light surface): CVD separation **fails** (`#fc8452` vs `#3ba272` ΔE 4.0 for protanopia), `#fac858` vs `#91cc75` is only ΔE 13.9 even for normal vision, `#73c0de` reads grey, and five colours are below 3:1 contrast. **ECharts 6.x** (current, 6.1.0) ships a new default (`#5070dd, #b6d634, #505372, …`) that **passes** CVD and normal-vision separation but still fails the lightness band, has a near-grey slot (`#505372`) and six colours below 3:1 contrast. Either way, override `color` with our validated order (or enable decals).

## Related entries
- `chart/echarts-datazoom-time-series`
- `chart/echarts-universal-transition-morph`
- Source profile: `sources/echarts`
