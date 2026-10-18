---
title: Dashboard with one global time range and refresh in the URL, and per-panel failure tiles that leave the rest of the board working
pattern: dashboard
page_type: dashboard
tags: [dark, dense, data-viz, devtools, b2b]
source_url: https://play.grafana.org/d/appenv-banking-exec-overview/banking-executive-overview
source_site: play.grafana.org
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 3
why_it_works: Shows the parts of a monitoring dashboard that matter when things go wrong. One time range and auto-refresh control the whole board and live in the URL, and a failing query breaks only its own tile, with an error icon in the tile header and a Details disclosure.
use_when: Operational and executive dashboards built from many independent queries, especially when designing the time range control, auto-refresh and partial-failure states.
has_example: false
---

## What it is
Grafana Play's "Grafana Bank — Executive Overview", captured headless. The panel data sources failed in the
headless browser, so this capture shows **Grafana's failure state**, not the normal charts. A text intro panel
sits above 8 KPI tiles (Money Moved, Success Rate, Loans Disbursed, Approval Rate, Fraud Declines, Logins, Chats,
Tickets) that each show "An unexpected error happened ▸ Details". Three charts below show "No data". The second
image has the time picker open.

## Key techniques
- Global controls top-right: ◀ / time range ("Last 6 hours") / ▶ step, zoom out, Refresh with an interval
  ("30s"), share and Edit. The URL carries them: `?from=now-6h&to=now&timezone=browser&refresh=30s`.
- Time picker: absolute From/To that accept relative expressions (`now-6h`), a searchable list of quick ranges,
  recently used ranges, and the time zone with "Change time settings" in the footer.
- Partial failure: each panel fails on its own. An error badge in the panel header plus an inline message and a
  Details disclosure. The rest of the dashboard and its controls stay usable.
- A text panel at the top says what the board is for and that "all figures follow the dashboard time range".

## Accessibility (measured)
- "Skip to main content" link present. Each panel is a `<section aria-labelledby>` pointing at its title.
- The panel error badge is a focusable `<button aria-label="Panel status">`. The name doesn't say "error", so
  include the state ("Query failed: Money Moved").
- The refresh interval has a descriptive name: "Choose refresh time interval with current interval 30 seconds selected".

## Weaknesses
- KPI tiles at this width truncate titles to one letter ("M…", "S…") and the error text wraps word by word. Set a
  minimum tile width, or let the title take priority over the badge.
- "An unexpected error happened" is generic. Say what failed and offer Retry in the tile.
- "No data" and "error" look different and that's correct, but "No data" gives no reason or time range hint.

## Related entries
- `dashboard/stripe-home-kpi-overview`, `panels/dockview-trading-workspace-docking`.
