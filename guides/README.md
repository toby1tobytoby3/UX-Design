# How to answer with the UX library

Read this first. It's the map for any agent using this repo to help build UI.

## What's here
| Layer | Where | Answers |
|---|---|---|
| **Guides** | `guides/<category>.md` | "What should I use for this job?" Decision tables plus defaults |
| **Source profiles** | `sources/<slug>/source.md`, compared in `SOURCES.md` | "Which library or site is best, and why?" Scored on 8 criteria with evidence |
| **Patterns** | `entries/<pattern>/<slug>/` | "What does a great version look like?" Screenshots, analysis, code |
| **Evidence** | `bench/` (charts), `bench3d/` (3D) | Same-task benchmarks behind the scores: renders, bundle sizes, a11y probes |
| **Index** | `catalog.json` (`kind: pattern` or `source`) | Everything above, machine-readable |
| **Conventions** | `taxonomy.md`, `guides/source-rubric.md`, `our-design/` | Vocabulary, scoring, our stack's rules |

## Guidance, not rules
Guides, scores and defaults are evidence-based starting points, not law, and the library is a curated set of
recommendations rather than a closed list. Real projects have edge cases: when a
default doesn't fit, depart from it and say why in the answer. The few hard limits are integrity and legal ones:
don't present invented screenshots or results as captured, and don't paste captured third-party code into our
codebase (open-source code under its licence is fine).

## Avoid (checked 18 Oct 2026)
Don't recommend these as defaults. Source: `research/catalogue/excluded.csv` (with evidence links); maintenance means no
meaningful release or commit in the last six months.

| Tool | Why | Use instead |
|---|---|---|
| cmdk | Unmaintained (last release Mar 2025). shadcn/ui's Command component is built on it | Base UI or React Aria combobox/menu; Mantine Spotlight |
| Vaul | Its README says unmaintained | Base UI Drawer |
| Lottie Web | Unmaintained (last release May 2025) | Rive runtime, or CSS/Motion |
| tldraw SDK | Production use needs a paid licence key | Excalidraw, React Flow, Konva |
| Remotion | Licence limits companies over three people | wavesurfer.js + Konva for timelines |
| React Bits, Animate UI | MIT + Commons Clause (not open source) | Magic UI free components, Motion |
| Mapbox GL JS, Google Maps (as a default) | Proprietary terms; paid per call | MapLibre GL JS (+ deck.gl), `guides/maps.md` |
| Leaflet, react-leaflet | No Leaflet release since May 2023 (2.0 still alpha); react-leaflet is Hippocratic-2.1, not OSI | MapLibre GL JS; OpenLayers for GIS formats |
| tile.openstreetmap.org, public Nominatim (in a product) | No SLA, can block without notice; no client autocomplete | Self-hosted PMTiles or OpenFreeMap; a hosted geocoder |
| AI SDK RSC | Experimental; not for production (its own docs) | AI SDK UI typed tool parts |
| AI Elements (legacy package) | Deprecated end of Nov 2026; moved into shadcn/ui | shadcn/ui AI components (copy-in) |
| Tiptap AI, BlockNote AI, CopilotTextarea | Paid; GPL or paid; deprecated (`guides/agentic-ui.md` §7) | Our AI SDK inline build |
| ffmpeg.wasm, Theatre.js, WebAV, TimeChart, webgl-plot, prompt-kit, Park UI, golden-layout | Fail the six-month maintenance gate | See the category's shortlist in `research/categories.md` |

**Free core, paid edges.** These are fine, but only their free scope: AG Grid Community (not Enterprise), Dockview core
(not dockview-enterprise), FullCalendar Standard (not Premium resource timelines), Schedule-X core (not premium plugins),
CopilotKit SDKs (not Showcase or Intelligence). Check the exact feature against the edition matrix before relying on it.
GSAP is free but not open source (Webflow licence). axe-core (MPL-2.0) is fine as a test-only tool.

## Answering a request
0. **Search first:** `node scripts/find.mjs "<request>"` maps the request's words to categories, guides and
   entries, and prints the coverage line (vocabulary in `guides/aliases.json`, tests in `scripts/find.test.mjs`).
1. **Whole brief?** ("a trading terminal", "an AI agent workspace") Start with `guides/scenarios.md`: a starting stack
   per scenario, what must be right, what to test, and what the library holds. Then the category guides below.
2. **Classify it.**
   - *Category* ("I need a chart / date picker / carousel") → step 3.
   - *Look* ("a dark hero", "a pricing toggle like Notion") → step 4.
   - *Specific source* ("is ECharts any good?") → read its profile, then compare with `SOURCES.md`.
3. **Category: guide, then sources.** Open `guides/<category>.md` and take the form from the job table and
   the library from the fit table. Confirm against `SOURCES.md` and the chosen profile's "Found in the benchmark".
   Answer: **"Use X (score) because…; runner-up Y if…; change these defaults: …"**. Then go to step 4 for patterns.
4. **Patterns.** Filter `catalog.json` by `pattern` (see `taxonomy.md`), rank by fit then `rating`, and view
   the first image before recommending. Return the top 3 with techniques that apply to this task.
5. **Code.** Prefer, in order: `example.tsx` (our rebuild), runnable `option.js` / `bench/libs/*`, `preview.html`.
   `source.html` / `styles.json` are reference only (see the hard limits above). Open-source code can be reused under its licence.
6. **Coverage, then explore.** Open the answer with a coverage line (strong / partial / none). The library is curated
   recommendations, not the only allowed answer: when coverage is partial or none, or something outside it is clearly
   better, research it yourself (web search, `npm view` for licence and maintenance, live capture with `scripts/capture.mjs`,
   a rough rubric score) as described in `skills/ux-find/SKILL.md` step 4. Label each recommendation **Curated** or
   **Explored**, and offer to add good finds with `ux-add`. Mention `needs_capture` entries as lower confidence.
   For categories without their own guide, `guides/quick-picks.md` gives a one-line starting point (what to use, what
   to avoid, one tip); explore from there only as deep as the task needs.

## Categories covered
| Category | Guide | Sources profiled | Patterns |
|---|---|---|---|
| chart | `guides/charts.md` | 9 (see `SOURCES.md`) | `chart/*`, `dashboard/*` |
| 3d | `guides/3d.md` | 5 (see `SOURCES.md`) | 6 live captures in `3d/*` |
| Colour, tokens, materials, elevation (A1, A4) | `guides/foundations.md` | – (tools named in the guide) | `design-tokens/*` |
| Motion and state feedback (A5, A6) | `guides/motion.md` | 6 `motion` (benchmarked in `benchmotion/`) | `motion/*`, `feedback/*` |
| Accessibility and the component-library choice (A7) | `guides/accessibility.md` | 5 `ui-primitives` (benchmarked in `benchui/`) | `accessibility/*` |
| AI chat, agents, oversight, provenance (E1–E5) | `guides/agentic-ui.md` | `ai-chat` (benchmarked in `benchai/`) | `ai-chat/*`, `agent-activity/*`, `ai-review/*`, `ai-provenance/*` |
| Inline AI assist: ghost text, rewrite, AI fill (E6) | `guides/agentic-ui.md` §7 | `ai-assist` (benchmarked in `benchinline/`) | `ai-assist/*` |
| Tables and data grids (B6) | `guides/tables.md` | 6 `data-table` (benchmarked in `benchtable/`) | `data-table/*` |
| Maps and live positions (C3, map side of C6) | `guides/maps.md` | 5 `map` (4 benchmarked in `benchmap/`) | `map/*` |
| App shell, panels and docking, dashboards (B1, B3, C2) | `guides/shell-panels.md` | 5 `panels` (benchmarked in `benchpanels/`) | `navigation/*`, `panels/*`, `dashboard/*` |
| Whole briefs (ten scenarios) | `guides/scenarios.md` | – (links to the category guides) | – |
| Everything else (command palette, overlays, forms, real-time data, graphs, editors, typography…) | `guides/quick-picks.md` (one line each, not benchmarked) | – | see `CATALOG.md` |

The library is complete at this level: the categories above have full guides, everything else has a quick pick.
Go deeper on a category only when a project needs it (`ux-find` explores, `ux-add` keeps the result). Status and the
team catalogue's shortlist per category: `research/categories.md`.
