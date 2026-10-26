---
title: Interface Skills (better-* review and polish skills)
kind: source
pattern: design-skills
page_type: app
tags: [accessible, open-source, react, devtools, minimal]
source_url: https://github.com/jakubkrehel/skills
source_site: github.com/jakubkrehel
captured_at: 2026-10-26
captured_by: toby
input: skill-repo
version: 592aedc
licence: MIT
s_look: 4
s_interact: 3
s_coverage: 3
s_a11y: 3
s_perf: 4
s_react: 5
s_bundle: 2
s_licence: 5
why_it_works: A set of 14 small, plain-markdown skills that review a screen across accessibility, layout, type, colour, copy and polish and return one ranked, located report with before and after code in the project's own styling system.
use_when: You want a structured review of a built screen or a pull request (better-interface, interface-review) or the domain skills on their own (better-accessibility, better-colors, better-typography, better-layout, better-writing, better-ui).
avoid_when: You need a raw count of every defect: the review keeps to 15 findings and folds minor ones into a coverage note. It also ships no inspector, so every measurement comes from the agent's own browser script.
alternatives: [hallmark, taste-skill, ui-ux-pro-max]
has_example: false
---

## Verdict
**The best-organised reviewer tested, but on this fixture it found no more than the unaided model.** It reported 27 of 31
planted defects (87%) against 28 (90%) for the control, with every accessibility defect found (11 of 11, the control found
10) and four missed. What it adds is not recall: it is a report a team can act on (severity, domain, line number, before and
after code, a verdict, a coverage note saying what was and wasn't inspected) at 1.6 times the tokens of the control.
Install it for review structure and the domain skills; don't expect it to surface problems a careful agent would miss.

## Scorecard (n = 1 run; see `benchskills/README.md` for limits)
| Criterion | Score | Evidence |
|---|---|---|
| Default look (report usability) | 4 | 15 ranked rows, each with location, before, after and why; overall verdict. Rows 3, 12 and 14 bundle several root causes, which makes them harder to hand out |
| Interactivity | 3 | Tells the agent to measure (tab the page, read the accessibility tree, emulate reduced motion, resize, translate, mirror) but ships no script: the run wrote its own Playwright probes |
| Coverage | 3 | 87% recall against 90% for the control: same band, so no gain |
| Accessibility | 3 | 11/11 accessibility defects against 10/11: same band |
| Performance | 4 | 134k tokens, 20 tool calls, 220 s against 85k, 9, 89 s for the control (1.58x) |
| React/Next fit | 5 | Fixes are written in the project's styling system; `better-typography` ships a CSS-to-Tailwind cheat sheet |
| Bundle size | 2 | The umbrella loads seven `SKILL.md` files (919 lines, 174 KB); the run read six plus three references |
| Licence & health | 5 | MIT, last commit the day before vetting, no install-time code, no hooks, no telemetry |

## Benchmark (review track: a pricing page with 31 planted defects)
Defects found by category: accessibility 11/11, contrast 3/3, typography 3/3, layout 4/5, writing 4/5, polish 2/4.
Missed: footer link size (the report decided it passes the WCAG 2.5.8 spacing exception), plan/package/tier terminology,
radius mismatch and the purple-blue gradient. The 15-finding cap pushed real defects (missing alt text, landmarks, emoji
icons, dead handlers) into a "noticed but left out" note; they are credited here because the report names them. Thirteen
further findings outside the key were valid and one was wrong. Details: `benchskills/out/review/interface-skills/`.

## What it is
`better-interface` routes a screen to `better-accessibility`, `better-colors`, `better-layout`, `better-typography`,
`better-writing` and `better-ui`, collects their evidence and returns one ranked verdict. `interface-review` does the same
for a branch, pull request or uncommitted change (it reports what the change made worse, not the whole codebase).
`explain-interface`, `break`, `state-machine` and `variant` are user-invoked commands (the harness will not let an agent
call them); `build-design` builds from a Figma file or a design image. Only the review path was benchmarked.

## Using it here
Vendored unmodified in `vendor/skills/` (13 of the 14 skills; `teardown` left out), loaded in this repo's sessions through
`.claude/skills`. Not shipped by the `ux-library` plugin. Vet result: no lifecycle scripts, hooks or telemetry; the
spawn and network hits are `teardown`'s viewer assets and documentation links.

## Limits
One run per skill; the answer key is 31 defects a careful agent with a browser can find, so it measures a floor, not a
ceiling. The skill was followed by an agent reading it, not loaded by Claude Code's skill system.
