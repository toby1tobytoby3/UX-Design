---
title: Hallmark
kind: source
pattern: design-skills
page_type: landing
tags: [open-source, accessible, saas, editorial, minimal]
source_url: https://github.com/Nutlope/hallmark
source_site: github.com/Nutlope
captured_at: 2026-10-26
captured_by: toby
input: skill-repo
version: 7ec8682
licence: MIT
s_look: 4
s_interact: 5
s_coverage: 3
s_a11y: 3
s_perf: 4
s_react: 3
s_bundle: 3
s_licence: 4
why_it_works: A design skill with a 16-rule floor that is checked in a real browser (sloplint), a theme dealt from 48 so consecutive builds don't converge, and redesign and audit commands that report by tier with file and line.
use_when: Building a new marketing page or screen that must not look generated, or auditing a page against a floor of checkable rules (tokens only, visible focus, reduced motion, no invented facts, mobile layout).
avoid_when: The page is dense with content: its word budget (about 80 words a screen) fought the brief and needed a "verbatim copy" stamp. Don't run it on an existing design unless you name it, as its own text says; as root it needs puppeteer-core and --no-sandbox for the render check.
alternatives: [taste-skill, ui-ux-pro-max, anthropic-frontend-design]
has_example: false
---

## Verdict
**The only skill that measurably improved the page.** Both blind judges ranked its pricing page first (jury 4.38 out of 5
against 3.63 for the no-skill control) and it was the best reviewer too (30 of 31 planted defects, 97%). It also costs
the most to run well: 2.3 times the control's tokens and five extra minutes on the build, plus two workarounds before its
linter would run. Use it when look and discipline matter more than speed.

## Scorecard (n = 1 run per track)
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Jury 4.38 against 3.63 (hierarchy 5, craft 4.5, distinctiveness 4, brief fit 4). Plans as full-width rows with price, features and call to action on one line |
| Interactivity | 5 | `sloplint --render` measures the built page in a browser against the floor and the run iterated to 0 FAIL; redesign and audit verbs; a tiered gate list |
| Coverage | 3 | Build: 13 of 14 scripted checks against 12 of 14. Review: 97% against 90% (band 5 both) |
| Accessibility | 3 | 0 axe violations; focus visible on 11 of 11 stops; only miss is touch targets (83% at least 24 px). Found 11/11 accessibility defects in review |
| Performance | 4 | Build 198k tokens, 40 tool calls, 442 s against 88k, 14, 129 s; audit 135k against 85k. Mean 1.9x |
| React/Next fit | 3 | Stack-agnostic: tokens at `:root`, `--url` mode for a running dev server; output was single-file HTML |
| Bundle size | 3 | 155 lines of `SKILL.md`, 6.7 MB of themes, references and 755 photographs |
| Licence & health | 4 | MIT, last commit four days before vetting. Disclosed opt-ins: a hook installer, a Together AI key for image generation. The page loads two font hosts (Google Fonts and Fontshare) |

## Benchmark
**Build** (pricing page): axe 0, no sideways scroll, every Tab stop shows focus, annual toggle and FAQ work by keyboard,
all 37 facts present, nothing invented, reduced motion respected, works without JavaScript. Fails only "90% of targets at
least 24 px" (83%). Page weight 90 KB plus fonts. **Review** (31 seeded defects): found 30; missed plan/package/tier
wording. 16 further valid findings outside the key, one wrong. Details: `benchskills/out/build/hallmark/`,
`benchskills/out/review/hallmark/`.

Found in the run: the 80-word screen limit cannot hold three plans, an eight-row table and five answers, so the run
used the skill's `copy: verbatim` stamp (the findings become notes); `sloplint --render` needs `puppeteer-core` and fails as
root without `--no-sandbox`, and the skill documents neither; no subagent tool was available so its two review passes ran
in-thread. As an auditor, half its gate list is generated-look style rules that said little about a page it didn't build;
usability defects (tabindex, zoom lock, unreachable controls) came from inspection.

## Using it here
Vendored unmodified in `vendor/skills/hallmark/` (26 Oct 2026), loaded in this repo's sessions, not shipped by the plugin.
It needs no key and costs nothing: leave `TOGETHER_API_KEY` unset (optional paid image generation; stand-ins are used
without it) and never run `scripts/install-hook.mjs` (it edits `.claude/settings.json`). Its browser lint needs
`puppeteer-core` and, as root, `--no-sandbox`; without them it still builds and the static checks run.

## Limits
One brief, one run per track, two judges. The pricing brief suits a skill that fights word counts badly; a sparser page
would not show that cost.
