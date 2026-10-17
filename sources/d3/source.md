---
title: D3
kind: source
pattern: chart
page_type: dashboard
tags: [data-viz, open-source, bespoke, editorial]
source_url: https://d3js.org
source_site: d3js.org
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 7.9.0
licence: ISC
s_look: 1
s_interact: 4
s_coverage: 5
s_a11y: 2
s_perf: 3
s_react: 2
s_bundle: 5
s_licence: 4
why_it_works: The low-level toolkit the rest of the field is built on (scales, shapes, layouts, zoom, brush, geo), so anything you can imagine can be drawn exactly as designed.
use_when: Editorial, one-off or highly custom visualisations; or use its maths modules (scales, shapes, formats) under React rendering.
avoid_when: Standard product charts on a deadline, or when D3 would own DOM that React also renders.
alternatives: [visx, observable-plot]
has_example: false
---

## Verdict
**The reference for fully bespoke and editorial visualisation, and the engine under visx and Plot.** In a
React app, prefer **visx** for rendering and use D3 for the maths (`d3-scale`, `d3-shape`, `d3-format`).
Reach for D3's DOM APIs (zoom, brush, transitions) when you need behaviour no wrapper gives you.

## Benchmark
All 4 charts hand-built, including wheel and drag zoom via `d3-zoom`. **31.9 KB gz** (tree-shaken), which is
the smallest full set in the benchmark. SVG. Code: `bench/libs/d3.js`, the most code of any library.

Found in the benchmark:
- `d3-zoom` gives smooth wheel and drag zoom on a time axis in about 10 lines, a better interaction than most wrappers.
- Every axis colour, label and legend is manual. The y-domain followed the full series, not the visible window, until changed.
- Accessibility is only what you add (we added `role`, `aria-label` and `<title>` per bar).

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 1 | No defaults: a blank canvas |
| Interactivity | 4 | Zoom, brush, drag, transitions: powerful but hand-wired |
| Coverage | 5 | Anything, including layouts (force, tree, pack), geo projections and contours |
| Accessibility | 2 | Manual |
| Performance | 3 | SVG by default; canvas rendering is possible but manual |
| React/Next fit | 2 | DOM ownership conflicts with React; use its maths modules with React rendering |
| Bundle size | 5 | 31.9 KB gz tree-shaken |
| Licence & health | 4 | ISC; mature and stable (last release May 2025) |
