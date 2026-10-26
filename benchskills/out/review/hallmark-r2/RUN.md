# RUN.md: Hallmark `audit` on seeded-pricing.html (run hallmark-r2)

## Skill steps followed
1. Read `vendor/skills/hallmark/SKILL.md` fully. The `audit <target>` verb requires reading `references/redesign.md` first; read it fully.
2. Redesign.md "Before" step 1, pre-flight: no `design.md`, no `.hallmark/brand-spec.md`, no `package.json`/framework (a single static HTML file), `TOGETHER_API_KEY` left unset (signal 9 and the comp step skipped), no Inspo MCP. Genre inferred as modern-minimal (SaaS pricing page), since the page is unstamped.
3. Step 2, record: `node scripts/sloplint.mjs <fixture> --genre modern-minimal --render --before`, run from the output folder.
   - First attempt (static tier only) printed "render tier not run: no puppeteer-core found". Result: 47 FAIL, 8 REFLEX, 6 WARN.
   - Fix: installed `puppeteer-core` into the scratchpad (`npm install`, free), set `HALLMARK_PUPPETEER` to that folder, and set `CHROME_PATH` to a one-line wrapper script that runs the Playwright Chromium (`/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`) with `--no-sandbox` (needed as root). Re-ran: render tier produced 5 screenshots (1280x800, 1440x900, 1920x1080 folds; 1440 and 375 full pages). Result: 58 FAIL, 17 REFLEX, 8 WARN (the render tier adds 26a, 34 at 320px, 40, 41, 44d, 49a, 58, 25, 39b, 44c, 49b, 59, 75, 77 to 79, F25).
   - Findings and the record are in `.hallmark/before.txt` and `.hallmark/before.json`; screenshots in `.hallmark/before/` (moved here, see below).
4. Looked at the 1280x800, 1440 full-page and 375 screenshots before weighing findings, then wrote the four-line read (at the top of report.md).
5. Loaded `gates.md` (read whole file: sections 1 to 6, i.e. the requested § 1, § 4 and § 5) and walked the judged gates from the screenshots (6b, 8, 9, 11, 16, 29, 38iii, 44, 47c, 54, 58, 63, 66, 69, 70, 77 to 85). Gate 70 (fake send) and 69 (echo) did not fire; no eyebrow, no middle-dot strings, no invented metrics or testimonials on the page.
6. Wrote the report by tier-equivalent severity with file:line, the read, the lightest depth that settles the findings (polish) and what only a deeper depth would (restyle or full). Verb stops at the report: no project files changed, no scaffold, no build, no hero review, no finish review (those belong to redesign or build, not audit).

## Skipped or failed
- `TOGETHER_API_KEY`: unset, so the comp step, image generation and photo-library steps were not run (not needed for an audit).
- First lint run lacked the render tier (no puppeteer-core); resolved as described in step 3. This was an environment fix, not a skill workaround.
- The skill's hero review and finish review (fresh-context subagents) are not part of `audit`; not run.
- Side effect: the linter writes `.hallmark/` next to the target file, so it created `benchskills/fixtures/.hallmark/` (screenshots, .gitignore) on the second run. I moved the whole folder into this output folder and left the fixture file untouched. The fixture HTML was not edited.
- The first run (static-only) wrote `.hallmark/before.*` into this folder; the second run's output replaced it.
- Incidentally, `ls` of the fixtures folder showed a `defects.json` file name; I did not open it.

## Checked by rendering (Playwright, Chromium, `file://` fixture; script in scratchpad `chk.js`)
- Contrast ratios computed from the CSS values: Submit white on `#ffd23f` 1.44:1; `.lede` `#bbb` on white 1.92:1; `.fineprint` `#777` 4.48:1; input border `#e6e6e6` 1.25:1; table and banner-close border `#ccc` 1.61:1; `.choose` white on purple 5.85:1 (passes); error red 5.36:1 (passes).
- Sizes at 1280: `.choose` 87x35, Submit 90x42, input 36px tall, banner-close 28x28, footer links 14px tall, header 140px, hero 427px, plan cards 392/400/408 wide and 267/237/438 tall, first plan card top at y=754.
- Tab order (14 presses): FAQ, Pricing, Sign in, banner-close, the three "Click here", email input, Submit, OK, Cancel, two summaries, Terms; computed outline is `none` on every control except the two `<summary>` elements.
- Anchor landing: after `#plans` the section is at top 0 (under the 140px sticky header); `#faq` lands at 601 only because the page is too short to scroll further.
- Plan hover at 1280 (Team): width and height unchanged (flex items ignore the `width: 104%`); the Business card has `height: 380px` that `height: auto` would collapse (reasoned from the CSS, not observed).
- 375px: `scrollWidth` 584 (page scrolls sideways), plan card widths 222/139/135; at 320px linter reported "Click here" and "Sign in" wrapping.
- Looked at the 1280x800, 1440 full-page and 375 full-page screenshots; did not view the 1440x900 or 1920x1080 fold images (relied on the linter for 44c and 44d).
