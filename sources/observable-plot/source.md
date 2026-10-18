---
title: Observable Plot
kind: source
pattern: chart
page_type: dashboard
tags: [data-viz, open-source, editorial, static]
source_url: https://observablehq.com/plot
source_site: observablehq.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 0.6.17
licence: ISC
s_look: 4
s_interact: 2
s_coverage: 3
s_a11y: 3
s_perf: 3
s_react: 3
s_bundle: 4
s_licence: 2
why_it_works: A concise grammar of graphics from D3's creators: a few lines produce well-typeset, correctly scaled charts with sensible axes and tips, and it renders plain SVG that can be generated on the server.
use_when: Report, documentation and analysis charts; server-rendered or static charts; quick exploration.
avoid_when: You need pies or donuts (no mark by design), zoom, or rich dashboard interaction.
alternatives: [d3, recharts]
has_example: false
---

## Verdict
**The pick for static, report-style and server-rendered charts.** It has the best defaults-per-line of code
in the benchmark, with excellent axes and typography. It's deliberately not an interactive dashboard library.

**Maintenance check (18 Oct 2026):** last npm release 0.6.17 on 2025-02-14, outside the six-month window, and recent commits could not be verified from here (GitHub not reachable). Under the rubric's maintenance gate this caps Licence & health at 2; raise it again once a meaningful commit in the window is confirmed.

## Benchmark
**3 of 4 charts.** Plot has no pie or donut mark by design. **93.3 KB gz** (includes the D3 modules it uses).
SVG. No zoom. Code: `bench/libs/plot.js`, the shortest code in the benchmark.

Found in the benchmark:
- Without zoom it shows the full 180 days. That's correct for a static chart, but there's no way to focus a range.
- ARIA labels are structural ("y-axis tick", "area", "line"), not data descriptions. Use `ariaLabel`/`ariaDescription` options.
- The default `observable10` palette passes colour-blind separation but has four near-grey slots and fails contrast. Pass our colours.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Best typographic defaults; default palette needs replacing |
| Interactivity | 2 | Tips (tooltips) only; no zoom or legend toggling |
| Coverage | 3 | Strong statistical marks (density, hexbin, contour, geo, box, waffle); no pie or donut |
| Accessibility | 3 | ARIA hooks on every mark; generic labels by default; no keyboard navigation |
| Performance | 3 | SVG; fine for thousands of marks |
| React/Next fit | 3 | Not React: returns an SVG element to append in an effect, or render on the server |
| Bundle size | 4 | 93.3 KB gz |
| Licence & health | 5 | ISC; Observable-maintained, v0.6.17 April 2026 |
