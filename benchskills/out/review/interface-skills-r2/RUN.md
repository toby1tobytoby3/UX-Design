# RUN.md (Interface Skills review, repeat run r2)

> Transcribed by the orchestrator: the run agent's Write calls were refused by the harness ("Subagents should return findings as text, not write report files"), so it returned `report.md` and this file as text. Both were saved verbatim from that reply.

**Skill:** `vendor/skills/better-interface`. I read `SKILL.md` and `review-format.md` in full.

**Steps followed**
1. Read the brief (`benchskills/briefs/review.md`) and `better-interface/SKILL.md`.
2. Read `review-format.md`.
3. Loaded the six owning skills in the skill's order. I read each `SKILL.md` in full, plus the references named in the domain-skill sections: accessibility (focus-and-keyboard, forms, hit-areas, motion-and-zoom, screen-readers, semantics-and-aria), layout (grouping-and-alignment, spacing-and-adaptivity), writing (patterns), typography (spacing-and-sizing, wrapping-and-punctuation, details-and-accessibility), colors (contrast, color-usage), ui (surfaces, animations, icons, performance).
4. Step 1, scope: the whole single-page fixture. Recorded in the report.
5. Step 2, change review: not applicable, since this is not a branch, PR or diff.
6. Step 3, recon: the stack was identified from the source. No project convention documents exist for the fixture.
7. Step 4, domain review in order (accessibility, layout, writing, typography, colors, ui). Their severity ladders were replaced by the shared scale.
8. Step 5, verified by rendering (below).
9. Consolidated the findings by root cause to fit the 15-row cap and ranked the escalation triggers first. Used the review-format layout: coverage, one findings table, verification, verdict.

**Skipped or not read**
- I did not read these reference files: `better-typography/choosing-fonts.md`, `css-cheat-sheet.md`, `variable-fonts-and-opentype.md`; `better-colors/color-formats.md`, `palette-generation.md`, `palette-structure.md`, `token-naming.md`; `better-ui/enter-exit.md`, `icon-transitions.md`. They cover font choice, ramps, tokens and staged animation, none of which the fixture needed.
- Not run: the skill ships no scripts or preview command, so nothing was run beyond the rendering checks.
- Not verified: pinch-zoom on a real device, real screen-reader output, non-Chromium browsers.

**Failures**
- The Write of `report.md` to the output folder was refused by the harness. I did not retry another way.
- `page.accessibility` is not available in this Playwright version, so I used a CDP `Accessibility.getFullAXTree` session instead.
- My first "focus under sticky header" probe was a false positive (the header's own links). I dropped that claim and kept only the anchor-jump evidence.

**Checked by rendering** (Chromium via Playwright, `--no-sandbox`)
- 1280x800 full page; 320x256 and 640x400 renders with overflow audit.
- Computed contrast for 13 pairs; hero lede sampled from pixels.
- Tab order (22 presses) with computed outlines.
- Accessibility tree names, roles and landmarks.
- Ticker motion with and without `reducedMotion: 'reduce'`.
- Plan-card hover geometry.
- Anchor and scroll positions under the sticky header (`#plans`, `#faq`, Compare click).
- Mobile-emulated viewport meta (`visualViewport.scale` stayed 1).

I did not edit the fixture. I did not read `defects.json`, other runs' output or the benchmark scripts.
