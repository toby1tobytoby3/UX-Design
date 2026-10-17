---
title: KPI overview with comparison period and sparkline charts
pattern: dashboard
page_type: dashboard
tags: [saas, b2b, minimal, data-viz]
source_url: https://dashboard.stripe.com
source_site: stripe.com
captured_at: 2026-10-17
captured_by: base-pack
input: base-pack
rating: 4
why_it_works: Every metric is shown with its change versus a selectable comparison period, so the dashboard answers "is this good?" instead of only "what is it?", and the light chrome keeps attention on numbers.
use_when: Admin or analytics home screens summarising 4–8 business metrics.
has_example: false
needs_capture: true
---

## What it is
Header with date-range and "compare to previous period" controls. A main chart (today vs yesterday
line, current value large) then a grid of metric cards: label, big value, coloured delta pill
(+12.4%), small line chart with the comparison period as a dashed/grey line.

## Key techniques
- Tabular numerals (`font-variant-numeric: tabular-nums`) so values don't jitter.
- Comparison line in grey, current in brand colour; no gridline clutter.
- Delta pills use colour + sign (not colour alone).
- Cards are borderless, separated by whitespace and hairlines.

## Accessibility
Charts need text equivalents (value + delta in text already helps). Don't rely on red/green alone.

## Weaknesses
Too many cards dilute focus; pick the metrics that drive decisions.

> Base-pack entry written from knowledge of the product; re-capture with **ux-add** to attach real screenshots.
