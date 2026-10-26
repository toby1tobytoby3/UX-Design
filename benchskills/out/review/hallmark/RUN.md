# RUN.md: Hallmark `audit` on seeded-pricing.html

## Steps followed
1. Read the brief and `SKILL.md` in full.
2. The skill says the `audit` verb loads `references/redesign.md` first: read it in full. Followed its "Before" section and stopped where it says `audit` stops.
3. Step 0 pre-flight: no project around the fixture (no design.md, package.json, .hallmark/brand-spec.md, dev server), so nothing to cache; no `.hallmark/preflight.json` written. Genre inferred as modern-minimal (B2B SaaS) because the page has no stamp.
4. Ran `node sloplint.mjs <fixture> --genre modern-minimal --render --before` with cwd = the output folder. Result: 58 FAIL, 17 REFLEX, 8 WARN. Wrote `.hallmark/before.txt`, `.hallmark/before.json`, and 5 screenshots (1280x800, 1440x900, 1920x1080, 1440 full, 375 full) in `.hallmark/before/`.
5. Looked at the 1280x800, 1440 full and 375 screenshots before weighing findings, then wrote the four-line read (in report.md).
6. Loaded `gates.md` in full (sections 1 to 6; the verb asks for 1, 4, 5) and walked the judged gates (6b, 8, 9, 11, 16, 23, 29, 38iii, 46b, 47c, 54, 63, 66, 69, 70, 84, 85) from the screenshots and the source.
7. Reported by tier with line numbers, the read, the lightest depth that settles things, and what only a full redesign would.

## Skipped
- The ask (Step 1 / redesign "The ask"), the Picks block, the plan, build, `--kept` sweep, finish review and handoff: they belong to redesign/build, not audit. The hero and finish reviews (subagents) were not run for the same reason.
- Did not run `install-hook.mjs` (instructed). No fixture edits.
- `theme.mjs` / `capture.mjs` not used (audit does not need them). `.hallmark/log.json` does not exist (no earlier builds), so gates 8 and 32 were judged without it.

## What failed or needed a workaround
- The render tier first did nothing: sloplint-render needs `puppeteer-core` (not installed, no skill-shipped copy). Installed it with `npm install puppeteer-core` into a scratchpad folder and pointed `HALLMARK_PUPPETEER` at it.
- Then Chromium refused to start as root. Wrapped the given Chromium binary in a script that adds `--no-sandbox` and passed it through `CHROME_PATH`.
- sloplint wrote its `.hallmark/before/` screenshots next to the target file (`benchskills/fixtures/.hallmark/`), outside my output folder, in spite of cwd. I moved the five PNGs into my output folder and deleted the stray `fixtures/.hallmark` directory (it held only those PNGs and a generated `.gitignore`). The fixture file itself was never touched.
- `before.json` was written to the cwd's `.hallmark/` correctly; only the screenshots went to the target's folder.

## Checked by rendering (Playwright, own script, plus sloplint's render tier)
- 1280x800, 1440 and 375 screenshots viewed.
- Bounding boxes of plans (heights 267/237/438, widths 392/400/408) and of every control (heights 14 to 42px).
- Real Tab order from page top (FAQ first because of `tabindex="3"`).
- Hover on a plan card at 1280 (no width change under `flex: 1`; Business height collapses from 380 on hover by its own rule).
- Sticky header stays 140px at scroll 1500 and at 375 wide.
- Page scrollWidth at 375 = 584; the table is 560px wide inside a 375px container.
- `.feature-line` scrollWidth 357 vs clientWidth 180 (truncation).
- sloplint render: contrast 1.44:1 (Submit), 4.04:1 (hero lede), 1.25:1 (input edge), no focus ring, 584px horizontal scroll, 147 words in a screen, 323px dead band, hero ends at 637 of 900.
- Not checked: dark mode, print, 1920 visually (only the sloplint numbers), screen reader output.

## Raw output
- `sloplint-before.txt` is the first run without a browser tier; `sloplint-before-render.txt` is the full run.
