---
title: Taste Skill (design-taste-frontend)
kind: source
pattern: design-skills
page_type: landing
tags: [open-source, editorial, illustrative, animated]
source_url: https://github.com/Leonxlnx/taste-skill
source_site: github.com/Leonxlnx
captured_at: 2026-10-26
captured_by: toby
input: skill-repo
version: 12af471
licence: MIT
s_look: 2
s_interact: 5
s_coverage: 3
s_a11y: 3
s_perf: 3
s_react: 3
s_bundle: 3
s_licence: 4
why_it_works: Art direction for pages, distilled from 247 gallery sites: a script deals three researched directions to choose from, the idea comes from the subject, and a browser inspector checks a strict no-ornament house style and a look-and-fix loop on screenshots.
use_when: A landing or brand page where a point of view matters more than conversion clarity and you can supply or fetch real imagery (it finds credited open-archive pictures).
avoid_when: The page's job is to compare things quickly, as a pricing page is: its page was the most distinctive and the hardest to use. Not a UX audit: as a reviewer it caught only the measurable and style problems.
alternatives: [hallmark, ui-ux-pro-max, anthropic-frontend-design]
has_example: false
---

## Verdict
**The most distinctive page and the weakest pricing page.** It passed all 14 scripted checks (the only skill to do so) and
both judges gave it the top mark for distinctiveness (5 of 5), but ranked it last overall (2.88 against 3.63 for the
control): staggered plan cards, prices below the first screen, a collage of ledger scans and extra panels the brief didn't
ask for. It cost 2.8 times the control's tokens and 16 minutes to build. As a reviewer it matched the control (28 of 31).
Choose it for brand pages, not for comparison pages.

## Scorecard (n = 1 run per track)
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 2 | Jury 2.88 against 3.63 (distinctiveness 5, hierarchy 2, craft 2.5, brief fit 2) |
| Interactivity | 5 | `draw.mjs` deals directions; `inspect.mjs` measures the page in a real browser (final run 0 FAIL); screenshots at three widths and a juror's rubric |
| Coverage | 3 | Build 14 of 14 checks against 12 of 14 (band 5 both); review 90% against 90% |
| Accessibility | 3 | axe 0, focus visible on 24 of 24 stops, 90% of targets at least 24 px; review found 10/11 accessibility defects |
| Performance | 3 | Build 248k tokens, 60 tool calls, 956 s against 88k, 14, 129 s; review 120k against 85k. Mean 2.1x |
| React/Next fit | 3 | Any stack (HTML, React, Next, Vue, Svelte, Astro, Tailwind named), output was single-file HTML |
| Bundle size | 3 | 543 lines of `SKILL.md`, 2.4 MB with a research library and scripts |
| Licence & health | 4 | MIT, last commit the day before vetting, an active changelog with community fixes. Disclosed: `assets.mjs` fetches open-archive images (credited on the page); `install.sh` symlinks into `~/.claude/skills` only when run. README carries sponsors and an app upsell |

## Benchmark
**Build:** all 14 checks pass; page weight 976 KB (two credited archive photographs from Wikimedia Commons). Judges: both
praised the point of view and marked it down for hierarchy and brief fit: prices not visible on the first screen, a
broken wordmark at 390 px, a mobile page of about 7,500 px. **Review:** 28 of 31 (missed terminology, radius nesting,
landmarks); 11 further valid findings, none wrong. Details: `benchskills/out/build/taste-skill/`,
`benchskills/out/review/taste-skill/`.

Found in the runs: the inspector crashes as root without `--no-sandbox` and the skill documents only `CHROME_PATH`
(the run used a wrapper outside the skill); some inspector findings were heuristic noise (navy fields counted as blank, a
small label above a price read as an eyebrow); the skill asks for footage and four or more real pictures, and none
honest existed. As a reviewer it reports banned patterns and misses real usability defects (focus outlines, positive
tabindex, zoom lock, unnamed buttons, colour-only cells), which the run found by its own probes.

## Using it here
Not vendored. Pinned and fetched by `node benchskills/fetch.mjs`. If adopted, copy `skills/taste-skill/` unmodified into
`vendor/skills/`; don't run `install.sh` (it writes into the home directory).

## Limits
One brief, one run per track, two judges. The jury scores a pricing page by how it compares plans; a brand page would
favour it more.
