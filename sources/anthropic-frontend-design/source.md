---
title: Anthropic frontend-design
kind: source
pattern: design-skills
page_type: landing
tags: [open-source, minimal, editorial]
source_url: https://github.com/anthropics/skills/tree/main/skills/frontend-design
source_site: github.com/anthropics
captured_at: 2026-10-26
captured_by: toby
input: skill-repo
version: dbd4588
licence: Apache-2.0
s_look: 3
s_interact: 2
s_coverage: 3
s_a11y: 3
s_perf: 5
s_react: 3
s_bundle: 5
s_licence: 5
why_it_works: A 72-line prompt that makes the agent act as a design lead: ground the design in the subject, avoid generic defaults, choose type and palette on purpose, and review its own screenshots.
use_when: You want a cheap nudge away from template output on any page and will check accessibility, forms and tables yourself.
avoid_when: You need checks, measurements or rules for accessibility, forms, tables or toggles: it has none, and no scripts.
alternatives: [hallmark, taste-skill, ui-ux-pro-max]
has_example: false
---

## Verdict
**Indistinguishable from no skill on this brief, at 1.2 times the cost.** Its pricing page matched the control exactly on
the jury (3.63 each) and passed 13 of 14 checks to the control's 12. The run said the "avoid the generic defaults" list
and the plan-then-review pass forced real changes before any code was written (the three-card layout, hero stat and cream
palette were replaced by a ruled-ledger layout), but the skill says nothing concrete about accessibility, forms, tables or
toggles. It is the lightest way to add design pressure, and it adds little beyond it.

## Scorecard (n = 1 run)
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Jury 3.63 against 3.63 (hierarchy 3.5, craft 3, distinctiveness 4, brief fit 4) |
| Interactivity | 2 | Prose with a self-review step; no scripts, no inspector |
| Coverage | 3 | 13 of 14 checks against 12 of 14 (same band) |
| Accessibility | 3 | axe 0, focus visible on 13 of 13 stops; 86% of targets at least 24 px (fails the 90% bar) |
| Performance | 5 | 104k tokens, 16 tool calls, 232 s against 88k, 14, 129 s (1.2x) |
| React/Next fit | 3 | Names no stack; works with any |
| Bundle size | 5 | 72 lines, 19 KB |
| Licence & health | 5 | Apache-2.0, from Anthropic, no code to run, last commit 17 days before vetting |

## Benchmark
**Build** (pricing page): fails only the 24 px target-size bar (86%). All facts present, nothing invented, page weight 107 KB
plus Google Fonts. The run's own notes: radio semantics, live announcements, the mobile table, no-JavaScript content and
naming three identical call-to-action buttons came from its own judgement, not the skill. Details:
`benchskills/out/build/frontend-design/`.

## Using it here
Vendored unmodified in `vendor/skills/frontend-design/` (Apache-2.0, notice kept). It loads automatically when UI work
matches its description.

## Limits
One brief, one run, two judges. Not run on the review or diagram tracks (it is a builder).
