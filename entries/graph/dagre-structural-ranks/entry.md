---
title: Small layered DAG laid out by dagre, with ranks chosen from graph structure
pattern: graph
page_type: dashboard
tags: [data-viz, open-source, minimal]
source_url: https://github.com/dagrejs/dagre
source_site: github.com
captured_at: 2026-10-23
captured_by: toby
input: library-render
version: @dagrejs/dagre 3.1.1
licence: MIT
rating: 3
why_it_works: A 17 KB, MIT layered layout that turns a small directed graph into tidy top-to-bottom ranks in tens of milliseconds, which is enough for flow charts and small dependency diagrams drawn live in the browser.
use_when: Small directed graphs (under ~300 nodes) laid out live in the browser, where rows don't need fixed meaning: pipelines, workflow diagrams, React Flow auto-layout.
has_example: false
---

## What it is
The same 35-node, seven-layer seeded graph as `graph/elk-layer-pinned-twin-layout`, laid out by @dagrejs/dagre 3.1.1
(`rankdir: TB`, `nodesep: 12`, `ranksep: 40`) and drawn as SVG with edge polylines from dagre's `points`. Lanes are
labelled with the rank dagre chose, not our semantic layer, to show the difference honestly.

## Key techniques
- Create the graph with `{ multigraph: true }` if two nodes can have more than one edge; named edges throw otherwise.
- Edge geometry comes back as `g.edge(e).points`; draw it as a polyline or smooth it with a curve.
- Use it for **live** auto-layout of small graphs: 35 nodes in 22–40 ms.

## Accessibility
Renders nothing itself; pair the drawing with a list of the same edges.

## Weaknesses
- **No way to pin a node to a layer.** Rank is computed (network simplex) and any `rank` you pass is overwritten, so
  nodes with no incoming edges float to rank 0. In the render, the Networks layer's orphans (n28, n30, n33) sit in the
  top row next to Journeys.
- **Scales badly:** 500 nodes 1.4 s, 2,000 nodes 42.6 s, 5,000 nodes didn't finish in 10 minutes (ELK: 4.7 s and 25.6 s).
- Straight-segment edges with kinks; no orthogonal routing.

## Related entries
- `graph/elk-layer-pinned-twin-layout`: pins layers and scales further; precompute it at build time.
