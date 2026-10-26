---
title: UI UX Pro Max
kind: source
pattern: design-skills
page_type: app
tags: [open-source, accessible, react, saas]
source_url: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
source_site: github.com/nextlevelbuilder
captured_at: 2026-10-26
captured_by: toby
input: skill-repo
version: 1f88579
licence: MIT
s_look: 3
s_interact: 3
s_coverage: 3
s_a11y: 3
s_perf: 5
s_react: 5
s_bundle: 4
s_licence: 4
why_it_works: A searchable local database of 79 styles, 192 product palettes, 74 font pairings and 119 UX guidelines across 22 stacks, with a priority table that puts accessibility and touch first and a design-system generator.
use_when: You want named, sourced UX rules as a checklist, or a starting palette, font pairing and style for a product type, in a stack it knows (React, Next, Tailwind, shadcn, Vue, Svelte, Flutter, SwiftUI).
avoid_when: You need an audit with measurements: it has no rendering or contrast step, its search returned off-topic rows for review queries, and its generated pattern for pricing pushed trust badges, logo carousels and stats the brief forbade.
alternatives: [hallmark, interface-skills]
has_example: false
---

## Verdict
**A useful rules reference with a modest lift.** Its pricing page scored 3.88 against 3.63 for the control (a gap inside
the noise of one run and two judges) and it passed 13 of 14 checks; as a reviewer it found 28 of 31 defects, the same as the
control. The most useful part is `references/quick-reference.md`: named rules by category that work as an audit checklist
and let each finding cite a standard. The generated design system gave a coherent palette, but parts of it fought the brief.
At 1.5 times the control's tokens it is cheap enough to use as a reference; don't expect it to find or fix more by itself.

## Scorecard (n = 1 run per track)
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Jury 3.88 against 3.63 (hierarchy 4, craft 4, distinctiveness 3, brief fit 4.5): same band |
| Interactivity | 3 | A search tool and a persisted design system, but no step that renders or measures the result |
| Coverage | 3 | Build 13 of 14 checks against 12 of 14; review 90% against 90% |
| Accessibility | 3 | axe 0, focus visible on 16 of 16 stops, every target at least 44 px; review found 11/11 accessibility defects |
| Performance | 5 | Build 134k tokens, 24 tool calls, 245 s against 88k, 14, 129 s; review 121k against 85k. Mean 1.5x |
| React/Next fit | 5 | 22 technology stacks including React, Next, Tailwind and shadcn; detects the stack from `package.json` |
| Bundle size | 4 | 215 lines of `SKILL.md`, 3.6 MB of data (the repository is 22 MB because 13 skills are duplicated for the CLI) |
| Licence & health | 4 | MIT, last commit the day of vetting. A sample `stack/.claude/settings.json` has a broad `Read(//home/**)` allow and `enableAllProjectMcpServers` (not active unless copied); one script scrapes Pexels for slide backgrounds; the README carries donate links and cross-promotion |

## Benchmark
**Build:** fails only "headline and call to action in the first screen" (the call to action sits below it). All 37 facts
present, nothing invented, page weight 139 KB plus Google Fonts. **Review:** 28 of 31 (missed plan/package/tier
terminology, radius nesting and the purple-blue gradient); 14 further valid findings, none wrong. Details:
`benchskills/out/build/ui-ux-pro-max/`, `benchskills/out/review/ui-ux-pro-max/`.

Found in the runs: the generated "Trust & Authority" pricing pattern pushed security badges, logo carousels and stats, which
the brief forbids (the run dropped them); its `pages/pricing.md` override came out labelled "Settings / Profile" with a
1,400 px grid (ignored); `pro-rules.md` covers native apps only; "emoji icons" returned no results. A second parallel run
wrote screenshots with the same scratch file names into this run's folder; the run deleted that folder and re-ran its
checks, and its `index.html` was unchanged (hash before and after). The review report was returned as text because the
harness refused the agent's file write; it is transcribed verbatim (`RUN.md` says so).

## Using it here
Not vendored. Pinned and fetched by `node benchskills/fetch.mjs`. If adopted, copy `.claude/skills/ui-ux-pro-max/` and the
`src/ui-ux-pro-max/data` it links to, set `CLAUDE_PLUGIN_ROOT`, and treat its output as suggestions (the skill says so).

## Limits
One brief, one run per track, two judges; one parallel-run contamination incident noted above.
