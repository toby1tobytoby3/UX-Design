# UX resource catalogue (team research, 18 October 2026)

The team's parallel research: 62 curated tools across all 40 categories, with licence and six-month maintenance checks,
3 reference moments per category, 10 scenario recipes and an exclusion register. The original workbook is
`ux-resource-catalogue-2026-10-18.xlsx`; the CSVs are the sheets agents need.

| File | What it holds |
|---|---|
| `resources.csv` | One row per tool: role, recommendation (core / situational / watch), licence and licence class, maintenance gate with dated evidence, use when / avoid, best demo, editorial scores |
| `categories.csv` | Per category (A1–F3): curated tools, guide questions, starter-list changes, gaps that need custom work |
| `references.csv` | 3 reference URLs per category with the specific moment and what to learn (reviewed, not captured) |
| `scenarios.csv` | 10 scenario recipes (the same ten desktop briefs as `docs/test-run-10-briefs.html`) |
| `excluded.csv` | Tools excluded or bounded: maintenance, licence, paid tiers, deprecations |
| `examples.csv`, `reference-sites.csv` | Extra example links per tool; inspiration galleries (Siteinspire, Landbook, Recent) |

## How the library uses it
- **Candidate list, not verdict.** It decides *which* tools are worth looking at for a category. Our benchmarks (`bench*/`)
  and scored profiles (`sources/`) decide between them. Its scores are editorial (no measurements were run, as its
  own method sheet says), so they are not imported into our rubric; one scoring system only.
- **Already used in:** `research/categories.md` (tool shortlists per category), `guides/README.md` (Avoid list),
  `guides/source-rubric.md` (six-month maintenance gate), `guides/scenarios.md` (scenario recipes), `guides/aliases.json` (tool names).
- **Next:** building the missing categories starts from its shortlist and captures from its reference moments.

## Where our measurements disagree (measured evidence wins)
| Topic | Catalogue | Our benchmark |
|---|---|---|
| Motion default | Motion; anime.js for sequenced effects | Native CSS + React `<ViewTransition>` passed 4/4 in ~1 KB (not in the catalogue); anime.js defaults to 1 s and has no reduced-motion support (`sources/animejs`, 6.3) |
| CopilotKit | Situational, 84/100 | 5.5/10: 681 KB gz, two critical axe failures, bundled Streamdown corrupts tables (`sources/copilotkit`) |
| Diff review | Monaco Editor | `@pierre/diffs` + jsdiff; Monaco only if an editor already ships (`guides/agentic-ui.md`) |
| Inline AI (E6) | Not a category | Built: `guides/agentic-ui.md` §7, `benchinline/` |
| axe-core | Excluded (MPL-2.0 copyleft) | Kept as a **test-only** tool: MPL is file-level and nothing ships to users (`guides/accessibility.md`) |

Spot check: 25 maintenance and licence claims were re-checked against npm on 2026-10-18 and all held.
