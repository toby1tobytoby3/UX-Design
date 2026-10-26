# RUN: hallmark, build brief (Ledgerly pricing), run r2

Output: `index.html` (single file, inline CSS and JS; fonts from Fontshare and Google Fonts, system fallbacks). `.hallmark/` holds the skill's log and the lint screenshots.

## Skill steps followed

0. Pre-flight: empty output folder, no design.md, no brand spec, no product to capture, no Inspo MCP, `TOGETHER_API_KEY` unset (signal 9 skipped, no generated stills). Nothing to preserve.
1. Ask once: not asked (headless benchmark). Answers taken from the brief:
   - Material: real = product name, tagline hint, three plans with prices and features, the 20% annual discount, the comparison table, the FAQ; pictures = none (the page is the price sheet itself); absent = logos, quotes, metrics, ratings, badges.
   - Audience: bookkeepers and practice managers at small firms, laptop or phone.
   - Use: start a free trial (job: sign up).
   - Tone: utilitarian, warm (inferred); genre modern-minimal (B2B SaaS).
2. Shape: anatomy "sign up" (pricing table with period switch, questions). Draw (090f17) dealt Letter, Banner hero, search-led nav, index-column footer, and said to leave out Band and Grid. Swaps, named in the Picks block: Letter refused (the skill says avoid for transactional pages, and it has no table or switch), so I built a price sheet from the Offer and Switcher compositions; search-led nav swapped for edge-aligned because Ledgerly has no search to show (would be an invented feature); index-column footer swapped for a mast on the board because there is no real sitemap. Plans are stacked as rows instead of a Grid so each sheet can carry its feature list beside a huge price.
3. Direction: `theme.mjs deal --genre modern-minimal` offered Coral, Dusk, Sport. Picked Coral (1/3): the only light, warm, pricing-keyworded one; its stationery material suits a ledger. Dusk is dark and landscape-led; Sport is poster-condensed.
4. Loaded: layout, anatomy, imagery, craft, genres/modern-minimal, themes/coral (and its picture), gates 1 to 4, patterns, macrostructures/12-letter.
5. Picks block (recorded here as the run's only recital):
   - Shape: Price Sheet (Offer rows with a Switcher, swapped from Letter), job: sign up
   - Theme: Coral, dealt 1/3
   - Chrome: nav edge-aligned (wordmark and one action); footer a mast on the ink board
   - Hero: Banner, headline, one sentence, the billing switch
   - Signature: the plan prices set huge on cotton sheets, re-printed by the pressed-groove billing switch
   - Sections: Hero, plans, comparison table, FAQ, Footer
   - Material: real = everything in pricing-content.json; pictures none; absent = logos, quotes, metrics
   - Sweep: Floor 0 FAIL, Reflex 0, 1 WARN dismissed (46a "20% less" is the brief's annual_discount), F4 answered, 1 NOTE (58, see below)
6. Build: `theme.mjs scaffold coral`, then inlined `tokens.css` and `base.css` into the one `<style>` (the brief wants one self-contained file) and deleted the two files. Stamp, critique line, dismissed and answered lines are the first lines of the CSS. Textures (cotton, felt) generated as inline SVG feTurbulence data URIs. Hero first, then `sloplint --stage hero`, then the rest. Logged with `theme.mjs log`.
7. Sweep: `sloplint index.html --genre modern-minimal --render` final result: 0 FAIL, 0 REFLEX, 0 WARN, 1 ANSWERED (F4), 1 DISMISSED (46a), 1 NOTE (58: 114 words in one 900px window over the comparison table and the FAQ questions).

## Failures, skips, deviations

- Render tier needed `puppeteer-core`, which was not installed. I installed it outside the output folder (scratchpad) and pointed `HALLMARK_PUPPETEER` and `CHROME_PATH` at it, with a tiny wrapper adding `--no-sandbox` to Playwright's Chromium. After that the render tier ran normally.
- Hero review and finish review "in fresh context": this run is itself a subagent with no way to start another, so both were run in-thread (read the review prompts, re-read the screenshots cold). Recorded as `in-thread`. Findings: hero, the plan prices could be larger and the sheets have some empty width (kept: the 119.20 price must fit its column at 1280, measured 247px in a 325px column); finish, nothing blocking.
- Gate 58 note: the brief fixes an eight-row table and a five-question FAQ, so the words in that window cannot be cut. Mitigations: FAQ answers collapsed in native `<details>` (all text is in the DOM and opens with keyboard, and browser find opens it), roomier table rows. The linter reports it as a NOTE because of `copy: verbatim` in the stamp.
- Fonts come from the network (Fontshare General Sans, Google Geist Mono); they loaded in the screenshots. Offline it falls back to `system-ui`.
- No photographs, so no `data-slot`, no slot script, no credits line.

## Questions the skill asked, and my answers

See step 1. Tone and genre were inferred, stated above; no facts were inferred.

## Decisions on the content

- No currency symbol: the content file gives bare numbers and no currency, so I did not invent one. A real site needs the currency set beside the figure.
- Annual state shows the annual per-month prices and "Billed annually"; I did not compute yearly totals (not in the content file).
- "Monthly" selected on load; the switch is pure CSS (radio inputs and `:has()`), so it works without scripting, with a small script only to announce the change to screen readers.
- No "most popular" or similar word on any plan (it would be an invented claim); all three plan buttons are the same.
- "Start free trial" buttons link to `#plans` because no sign-up URL was given; the real URL is needed.
- The 14-day trial line in the hero is the FAQ's own fact, restated once as the hero sentence.

## Changed after looking at screenshots

1. First hero render: the nav had a flat paper strip over the felt (a seam). Made the nav an absolute overlay on the hero's desk and padded the hero for it.
2. Lint: the hero and plans were wrapped in one `.desk` div, which the linter read as the hero (533px dead band). Unwrapped them into sibling sections: hero keeps the daylight radial and felt, plans keep the felt only.
3. Lint 44a: hero content sat low. Rebalanced padding (24px under the nav, 96px below) so the space below is 1.0 times above.
4. Added a visually hidden `h2` "Plans" so heading levels step one at a time.
5. Raised table row padding and the section gap under the table to reduce the word density in the 58 note window (120 words down to 114).

## Checks run

Playwright, reduced motion on: no horizontal overflow at 390, 768, 1280 (also in the annual state); keyboard focus reaches the billing radios and arrow keys switch to annual (prices 15.20, 47.20, 119.20 and "Billed annually" show); with JavaScript off the page shows monthly prices. The comparison table restacks into labelled blocks at 40rem and below.

## Handoff, material that would improve the page

- The currency and the real sign-up URL for the "Start free trial" buttons.
- A screenshot of the product matching a statement to the ledger would give the hero a real picture (none was supplied, so none is invented).
