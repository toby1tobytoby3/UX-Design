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
Guides, scores and defaults are evidence-based starting points, not law. Real projects have edge cases: when a
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
5. **Be honest about gaps.** If no guide or source covers the category, say so, answer from general knowledge,
   flagged as unverified, and suggest adding references with `ux-add`. Mention `needs_capture` entries as lower confidence.

## Categories covered
| Category | Guide | Sources profiled | Patterns |
|---|---|---|---|
| chart | `guides/charts.md` | 9 (see `SOURCES.md`) | `chart/*`, `dashboard/*` |
| 3d | `guides/3d.md` | 5 (see `SOURCES.md`) | 6 live captures in `3d/*` |
| Everything else in `taxonomy.md` | – (patterns only) | – | see `CATALOG.md` |

When a new category gets 3+ sources, add a guide using `guides/charts.md` as the template and add a row here.
