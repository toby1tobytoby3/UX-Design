# RUN - Taste Skill (design-taste-frontend) review of seeded-pricing.html

## Steps followed
1. Read briefs/review.md and the whole SKILL.md. Chose its "Redesign, restyle or review of an existing page" path: record the before, critique, list findings with measurements, stop (a review stops after step 2 of that path).
2. `lint.mjs` on the fixture source (output in lint.txt): 5 FAIL, 8 WARN.
3. `inspect.mjs <fixture> --out .taste-skill/before` at 1440/768/390 (output in inspect.txt): 14 FAIL, 6 WARN. Screenshots in `.taste-skill/before/`.
4. Opened desktop-fold, desktop-page-01, mobile-fold, mobile-page-01 and applied the critique.md passes (one-second, five-second, edges, space/frame, type, colour, images, phone, fullness, substance, collisions). Wrote the critique in the section 4 format (in report.md).
5. Added my own Playwright probes (probe.cjs, probe2.cjs) for what the inspector does not measure: tab order and focus styles, hover geometry on `.plan`, anchor/scrollIntoView position under the sticky header, target sizes, element rects at 1440/390, clipped `.feature-line`, table width, `toggleCompare` stub, ticker animation. Also a full-page screenshot (compare-full.png) and a phone plans screenshot (mobile-plans.png, not opened).

## Not run / skipped
- `draw.mjs`, `assets.mjs`, `scenes.mjs`, motion layer, the build steps 1-10: skipped, because this is review only and the fixture must not be rebuilt. `--out .taste-skill/after` skipped (no fix made).
- Did not read references other than critique.md (tells.md, layout.md etc. not needed).
- Did not read the 768px tablet screenshots.
- `install.sh` not run.

## Failures / workarounds
- `inspect.mjs` first failed: Chrome refuses to run as root without `--no-sandbox`, and the skill documents `CHROME_PATH` but no sandbox flag. Workaround: `chrome-nosandbox.sh` in this folder (execs the Chromium with `--no-sandbox`), passed as `CHROME_PATH`. Skill files were not modified.

## Notes on the inspector
- It reports house-style findings (eyebrow, mono, gradient, picture count, motion count, palette) well, and it caught real defects: contrast values, mobile overflow, small text, font count.
- It does not check: focus outline removal, tabindex, viewport zoom lock, accessible names (banner close, "Click here"), heading hierarchy, colour-only table cells, clipped nowrap text, hover layout shift, sticky header covering anchors, non-focusable click targets, form labels/error wiring, dead handlers. Those findings in report.md come from reading the source and my own probes.
- False positive: "Team"/"Business" plan names flagged as eyebrows above the price.
- Brief-mismatched findings (still-page, few-pictures, no-footage, focal-point as "needs 8.4vw") are marketing-page rules; I kept focal-point and placeholder points only where they describe a real visible problem.
