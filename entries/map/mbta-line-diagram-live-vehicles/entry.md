---
title: Line diagram as the primary view, with a small live-vehicle map beneath
pattern: map
page_type: app
tags: [accessible, b2c, interactive, minimal]
source_url: https://www.mbta.com/schedules/Red/line
source_site: mbta.com
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 4
why_it_works: The full stop list (with branch labels, connections, accessibility icons and "View departures" links) carries every fact, so the map can stay small and secondary. Anyone who can't use the map loses nothing.
use_when: Transit, delivery or route status pages where people need "where is it and when does it arrive" more than spatial exploration; the accessible pattern to pair with any live map.
has_example: false
---

## What it is
MBTA's Red Line page: a "Stations & Departures" list drawn as a vertical red line diagram, with a direction toggle
("Northbound · Alewife · Change Direction") and a station search. Below it, a 688×400 Leaflet map shows the line and
**31 live train markers** (arrow icons pointing in the direction of travel). `crop-list-and-map.jpg` shows the map under the list.

## Key techniques
- **List first, map second**: the diagram is the main content, with branches labelled ("BRAINTREE BRANCH", "ALEWIFE BRANCH"),
  connecting bus routes as chips, and parking and step-free icons per stop.
- **Arrow markers** show heading at a glance, unlike plain dots.
- **Light OSM basemap** with the route in brand red, so the line and trains stand out without a custom style.
- **Leaflet attribution visible** ("Leaflet | © OpenStreetMap contributors").

## Accessibility
- The map container is focusable (`tabindex=0`), and arrow keys pan it (measured), but it has **no label or role**.
- Vehicle markers are `<img alt="">` with no focus: decorative to screen readers. That's acceptable only because the list
  above carries the same information.
- No motion under reduced motion (trains update in place).

## Weaknesses
- The list doesn't show live train positions ("approaching Park St"), so the live data appears only on the map.
- Leaflet 1.9.4 (last release May 2023) fails our six-month maintenance gate. Keep the pattern, not the library.

## Related entries
- `map/geops-live-transit-vehicles`, `data-table/govuk-numeric-semantic-table`.
