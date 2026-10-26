---
title: Archify
kind: source
pattern: design-skills
page_type: docs
tags: [open-source, interactive, data-viz, devtools]
source_url: https://github.com/tt-a1i/archify
source_site: github.com/tt-a1i
captured_at: 2026-10-26
captured_by: toby
input: skill-repo
version: 81c6be8
licence: Apache-2.0
s_look: 1
s_interact: 5
s_coverage: 2
s_a11y: 1
s_perf: 5
s_react: 2
s_bundle: 3
s_licence: 4
why_it_works: A validated pipeline for architecture, workflow, sequence, data-flow, lifecycle, ERD, class, tree, timeline and waterfall diagrams as explorable standalone HTML, with schemas, browser checks, themes, motion and export, and a repository-evidence mode for tracing real code.
use_when: You are mapping a real codebase or system and want a checked, explorable diagram with source links, and a viewer on a laptop is enough.
avoid_when: The diagram has to be legible on a phone, carry a proper text alternative, or stay lightweight: the library-pipeline run was the least readable of three, and the repository is 104 MB.
alternatives: [diagram-design]
has_example: false
---

## Verdict
**The most engineered skill we tested, and the least readable output on our brief.** Its own gates (validate, deliver, a
strict check and a real-browser check) passed first time, and the run cost only 1.4 times the control's tokens. But both
judges ranked the result last (1.75 out of 5): at 1280 px the node text is about 7 px, at 390 px about 4.5 px (the viewer
does not fit the diagram to a phone; the skill says narrow layouts get containment only), and axe reports two serious
issues. The schema has no description field, so the text alternative is generic. Choose it for code-grounded system maps
viewed on a large screen, not for explainers.

## Scorecard (n = 1 run)
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 1 | Jury 1.75 against 4.75 for the control |
| Interactivity | 5 | `finalize` runs validation, delivery, strict checks and a browser check in one command; schemas per type; a `guide` command that routes a scenario to a type |
| Coverage | 2 | 9 of 12 scripted checks against 12 of 12 |
| Accessibility | 1 | Text 7.4 px at 1280 and 4.5 px at 390; axe: `label-content-name-mismatch` and `nested-interactive` (serious); generic text alternative |
| Performance | 5 | 115k tokens, 19 tool calls, 223 s against 81k, 9, 88 s (1.4x) |
| React/Next fit | 2 | Standalone viewer HTML from JSON candidates; no React or Tailwind path |
| Bundle size | 3 | 138 lines of `SKILL.md` but 17.7 MB in the skill folder (the repository is 104 MB, 475 code files) |
| Licence & health | 4 | Apache-2.0, last commit the day before vetting. Every delivery makes an update check over the network: disclosed, and off with `ARCHIFY_UPDATE_CHECK_DISABLED=1`, which caps this at 4 |

## Benchmark (diagram track)
24 of 24 required labels present; no overlaps or spill; no invented facts (read by hand); fits 390 px without sideways
scroll because the viewer shrinks the whole diagram. Fails: text size at both widths and the axe check. Page weight 844 KB.
Run notes: node tag text did not render, so layer names moved into sublabels; boundaries are limited to `region` and
`security-group`. Details: `benchskills/out/diagram/archify/`.

## Using it here
Not vendored: the repository is 104 MB and the result did not earn a place in `vendor/skills/`. The pinned commit is
fetched into `benchskills/.cache/` by `node benchskills/fetch.mjs` for re-runs. Vet result: base64 and secret-read hits are
an embedded asset and a contributor-card script; the only network behaviour is the update check.

## Limits
One brief and one run. The repository-evidence mode (tracing a real codebase), the explainer and the export formats were
not exercised. The jury is two model judges; the scripted checks are the harder evidence.
