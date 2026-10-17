---
title: AG Charts Community
kind: source
pattern: chart
page_type: dashboard
tags: [data-viz, open-source, dashboard, accessible, enterprise]
source_url: https://www.ag-grid.com/charts
source_site: ag-grid.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 14.2.0
licence: MIT (community edition)
s_look: 4
s_interact: 3
s_coverage: 3
s_a11y: 4
s_perf: 4
s_react: 4
s_bundle: 1
s_licence: 3
why_it_works: Polished business-chart defaults on canvas, with keyboard navigation and ARIA built in, and an official React wrapper with declarative options.
use_when: Teams already using AG Grid, or business dashboards where built-in keyboard accessibility matters and bundle size does not.
avoid_when: Bundle size matters (413 KB gz for four charts), or you need zoom, navigator or crosshairs, which are paid Enterprise features.
alternatives: [echarts, recharts]
has_example: false
---

## Verdict
**Good-looking and accessible, but heavy and open-core.** The community edition is MIT, but zoom, the
navigator and several series types are Enterprise (paid), so it isn't a full free option. Pick it mainly if
you already use AG Grid. Otherwise ECharts or Recharts cover the same ground more cheaply.

## Benchmark
All 4 charts drawn. **412.8 KB gz**, the heaviest in the benchmark, even registering only the 7 modules
needed (v14 requires `ModuleRegistry.registerModules`, and charts fail with "No modules have been
registered" otherwise). Canvas. Time series has no zoom in the community edition. Code: `bench/libs/ag.js`.

Found in the benchmark:
- Keyboard-focusable chart region and legend on every chart, plus ARIA ("chart, 1 series", legend items). This is among the best built-in accessibility tested.
- Default number axis shows "10000", not "10k". Set `label.formatter`.
- Default palette fails lightness and chroma (includes a pure grey, `#b5b5b5`) and is only borderline for colour-blind separation. Pass our colours.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Polished labels, callouts and legends |
| Interactivity | 3 | Tooltips and legend toggling; zoom and navigator are Enterprise |
| Coverage | 3 | Community series cover bar, line, area, scatter, bubble, pie, donut, histogram; more are Enterprise |
| Accessibility | 4 | Built-in keyboard focus and ARIA (screen-reader output not tested here) |
| Performance | 4 | Canvas renderer |
| React/Next fit | 4 | Official `ag-charts-react` wrapper, declarative options |
| Bundle size | 1 | 412.8 KB gz |
| Licence & health | 3 | Actively released (v14.2, Sept 2026), but key features paywalled |
