# Review brief: audit an existing pricing page

Review the page at `benchskills/fixtures/seeded-pricing.html` using the skill you were given (read its SKILL.md
fully first and follow its review workflow as Claude Code would when the skill loads). You may render the page
with Chromium through Playwright (`require('playwright')`) at any width and run any script the skill ships.

**Do not edit the fixture** and do not read anything else under `benchskills/` except your skill and this brief
(in particular not `defects.json`, other runs' output, or the benchmark scripts).

Report every real interface problem you find, ranked by severity. For each: where it is (selector, line or
visible text), what is wrong, why it matters to a user, and the fix. Do not pad the list: a finding that is
wrong or too vague to act on counts against you. Write the report to `report.md` in your output folder, plus
`RUN.md` listing the skill steps you followed, any that failed or you skipped, and anything you checked by
rendering the page.
