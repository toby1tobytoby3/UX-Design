---
title: ELK (elkjs)
kind: source
featured: graph/elk-layer-pinned-twin-layout
pattern: graph
page_type: dashboard
tags: [data-viz, open-source, b2b]
source_url: https://github.com/kieler/elkjs
source_site: github.com
captured_at: 2026-10-23
captured_by: toby
input: library-render
version: 0.12.0
licence: EPL-2.0 OR GPL-3.0-or-later
s_look: 4
s_interact: 1
s_coverage: 5
s_a11y: 2
s_perf: 4
s_react: 3
s_bundle: 1
s_licence: 3
why_it_works: The most capable open layout engine for node-link diagrams in JavaScript; layered layouts with fixed layer membership (partitioning), orthogonal edge routing, ports and nested graphs, plus force, tree, radial and rectangle-packing algorithms.
use_when: Layered architecture, dependency or lineage diagrams where rows have fixed meaning or graphs reach thousands of nodes, ideally laid out at build time or in a Web Worker.
avoid_when: You need a tiny bundle for live layout of a small graph (use dagre), or your licence policy forbids EPL/GPL dependencies.
alternatives: [dagre]
has_example: false
---

## Verdict
**Use it for layered twin and architecture diagrams, at build time.** It is the only one of the two that can pin each
node to a semantic layer, and it was 9× faster than dagre at 2,000 nodes. But it's 442 KB gz, so precompute positions
and ship them as data, or run it in a Web Worker for small interactive graphs. Check the EPL-2.0 licence with legal.

**Maintenance check (23 Oct 2026):** npm `time.modified` 2026-07-17 (0.12.0), inside the six-month window.

## Benchmark (rough, not a shared bench directory yet)
Same seeded seven-layer graph for both libraries, Node 22, layout time only (`entries/graph/elk-layer-pinned-twin-layout/evidence.json`):

| Nodes | elkjs | dagre |
|---|---|---|
| 35 | 193 ms | 40 ms |
| 500 | 622 ms | 1.4 s |
| 2,000 | 4.7 s | 42.6 s |
| 5,000 | 25.6 s | not finished in 10 min |

Found in the benchmark:
- `elk.partitioning` pins nodes to layers **only with `elk.separateConnectedComponents: false`**; otherwise the pins
  are silently ignored for disconnected parts.
- Orthogonal routing gave the cleanest edges of the two.
- Bundle: 442 KB gz for `elk.bundled.js` (GWT-compiled Java).

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Orthogonal routing and even spacing out of the box; layers pinned |
| Interactivity | 1 | Layout only; no rendering or interaction |
| Coverage | 5 | Layered, force, stress, mrtree, radial, rectpacking; partitions, ports, hierarchy |
| Accessibility | 2 | Not applicable (renders nothing); depends on the renderer |
| Performance | 4 | 2,000 nodes in 4.7 s; Web Worker build available |
| React/Next fit | 3 | Framework-agnostic, promise API; pairs with React Flow or our own renderer |
| Bundle size | 1 | 442 KB gz (avoid shipping: precompute) |
| Licence & health | 3 | EPL-2.0 / GPL-3.0 (weak copyleft, needs a legal check); release July 2026 |

## Coverage
| Need | Supported |
|---|---|
| Fixed layers (partitioning) | Yes, with the option above |
| Orthogonal edges | Yes |
| Nested / compound nodes | Yes |
| Ports (edges attach to sides) | Yes |
| Incremental layout | Partial (interactive layered strategies) |

Pattern entries: `graph/elk-layer-pinned-twin-layout`.
