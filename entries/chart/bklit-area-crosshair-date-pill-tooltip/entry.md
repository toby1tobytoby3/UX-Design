---
title: Area chart hover with a crosshair, dots on every series, a date pill on the axis and a compact tooltip
pattern: chart
page_type: docs
tags: [minimal, data-viz, open-source, interactive]
source_url: https://bklit.com/charts/area-chart
source_site: bklit.com
captured_at: 2026-10-21
captured_by: toby
input: url
rating: 3
why_it_works: Hovering marks the exact date three ways at once (a vertical line, a dot on each series and a filled date pill on the x-axis) and puts the values in a small two-row tooltip, so reading two series at one moment takes one glance.
use_when: Time series with two to four series where people compare values at a single date: revenue vs costs, plan vs actual.
has_example: true
---

## What it is
Bklit UI's "Area Chart - Interactive" (MIT, built on visx). Two areas (revenue, costs) over 30 days in a monochrome palette with a
curve switcher (monotoneX and other `@visx/curve` options). On hover (`desktop.jpg`):
- a thin vertical crosshair at the pointer's date;
- a dot with a soft halo on each series where the crosshair crosses it;
- the x-axis label for that date turns into a **filled pill** ("Jan 13");
- a tooltip: the full date ("Sat, Jan 13"), then one row per series with a colour dot, name and right-aligned value
  (revenue 10,833 · costs 3,104).

The chart gallery (`crop-gallery.jpg`) has a tab per chart type (Area, Bar, Candlestick, Choropleth, Composed, Funnel, Gauge,
Heatmap, Line, Live Line, Pie…) with a "View Code" button on every example.

## Key techniques
- **Date pill on the axis**: the active x-value is shown where the eye already is, so the tooltip can stay small.
- **Dots on every series**, not only the nearest, for comparing at one moment.
- **Tabular, right-aligned numbers** in the tooltip.
- **Patterned slices** in its pie charts (homepage, `crop-home.jpg`): hatching as well as colour, so slices differ without colour alone.

## Accessibility
Measured: the chart `<svg>` has no `role`, `aria-label` or `<title>`, and nothing in it can take focus. Tab goes from the Curve
menu straight to "Copy" and "View Code", so **the values and the tooltip are mouse-only** and there is no text alternative.
Across the library's source, none of the 143 component files handles keys and 10 check for reduced motion. Copy the look; add a
keyboard layer (arrow keys move the crosshair, as in Recharts' `accessibilityLayer`) and a data table or summary yourself
(`guides/charts.md`).

## Rebuild
`example.tsx` (React + Tailwind, no dependencies) keeps the look and adds what Bklit leaves out: the chart is focusable,
← → Home End move the crosshair, each move is announced in a polite live region, Escape clears it, and a "Show the data
as a table" disclosure holds all 30 rows. Use it as the keyboard layer when building with Bklit.

## Weaknesses
- Grey-on-grey series rely on lightness only; check the two lines keep 3:1 against each other and the background.
- "Click and drag to select a range" left no visible selection in our test (pointer drag in headless Chromium), so it isn't claimed here.

## Related entries
- `chart/echarts-datazoom-time-series` (zoom and range with keyboard support)
- `chart/echarts-aria-decal-patterns` (patterns plus an accessible description)

> Captured live on 21 Oct 2026 with Playwright, including hover, keyboard and reduced-motion checks, plus a read of the component source.
