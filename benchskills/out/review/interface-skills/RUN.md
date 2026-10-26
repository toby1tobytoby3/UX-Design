# RUN: better-interface on seeded-pricing.html

Steps followed from `vendor/skills/better-interface/SKILL.md`:

1. Read the brief and SKILL.md in full, plus `review-format.md` (the skill's output format).
2. Step 1, resolve scope: single static fixture, whole page. Stated in the report.
3. Step 2, change review routing: not applicable (not a branch, PR or diff).
4. Step 3, recon: stack is plain HTML plus inline CSS, three custom properties, no framework, no test command. Looked for project interface docs; none for the fixture (the repo `CLAUDE.md` is about the library, not interface rules). Stated in the report.
5. Step 4, loaded all six domain skills (SKILL.md of better-accessibility, better-layout, better-writing, better-typography, better-colors, better-ui) in the skill's order, plus `better-colors/contrast.md`, `better-accessibility/motion-and-zoom.md` and `hit-areas.md`. I did not open the other reference files (forms, focus-and-keyboard, screen-readers, semantics, patterns and so on); I relied on each SKILL.md's rules and its "Before you finish" tables.
6. Step 5, verify: rendered the page in Chromium via Playwright (scripts kept in the scratchpad, not the output folder).
7. Applied the shared severity scale and escalation triggers, "prefer the cheaper fix" (several Afters are deletions: rows 1, 7, 9, 15), consolidated systemic findings and capped at 15.
8. Wrote one ranked table in the review-format layout, with coverage, verification and verdict.

Rendering checks: full-page screenshots at 1280, 768, 375, 320; `scrollWidth` and element rects at each width; computed font family, size, line-height, colors per element; WCAG contrast computed by script for 20 elements; pixel-sampled hero gradient behind the lede text; 20-stop Tab walk with computed outline; accessibility tree snapshot; hover plus 250ms sampling on plan card 3; reduced-motion emulation; anchor click on "Pricing" to see the offset under the sticky header; heading, landmark, label, alt census.

Skipped or not possible: real screen reader; 200% zoom directly (used 320px); Safari/iOS; real Impact/Comic Sans; the skill's step "find a project preview or test command" (none exists). No skill step failed.

Skill friction: the 15-finding cap forced me to merge or leave out several smaller issues (landmarks, alt text, copy mismatch, hero capitalisation). The skill prescribes "report only what the owning skill confirms" and says to leave colours alone, so the contrast After values are offered as measured suggestions only.
