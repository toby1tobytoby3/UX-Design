# Choosing a chart

`ux-find` reads this for any chart request. **Step 1** picks the form from what the data has to show.
**Step 2** picks the library from the job's constraints, using the evidence in `SOURCES.md` and
`sources/*/source.md` (every library drew the same four charts; see `bench/`). **Step 3** lists sensible defaults: start from them, and depart when the situation calls for it.

## 1. Form: what is the data's job?
| Job | Use | Avoid | Ready pattern |
|---|---|---|---|
| One headline number | Stat tile with delta and sparkline | A chart with one bar | `dashboard/stripe-home-kpi-overview` |
| Change over time | Line (area for one series); add zoom past ~60 points | Bars for long series | `chart/echarts-datazoom-time-series` |
| Compare amounts | Horizontal bar, sorted, direct labels | Pie with > 5 slices, 3D | bench sheets, "Revenue by channel" |
| Share of a whole | Donut ≤ 5 parts, else sorted bar | Several pies side by side | `chart/echarts-universal-transition-morph` |
| Composition over time | Stacked bar/area, ≤ 6 series, with textures if accessibility matters | Stacked lines | `chart/echarts-aria-decal-patterns` |
| Distribution | Histogram, box plot, density | Line through categories | Observable Plot marks |
| Relationship | Scatter (+ size for a third value) | Two y-axes, usually (see defaults) | |
| Flow / hierarchy | Sankey; treemap or sunburst | Nested pies | ECharts |
| Price / financial time series | Candlestick or area with crosshair, pan and zoom | Generic line charts | Lightweight Charts |
| Live metrics, 10k+ points | Canvas line with drag-zoom | SVG libraries | uPlot |

## 2. Library: which source fits the job?
Overall scores are in `SOURCES.md`; **fit beats score**. Start from the first row that matches.

| If the job is… | Use | Score | Why (evidence) | Runner-up |
|---|---|---|---|---|
| Everyday charts in our React/Next app | **Recharts** | 7.5 | Native JSX, React 19, keyboard layer, 125 KB gz, 4/4 bench charts | ECharts |
| A dashboard needing zoom, drill-down, morphs, big data or specialist charts | **ECharts** | 7.8 | Highest score; only free library with zoom + morph + 23 chart types natively; 205 KB gz tree-shaken | AG Charts (if already on AG Grid) |
| A signature or bespoke chart in React | **visx** | 7.0 | Full design control, 38.5 KB gz | D3 |
| Editorial or one-off visualisation, custom interaction | **D3** (maths) + visx (rendering) | 6.0 | Anything is possible; `d3-zoom` beat most wrappers | Observable Plot |
| Static, report or server-rendered charts | **Observable Plot** | 6.0 | Best defaults per line of code; SVG on the server; no pies; no release since Feb 2025 | D3 |
| Real-time or very long time series | **uPlot** | 5.5 | 24.4 KB gz canvas, drag-zoom; time series only; no release since Mar 2025 | ECharts (canvas) |
| Financial price charts | **Lightweight Charts** | 6.5 | Best pan/zoom/crosshair feel; time series only; attribution required | uPlot |
| "Make it look like a Tailwind dashboard" | **Recharts + our tokens**, using Tremor as the visual reference | – | Tremor npm is stale and blocks React 19 | – |
| Polished, animated charts on a product or marketing page | **Bklit UI** (shadcn copy-in, on visx) | 7.0 | Finished look, crosshair tooltips, brush and patterned slices built in; 130 KB gz. **No keyboard or screen-reader access**: add a keyboard layer and a data table (pattern in `chart/bklit-area-crosshair-date-pill-tooltip/example.tsx`). Stacked columns overflow; fix in your copy | Recharts + our tokens |

Usually not worth it as dependencies: **Tremor (npm)**, which is stale and React 18 only, and **AG Charts Community** unless
already on AG Grid (413 KB gz; zoom is paid). Commercial-only libraries (Highcharts, etc.) are out of scope by decision.

## 3. Defaults (guidance, not rules)
Good starting points drawn from the benchmark. Each has a reason; when the reason doesn't apply, depart from it
and say why in the code or PR.

| Default | Why | When to depart |
|---|---|---|
| Replace the library's default palette with our validated order (`#2a78d6, #eb6834, #1baf7a, #eda100, #e87ba4`, see `bench/data.js`) | No default palette passed our colour checks | A brand or data convention already defines colours (e.g. party colours, red/green P&L with labels) |
| On light backgrounds, give charts direct labels, a 1px darker outline on fills, or a table view | On white, green (2.82:1), amber (2.17:1) and pink (2.69:1) are below the 3:1 that WCAG 1.4.11 asks of chart marks; all five pass on dark (checked, see `guides/foundations.md`) | Purely decorative sparklines next to the number they show |
| One y-axis | Two scales invite false comparisons | Two series share units but differ in scale and a combined view is the point; label both axes clearly |
| Legend in stack order; text in ink colours, not series colours | Readability and contrast | Direct labels on the marks can replace a legend entirely |
| Write the screen-reader description yourself | Auto descriptions were raw data (ECharts), structural (Plot) or broken (Recharts Brush) | Decorative sparklines can be `aria-hidden` when the number is in text next to them |
| Area charts start at zero | A raised baseline exaggerates change | Line charts (no fill) can zoom the y-axis to show variation |
| Client components for canvas or imperative libraries | They need the DOM | Observable Plot and D3 can render SVG on the server |
| Offer a table view for exact values | Charts show shape, tables show numbers | Small charts where the exact values are already printed |
