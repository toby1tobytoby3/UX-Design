---
title: dagre (@dagrejs/dagre)
kind: source
featured: graph/dagre-structural-ranks
pattern: graph
page_type: dashboard
tags: [data-viz, open-source, minimal]
source_url: https://github.com/dagrejs/dagre
source_site: github.com
captured_at: 2026-10-23
captured_by: toby
input: library-render
version: 3.1.1
licence: MIT
s_look: 2
s_interact: 1
s_coverage: 2
s_a11y: 2
s_perf: 2
s_react: 3
s_bundle: 5
s_licence: 5
why_it_works: A small, MIT, single-purpose layered layout for directed graphs that lays out small diagrams in tens of milliseconds, which makes it the common auto-layout behind React Flow examples.
use_when: Live auto-layout of small directed graphs (under ~300 nodes) in the browser where rows don't need fixed meaning.
avoid_when: Rows must mean something (fixed layers), graphs exceed a few hundred nodes, or you need orthogonal edge routing (use ELK).
alternatives: [elkjs]
has_example: false
---

## Verdict
**Fine for small live diagrams, wrong for layered twins.** It's 17 KB gz and fast below ~100 nodes, but it can't pin
nodes to a layer (orphans float to the top) and it scales badly: 42.6 s at 2,000 nodes, and 5,000 didn't finish.

**Maintenance check (23 Oct 2026):** npm `time.modified` 2026-08-08 (3.1.1), inside the six-month window.

## Benchmark (rough)
See the table in `sources/elkjs/source.md` (same graph, same machine). dagre: 35 nodes 40 ms · 500 nodes 1.4 s ·
2,000 nodes 42.6 s · 5,000 nodes not finished in 10 minutes.

Found in the benchmark:
- Named parallel edges need `new Graph({ multigraph: true })`; without it, `setEdge` throws.
- Node `rank` is computed and overwritten; there's no public way to fix a node's layer.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 2 | Tidy ranks, but kinked straight edges and orphans in rank 0 |
| Interactivity | 1 | Layout only |
| Coverage | 2 | Layered (Sugiyama) only; compound nodes basic |
| Accessibility | 2 | Not applicable (renders nothing) |
| Performance | 2 | Fast under ~100 nodes; 42.6 s at 2,000 |
| React/Next fit | 3 | Framework-agnostic, sync API; common with React Flow |
| Bundle size | 5 | 17 KB gz |
| Licence & health | 5 | MIT; release August 2026 |

Pattern entries: `graph/dagre-structural-ranks`.
