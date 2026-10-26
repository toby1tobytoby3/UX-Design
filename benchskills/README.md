# benchskills: design skills, same brief, same checks

Which agent design skill is worth installing? Each skill gets the same brief for the kind of work it does, in a fresh
agent that follows only that skill's own `SKILL.md`, next to a **control run with no skill**. Scripts then measure
what each run produced. Results feed the `design-skills` source profiles (`sources/`) and `guides/design-skills.md`.

| Track | Brief | Skills tried | What is measured |
|---|---|---|---|
| `build` | `briefs/build.md`: the Ledgerly pricing page from `briefs/pricing-content.json` | Hallmark, Taste Skill, UI UX Pro Max, Anthropic frontend-design, control | 14 scripted checks (below) and a blind jury |
| `review` | `briefs/review.md`: audit `fixtures/seeded-pricing.html`, which has 31 planted defects (`fixtures/defects.json`) | Interface Skills (`better-interface`), Hallmark `audit`, Taste Skill, UI UX Pro Max, control | recall of the planted defects, by category and severity; findings that are not in the key are checked by hand |
| `diagram` | `briefs/diagram.md`: how the library turns a reference into an answer | Diagram Design, Archify, control | 12 scripted checks and a blind jury |

## Procedure
```bash
npm install                              # root: Playwright; here: axe-core  (cd benchskills && npm install)
export CHROMIUM_PATH=<chrome binary>     # only if Playwright's own browser is not installed
node fetch.mjs                           # pins every non-vendored skill at its commit in skills.json (.cache/, gitignored)
```
1. **Generate.** For each skill and track, start a fresh agent with the brief, the skill folder (`skills.json` `dir`) and an
   output folder `out/<track>/<id>/`. It reads the skill fully, follows it, and writes `RUN.md` (steps followed, failures,
   what it changed). It may not read other runs, `defects.json` or this folder's scripts. The control gets the same
   brief and no skill. Record each run's tokens, tool calls and minutes in `out/<track>/<id>/cost.json`.
2. **Measure.** `node run.mjs build`, `node run.mjs diagram`, `node run.mjs review` write `checks.json` per run.
   Review scores are regex matches against the key; read each report and record corrections in `adjust.json`
   (`add`, `remove`, `unlisted_valid`, `unlisted_invalid`, `notes`). The corrected numbers are the ones that count.
3. **Judge blind.** `node run.mjs jury-prep build|diagram` copies the screenshots under shuffled labels
   (`out/judges/<track>/blind/`, key in `key.json`). Two fresh agents rate each label 1-5 on four dimensions and write
   `judge-1.json`, `judge-2.json` (`ratings`, `rank`). They see images only.
4. **Merge.** `node run.mjs results` writes `results.json` (the control sits under `_baseline`) and
   `sources/<slug>/bench.jpg`; `npm run catalog` attaches it to each source profile.

## Build checks (each pass or fail)
No serious or critical axe violation at 390, 768 and 1280 · no sideways scroll at 390 and 768 · every Tab stop shows a
visible focus change · annual toggle works by keyboard and shows the annual prices · FAQ opens by keyboard · every fact in
`pricing-content.json` present · no infinite animation under `prefers-reduced-motion` · 90% of touch targets at least 24 px
(WCAG 2.5.8) · text at least 12 px · headline and "Start free trial" in the first 800 px at 1280 · nothing invented
(metrics, logos, testimonials, ratings, badges) · one `h1`, a `main`, `lang`, no positive `tabindex` · plan names and
prices visible with JavaScript off · no console errors or failed requests.

## Diagram checks
At least 90% of 24 required labels from the brief present · no overlapping text at 1280 or 390 · no text spilling out of
its box or clipped · fits 390 without sideways scroll · text at least 10 px effective at 390 and 11 px at 1280 · no
serious axe violation · a text alternative · no infinite animation under reduced motion · no numbers outside the brief ·
no console errors · self-contained (fonts from Google Fonts at most).

## Limits (read before trusting a score)
- **One run per skill per track.** Agents vary; a one-point rubric difference is noise. The control shows what the
  model manages unaided on the same day.
- **The skill is followed by an agent that reads it,** not loaded by Claude Code's skill system. Anything depending
  on the harness (auto-triggering, slash commands) is not exercised.
- **Network and keys.** Runs had no API keys and a restricted network. A step a skill could not complete is recorded
  in the run's `RUN.md` and counts against the skill only where the skill gave no fallback.
- **The jury is two model judges with no knowledge of the source.** It rates pages relative to each other, not to the
  world. The scripted checks are the harder evidence.
- **Single-file HTML** is the common denominator, so React and Tailwind fit is scored from the skill's text, not measured.
- **Skills are pinned** (`skills.json`). Re-run after a skill updates; the date and commit are in each profile.
- **Evidence kept in `out/`:** each run's output, `RUN.md`, `checks.json`, our screenshots (`shots/`), the blind judge files and
  scorer replies. PNG screenshots the skills' own tools made (Hallmark and Taste write several MB each) were deleted to keep
  the repository small; the skills regenerate them. Reports that a harness refused to let an agent write were transcribed
  verbatim from the agent's reply and say so in their `RUN.md`.
- **A first page-jury round was thrown away.** The capture did not scroll, so a page that reveals content as you scroll looked
  blank and both judges marked it down for it. The capture now scrolls through the page before measuring or photographing,
  every page was re-measured, and the jury was re-run with fresh labels. The diagram screenshots were pixel-identical, so that
  jury stands.
