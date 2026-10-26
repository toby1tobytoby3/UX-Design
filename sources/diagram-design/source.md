---
title: Diagram Design
kind: source
pattern: design-skills
page_type: docs
tags: [open-source, editorial, data-viz, minimal]
source_url: https://github.com/cathrynlavery/diagram-design
source_site: github.com/cathrynlavery
captured_at: 2026-10-26
captured_by: toby
input: skill-repo
version: b8f3617
licence: MIT
s_look: 2
s_interact: 3
s_coverage: 2
s_a11y: 1
s_perf: 3
s_react: 3
s_bundle: 3
s_licence: 5
why_it_works: An editorial diagram system: 45 diagram types drawn as one self-contained HTML and SVG file in your brand, with draw.io, Mermaid and Excalidraw import and PNG or SVG export.
use_when: You need a branded diagram of a type the skill has a reference for (swimlane, sequence, ER, quadrant, Wardley, service blueprint, journey) and can accept fine print, or you are importing from draw.io, Mermaid or Excalidraw.
avoid_when: The diagram must read comfortably on a phone or at small sizes, or it is a plain process explanation: on the library-pipeline brief the unaided model's card layout beat it with both judges.
alternatives: [archify]
has_example: false
---

## Verdict
**Elegant and disciplined, but on the one brief we gave it, worse than no skill.** Both blind judges ranked the
control's HTML card diagram first (4.75 out of 5), Diagram Design second (3.63) and Archify last (1.75). The skill drew a
clean four-lane swimlane with one focal element and every required label, but its type is 8 px on desktop and 7 px on a
phone, so it fails the text-size checks the control passes. Its own phone fix is a scrolling wide SVG that shows a third
of the canvas; the run had to add a second single-column SVG to meet the brief. The gap may be narrower for diagram types
the control would have drawn worse (ER, quadrant, Wardley), which this benchmark did not test.

## Scorecard (n = 1 run per track)
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 2 | Jury 3.63 against 4.75 for the control (band 4 against 5) |
| Interactivity | 3 | `self_check.py` and per-type checklists, but the connector-geometry verifier (`verify-geometry.py`) lives outside the skill folder in the upstream repo, so it was not available to the run |
| Coverage | 2 | 10 of 12 scripted checks against 12 of 12; both fails are text size |
| Accessibility | 1 | Text 8 px at 1280 and 7.1 px at 390; no axe violation above moderate; text alternative present |
| Performance | 3 | 191k tokens, 24 tool calls, 471 s against 81k, 9, 88 s (2.4x) |
| React/Next fit | 3 | Standalone HTML/SVG in its own style guide; can take your brand colours and fonts, not your components |
| Bundle size | 3 | 395 lines of `SKILL.md`, 5.2 MB with 45 type references and templates |
| Licence & health | 5 | MIT, last commit the day of vetting, a privacy policy that says no telemetry; output loads Google Fonts |

## Benchmark (diagram track: how the library turns a reference into an answer)
24 of 24 required labels present, no overlapping or spilling text, no sideways scroll at 390, no invented facts (read by
hand). Fails: effective text under 11 px at 1280 and under 10 px at 390. Page weight 1.8 MB (Google Fonts). The run
answered the style-guide gate with "keep the default" as the brief required. Details: `benchskills/out/diagram/diagram-design/`.

## Using it here
Vendored unmodified in `vendor/skills/diagram-design/` with its bundled icon notices (Tabler MIT, Simple Icons CC0, log-z
logos MIT). Its slash commands (`/doctor`, `/export-diagram`, the importers) are plugin commands and were not vendored;
the skill's own text covers the same procedures. Vet result: base64 decoding is draw.io import, nothing runs at install.

## Limits
One brief, one run, a process diagram. The skill's strengths (45 types, brand onboarding, import and export) were not
exercised. The jury is two model judges; the scripted checks are the harder evidence.
