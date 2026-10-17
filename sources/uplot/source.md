---
title: uPlot
kind: source
pattern: chart
page_type: dashboard
tags: [data-viz, open-source, time-series, large-data, real-time]
source_url: https://github.com/leeoniya/uPlot
source_site: github.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 1.6.32
licence: MIT
s_look: 2
s_interact: 4
s_coverage: 1
s_a11y: 1
s_perf: 5
s_react: 2
s_bundle: 5
s_licence: 4
why_it_works: A tiny canvas engine built only for x/y time series, so it draws hundreds of thousands of points and live streams smoothly, with drag-to-zoom and synced cursors built in.
use_when: Monitoring, metrics and real-time or very long time series where speed and size beat everything else.
avoid_when: Anything categorical (bars by name, pies), or where accessibility is required.
alternatives: [echarts, lightweight-charts]
has_example: false
---

## Verdict
**The specialist for fast, huge time series.** It's the smallest library tested (24.4 KB gz) and built for
speed. It does one job: use it for metrics panels and live data, and use something else for everything else.

## Benchmark
**2 of 4 charts.** No categorical or horizontal bars and no pie or donut. Stacked bars only work by drawing
cumulative totals yourself. **24.4 KB gz**. Canvas. Drag-to-zoom built in. Code: `bench/libs/uplot.js`.

Found in the benchmark:
- The y-axis auto-ranges away from zero (the area fill started at 250, which is misleading for an area chart).
  Set `scales.y.range` to include zero.
- No accessibility: canvas with no ARIA and no keyboard focus. Pair it with a data table.
- The live legend (values under the cursor) is useful for monitoring but looks dated by default.
- Needs the locale set correctly; in our headless run an odd system locale threw "Invalid language tag".

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 2 | Functional, dated legend; auto-ranged y-axis |
| Interactivity | 4 | Drag-zoom, cursor sync, live legend |
| Coverage | 1 | x/y series only |
| Accessibility | 1 | None |
| Performance | 5 | Built for 100k+ points and streaming |
| React/Next fit | 2 | Imperative; community wrappers only |
| Bundle size | 5 | 24.4 KB gz |
| Licence & health | 4 | MIT; mature, single maintainer, last release March 2025 |
