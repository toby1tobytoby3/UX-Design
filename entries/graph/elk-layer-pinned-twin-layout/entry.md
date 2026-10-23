---
title: Layered dependency graph with every node pinned to its business layer (ELK partitioning)
pattern: graph
page_type: dashboard
tags: [data-viz, open-source, b2b, interactive]
source_url: https://eclipse.dev/elk/reference/options/org-eclipse-elk-partitioning-partition.html
source_site: eclipse.dev
captured_at: 2026-10-23
captured_by: toby
input: library-render
version: elkjs 0.12.0
licence: EPL-2.0 OR GPL-3.0-or-later
rating: 4
why_it_works: Each node is pinned to its semantic layer (journeys, processes, applications, environments, CIs, hosting, networks), so the diagram's rows always mean something, and orthogonal edge routing keeps dense cross-layer dependencies readable.
use_when: Any layered architecture or dependency map where rows have fixed meaning (a digital twin's layers, a service tier diagram, a data lineage by stage), including nodes with no edges.
has_example: false
---

## What it is
A 35-node, 43-edge seeded graph across seven layers, laid out by elkjs 0.12.0 (`layered` algorithm, top to bottom,
orthogonal routing) with `elk.partitioning` pinning each node to its layer. Rendered to SVG in `preview.html`.
Benchmark script and numbers: `layout-bench.mjs`, `evidence.json`.

## Key techniques
- Root: `'elk.partitioning.activate': 'true'`; each child: `layoutOptions: { 'elk.partitioning.partition': '<layer index>' }`.
- **Also set `'elk.separateConnectedComponents': 'false'`.** Without it, ELK lays out disconnected parts separately
  and the pins are silently ignored (our first render put the Networks layer at the top).
- `'elk.edgeRouting': 'ORTHOGONAL'` for right-angled, bundled-looking edges.
- **Lay out at build time for anything large.** elkjs is 442 KB gz; precompute positions per scope and ship them as
  data, so the browser never loads ELK. For small, interactive graphs, run it in a Web Worker (`elk-worker.min.js`).
- Layout time (Node, same seeded graph): 35 nodes 193 ms · 500 nodes 622 ms · 2,000 nodes 4.7 s · 5,000 nodes 25.6 s.
  dagre was 9× slower at 2,000 nodes and didn't finish 5,000 (`graph/dagre-structural-ranks`).

## Accessibility
Layout engines render nothing; accessibility is the renderer's job. Here the SVG has `role="img"` and a description.
In a product, pair the diagram with a list or tree of the same dependencies.

## Weaknesses
- Licence is **EPL-2.0 or GPL-3.0**: fine to use unmodified in most products, but check with legal before shipping.
- Too slow for live, in-browser layout of thousands of nodes; precompute.
- Option names are long and partly undocumented in elkjs itself; the Eclipse ELK reference is the source of truth.

## Related entries
- `graph/dagre-structural-ranks`: the smaller, faster-for-tiny-graphs alternative that can't pin layers.
- `3d/blueprint-linework-data-hall`: the physical view beneath these logical layers.
