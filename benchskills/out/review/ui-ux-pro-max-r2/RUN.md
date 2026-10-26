# RUN: ui-ux-pro-max review (r2)

Skill steps followed:
1. Read the brief (`briefs/review.md`).
2. Read the full `SKILL.md` for ui-ux-pro-max.
3. Loaded both reference files the skill names: `references/quick-reference.md` (full 10-category rule set, used as the review checklist) and `references/pro-rules.md` (read in full). `pro-rules.md` is scoped by the skill to native/mobile app UI, so I used it only for the icon, contrast and accessibility items that carry over to web.
4. Step 1 (analyse the request): product type is a SaaS pricing page. Stack: none detectable (a single static HTML file, no `package.json`), so I did not pick a stack.
5. Ran the skill's local search script (`scripts/search.py`, offline, no installs) with `--domain ux` for: focus not obscured sticky header, touch target size spacing, pricing page plan comparison, reduced motion marquee pause, viewport zoom disable. The pricing-page query returned unrelated results (image optimisation, active nav state), so I discarded it and used the priority table instead, per the skill's "retry/fallback" rule.

Skipped:
- Step 2 (`--design-system`, persist, dials) and Step 4 (`--stack`): these are for building new pages, not reviewing an existing one.
- No retry of the pricing-page search; I judged the quick-reference rules sufficient.

Checked by rendering (Playwright Chromium, `--no-sandbox`):
- Screenshots at 1280 and 375 px (full page).
- `scrollWidth` vs viewport (375 px: 584 vs 375), card sizes at both widths, `.feature-line` scrollWidth vs clientWidth (357 vs 180).
- Computed contrast ratios for the listed colour pairs (formula computed in script).
- Tab order and computed `outline-style` of each focus stop; Shift+Tab at 375x667 to look for focus hidden under the sticky header (none found).
- Hover on a plan card (width stays the same in the flex layout; height jumps for card 3).
- Animation name under `prefers-reduced-motion: reduce` (still `scroll`).
- Target sizes of buttons, footer links and the banner close button.

Failures: none in tooling. Scratch scripts live in the session scratchpad and are not part of the output. The fixture was not edited and nothing else under `benchskills/` was read.
