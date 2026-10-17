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

## Answering a request
1. **Classify it.**
   - *Category* ("I need a chart / date picker / carousel") → step 2.
   - *Look* ("a dark hero", "a pricing toggle like Notion") → step 3.
   - *Specific source* ("is ECharts any good?") → read its profile, then compare with `SOURCES.md`.
2. **Category: guide, then sources.** Open `guides/<category>.md` and take the form from the job table and
   the library from the fit table. Confirm against `SOURCES.md` and the chosen profile's "Found in the benchmark".
   Answer: **"Use X (score) because…; runner-up Y if…; change these defaults: …"**. Then go to step 3 for patterns.
3. **Patterns.** Filter `catalog.json` by `pattern` (see `taxonomy.md`), rank by fit then `rating`, and view
   the first image before recommending. Return the top 3 with techniques that apply to this task.
4. **Code.** Prefer, in order: `example.tsx` (our rebuild), runnable `option.js` / `bench/libs/*`, `preview.html`.
   `source.html` / `styles.json` are reference only (see the hard limits above). Open-source code can be reused under its licence.
5. **Coverage, then explore.** Open the answer with a coverage line (strong / partial / none). The library is curated
   recommendations, not the only allowed answer: when coverage is partial or none, or something outside it is clearly
   better, research it yourself (web search, `npm view` for licence and maintenance, live capture with `scripts/capture.mjs`,
   a rough rubric score) as described in `skills/ux-find/SKILL.md` step 4. Label each recommendation **Curated** or
   **Explored**, and offer to add good finds with `ux-add`. Mention `needs_capture` entries as lower confidence.
   `research/categories.md` maps the categories still to be built.

## Categories covered
| Category | Guide | Sources profiled | Patterns |
|---|---|---|---|
| chart | `guides/charts.md` | 9 (see `SOURCES.md`) | `chart/*`, `dashboard/*` |
| 3d | `guides/3d.md` | 5 (see `SOURCES.md`) | 6 live captures in `3d/*` |
| Colour, tokens, materials, elevation (A1, A4) | `guides/foundations.md` | – (tools named in the guide) | `design-tokens/*` |
| Motion and state feedback (A5, A6) | `guides/motion.md` | 6 `motion` (benchmarked in `benchmotion/`) | `motion/*`, `feedback/*` |
| Accessibility and the component-library choice (A7) | `guides/accessibility.md` | 5 `ui-primitives` (benchmarked in `benchui/`) | `accessibility/*` |
| AI chat, agents, oversight, provenance (E1–E5) | `guides/agentic-ui.md` | `ai-chat` (benchmarked in `benchai/`) | `ai-chat/*`, `agent-activity/*`, `ai-review/*`, `ai-provenance/*` |
| Everything else in `taxonomy.md` | – (patterns only) | – | see `CATALOG.md` |

Categories still to build, with priorities and starting research: `research/categories.md`.
