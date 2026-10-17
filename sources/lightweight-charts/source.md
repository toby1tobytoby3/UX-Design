---
title: TradingView Lightweight Charts
kind: source
pattern: chart
page_type: dashboard
tags: [data-viz, open-source, time-series, finance, large-data]
source_url: https://tradingview.github.io/lightweight-charts
source_site: tradingview.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 5.2.1
licence: Apache-2.0 (attribution required)
s_look: 4
s_interact: 5
s_coverage: 1
s_a11y: 1
s_perf: 5
s_react: 2
s_bundle: 4
s_licence: 4
why_it_works: The trading-terminal interaction model in a small canvas library, with buttery pan and zoom, a crosshair with price labels, and candlestick, bar, area and histogram series built for financial time data.
use_when: Prices, balances, portfolio or any financial time series where pan/zoom feel matters.
avoid_when: Non-time data (categorical bars, pies), or accessibility-critical views.
alternatives: [uplot, echarts]
has_example: false
---

## Verdict
**The best-feeling time-series interaction tested, for financial data only.** Choose it for price and balance
charts. It can't draw anything that isn't plotted against time.

## Benchmark
**1 of 4 charts.** Only the time series; no categorical bars, stacking or pies. **54.3 KB gz**. Canvas. Pan
and zoom built in. Code: `bench/libs/lightweight.js`.

Found in the benchmark:
- Shows the TradingView logo by default. The licence requires attribution (a link or notice) if you hide it.
- Finance defaults: price scale on the right and two-decimal values ("1200.00"). Set `priceFormat` for counts.
- Keyboard-focusable but no ARIA text; canvas only.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Polished for finance; finance-specific defaults elsewhere |
| Interactivity | 5 | Pan, zoom, crosshair with price and time labels |
| Coverage | 1 | Time series only (candlestick, bar, line, area, baseline, histogram) |
| Accessibility | 1 | No ARIA |
| Performance | 5 | Canvas, built for long series and live updates |
| React/Next fit | 2 | Imperative API; wrap in an effect |
| Bundle size | 4 | 54.3 KB gz |
| Licence & health | 4 | Apache-2.0 with attribution; active (v5.2, Aug 2026) |
