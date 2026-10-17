---
title: Tremor
kind: source
pattern: chart
page_type: dashboard
tags: [data-viz, open-source, react, tailwind, dashboard]
source_url: https://tremor.so
source_site: tremor.so
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 3.18.7 (npm)
licence: Apache-2.0
s_look: 4
s_interact: 3
s_coverage: 2
s_a11y: 3
s_perf: 2
s_react: 3
s_bundle: 2
s_licence: 2
why_it_works: Tailwind-styled dashboard charts (on Recharts) with a polished, consistent look in very little code, such as a donut with its total in the centre and tidy legends.
use_when: Reference for the Tailwind dashboard look. To build that look, use Recharts with our tokens rather than the npm package.
avoid_when: New work on React 19 / current Next. The npm package needs React 18 and hasn't been released since January 2025.
alternatives: [recharts]
has_example: false
---

## Verdict
**A design reference, not a dependency.** The look is the best "Tailwind dashboard" style tested. But the npm
package is stale (last release January 2025) and **won't install with React 19** (peer dependency
`react@^18`), which current Next.js uses. Tremor appears to have moved to copy-paste components on its
site (unverified: the site couldn't be reached from this session). Recommended route: get the look with
Recharts plus our Tailwind tokens.

## Benchmark
All 4 charts (benchmarked in isolation on React 18). **237 KB gz for the library** (it bundles Recharts and
headless UI) plus a Tailwind build with Tremor-specific tokens. SVG. No zoom. Code: `bench/libs/tremor.jsx`,
`bench/tremor/tailwind.config.cjs`.

Found in the benchmark:
- `npm install` fails alongside React 19 (ERESOLVE). This was the first finding of the whole benchmark.
- Colours must be Tailwind colour **names**, so our validated hex palette can only be approximated.
- The **default palette fails colour-blind checks badly**: indigo and violet sit next to each other and
  are nearly identical for protanopia (ΔE 0.8).
- Bar charts colour by series, not by bar. No value labels on bars.
- Needs a specific Tailwind config (tremor-* colour tokens and a safelist). Its preflight also restyled the host page.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Best dashboard polish tested; default palette fails |
| Interactivity | 3 | Recharts tooltips and legends; no zoom |
| Coverage | 2 | Area, bar, line, donut, scatter, funnel, sparkline |
| Accessibility | 3 | Partial Recharts behaviour |
| Performance | 2 | SVG via Recharts |
| React/Next fit | 3 | Idiomatic components, but React 18 only |
| Bundle size | 2 | 237 KB gz library cost + CSS |
| Licence & health | 2 | Apache-2.0; npm package idle since Jan 2025, blocks React 19 |
