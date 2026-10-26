# RUN.md: taste-skill review run (r2)

## Skill steps followed
1. Read the brief (`briefs/review.md`) and the whole of `taste-skill/SKILL.md`.
2. Chose the "Redesign, restyle or review of an existing page" path: step 1 "Record the before", step 2 "A review stops here".
3. Linted the fixture source: `node scripts/lint.mjs fixtures/seeded-pricing.html` (5 FAIL, 8 WARN).
4. Ran the inspector on the fixture: `node scripts/inspect.mjs <fixture> --out ./inspect` (14 FAIL, 6 WARN), which wrote screenshots and `report.json` to `inspect/` in the output folder.
5. Opened the screenshots it listed (desktop-fold, desktop-page-01, tablet-page-01, mobile-fold, mobile-page-01) and critiqued them with `references/critique.md` (read in full): passes, score, caps, written in the section 4 shape.
6. Read the fixture source and mapped findings to lines.
7. Wrote `report.md`.

## Skipped (by the brief's rules or because they are build steps)
- Run steps 2-10 (argument, `draw.mjs` direction, idea, copy, build, motion, rounds 2-3): a review stops after the before-critique. I did not rebuild the page.
- `assets.mjs` (network downloads), `scenes.mjs` (no scenes), `install.sh`: not run, per instructions.
- `references/app-screens.md`, `type.md`, `colour.md`, `layout.md`, `tells.md`: not read; the findings come from `critique.md` and the measurements.

## Failures and workarounds
- `inspect.mjs` first failed: "No Chrome/Edge/Chromium found". Setting `CHROME_PATH` to the Playwright Chromium fixed that (the path Playwright's `executablePath()` printed, chromium-1194, did not exist; the installed build was `/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`).
- It then failed with "Running as root without --no-sandbox". I did not edit the skill; `CHROME_PATH` pointed at a one-line wrapper script (in the session scratchpad) that adds `--no-sandbox`. The inspector then ran normally.
- The inspector's sheets (`*-page-01.jpg`) cut the plans section across screens; I took extra Playwright screenshots (`inspect/plans-1440.png`, `inspect/plans-390.png`, `inspect/hover-1440.png`).

## Checked by rendering with Playwright (Chromium, `--no-sandbox`)
- Widths 1440, 768, 390 via the inspector; 1440 and 390 with my own script.
- Bounding boxes of the plans, buttons, banner close, summaries, footer links, table and header; `documentElement.scrollWidth` at 390 (584, so +194 px sideways).
- Tab order from a fresh load, 8 presses (FAQ, Pricing, Sign in, banner close, three plan buttons, input) and computed outline/box-shadow on each focused element (none except `<summary>`).
- Hover on plan 2 (no change) and plan 3 (height 438 to 266 px, layout jump of 172 px).
- Clicking the Pricing and FAQ links with the sticky header (plans heading ends at top 0, under the 140 px bar), the scrollIntoView call from "Compare plans" (table top at 105 px), and clicking the banner close (banner stays).
- Computed styles of the About paragraph (line height 16 px at 16 px size, 73 words), label count on the email input (0), `tabIndex` of the Compare line (-1).
- Contrast ratios computed from the CSS colours (hero lede, `.lede`, fine print, input border, Submit, footer links).
- Not checked: screen-reader output (reasoned from markup), reduced-motion behaviour, real Impact/Comic Sans rendering (fonts are not installed here, so headings rendered in the fallback sans-serif).
