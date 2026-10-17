# Choosing a chart

`ux-find` reads this first for any chart request. Step 1 picks the **form** from what the data has to show.
Step 2 picks the **source** from `sources/` (category `chart`) by the job's constraints.

## 1. Form: what is the data's job?
| Job | Use | Avoid |
|---|---|---|
| One headline number | Stat tile with delta and sparkline (`dashboard/stripe-home-kpi-overview`) | A chart with one bar |
| Change over time | Line (area for one series); add zoom past ~60 points (`chart/echarts-datazoom-time-series`) | Bars for long series |
| Compare amounts | Horizontal bar, sorted, direct labels | Pie with > 5 slices, 3D |
| Share of a whole | Donut ≤ 5 parts, else sorted bar; stacked bar for share over time | Multiple pies side by side |
| Composition over time | Stacked bar/area with decals (`chart/echarts-aria-decal-patterns`) | More than ~6 stacked series |
| Distribution | Histogram, box plot | Line through categories |
| Relationship | Scatter (+ size for a third value) | Two y-axes (never use dual axes) |
| Flow | Sankey | Chord for business audiences |
| Hierarchy / part-of-part | Treemap, sunburst | Nested pies |
| Matrix / calendar intensity | Heatmap (one-hue sequential scale) | Rainbow colour scales |

Always: validated categorical palette, one y-axis, legend for ≥ 2 series, recessive grid, a table view for exact values.

## 2. Source: which library?
Fill in from the source profiles; the recommendation must cite their scores.

| If the job needs… | Pick | Profile |
|---|---|---|
| Rich interactive dashboards, many chart types, large data | ECharts | `sources/echarts` |
| _Pending profiles — see the shortlist in SPEC.md_ | | |
