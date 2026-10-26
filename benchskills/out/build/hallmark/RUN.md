# RUN: Hallmark, Ledgerly pricing page

Output: `index.html` (single file, inline CSS and JS; fonts General Sans via Fontshare and Geist Mono via Google Fonts, with system fallbacks). Working files: `tokens.css`, `base.css` (scaffold output, inlined into the page, not referenced), `.hallmark/` (log, screenshots).

## Skill steps followed
0. Pre-flight: empty folder, no design.md, no brand, no product to capture, no Inspo MCP, no TOGETHER_API_KEY. Nothing to preserve.
1. Ask once: not asked (brief answers it). My answers: Material: the pricing-content.json facts only, no photos, no logos/quotes/metrics. Audience: bookkeepers and practice managers comparing on laptop or phone. Use: start a free trial. Tone: utilitarian and warm (no extreme chosen beyond "plain stationery"). Genre inferred: modern-minimal (B2B SaaS).
2. Shape: job = sign up (anatomy.md). Ran `theme.mjs draw`: Index-First, Ledge hero, slab nav, mast footer, "leave out Statement and Band".
3. Direction: `theme.mjs deal` gave Coral, Dusk, Ultraviolet. Picked Coral (1/3): invoicing/pricing keywords, stationery material needs no photographs, so nothing to invent.
4. Loaded layout, anatomy, imagery, craft, genres/modern-minimal, coral theme + picture, gates 1 to 4, patterns.
5. Picks block (below).
6. Build: scaffold (`theme.mjs scaffold coral --dealt`), stamp + critique + dismissed/answered lines at top of the CSS, hero first and linted with `--stage hero`, then the page, then `theme.mjs log`.
7. Sweep: `sloplint --render` to 0 FAIL, 0 WARN open; judged gates walked by eye on screenshots; hero and finish reviews run in-thread.

## Picks block
**Hallmark v2.0.0**
- Shape: Index-First (draw ecb3dd), genre modern-minimal, job: sign up, action in the hero (on every plan sheet) and again at the close.
- Theme: Coral, dealt 1/3 (warm grey desk, cotton stationery, one coral signal unused except focus/hover underline, General Sans + Geist Mono figures).
- Chrome: nav slab (cotton strip, wordmark and one action); footer mast on the ink board (wordmark over anchors).
- Hero: Index posture. SWAP from the drawn Ledge: Ledge puts the head under a tall field, which here would put the head below the prices; the draw's own note says the hero leads with the list, so the plans lead and the head sits small above them.
- Signature: the plan index as three cotton sheets on the desk, with a groove switch that re-prices every sheet (monthly on load).
- Sections: Hero (plans) / Table (8 rows) / Figures (14 days, 20%, 30 days, all from the data file) / Rows (FAQ) / Board close + mast footer.
- Draw items not taken: "product at work as a Pinned run": no product material exists to show without inventing it. The "close on a short band" became the ink board close, since the draw said to leave Band out and the close is the hero's action again.
- Material: real = prices, features, comparison, FAQ, 14-day trial, 20% annual, 30-day refund; pictures = stationery built in CSS, no photographs, no slots; absent = logos, quotes, metrics, ratings, badges.
- Sweep: Floor 0 FAIL, Reflex 0, 3 notes/answers (F4 answered, 46a dismissed, 58 note under `copy: verbatim`); hero review in-thread, finish review in-thread.

## Skipped, failed or worked around
- `sloplint --render` needs `puppeteer-core` (not installed) and cannot launch Chrome as root without `--no-sandbox`. Worked around outside the skill: `npm install puppeteer-core` in the scratchpad (network allowed it), `HALLMARK_PUPPETEER` pointing there, and `CHROME_PATH` pointing at a shell wrapper that adds `--no-sandbox` to the given Chromium. The skill was not modified.
- No subagent tool was available, so both reviews ran `in-thread`: I read `review-hero.md` and `review-finish.md` and applied them cold to the screenshots. Recorded as `in-thread`, not as independent.
- Not run: `install-hook.mjs` (told not to), `capture.mjs` (no product), `photos` (no photographs wanted), imagegen (no key).
- Skill's 80-words-per-screen and 450-word budget cannot hold: the brief requires 3 plans, an 8-row table and 5 FAQ answers. I stamped `copy: verbatim`, which the skill defines for user-supplied wording; the linter reports 58 as a NOTE (128 words in one 900px window at the FAQ, 4 text blocks in the hero counting plan cards).

## Questions the skill raised, and my answers
- Four-question ask: answered above from the brief (no stopping).
- Tone: "utilitarian, warm".
- Which plan to emphasise: none. Calling one "most popular" would be an invented claim; the skill's pricing note says emphasise with a word and the button, so all three plans are equal.

## Assumptions to check
- Currency: the data file has bare numbers ("19", "15.20"). I rendered a `$` in a `.cur` span on each price; delete those three spans if the currency is not dollars. This is the only thing on the page not literally in the file.
- Facts restated from the file in the Figures section and board close (14 days, 20% less, 30 days refund) are the FAQ's own facts, not new ones. The h1 "From one seat to fifteen" and the h2s ("Every plan, row by row", "Questions before you start", "Try any plan for 14 days") are headings of ours built from file facts.
- "Start free trial" links point at `#trial` (the closing board) because no signup URL was given; the handoff needs the real URL for all five buttons.
- Footer carries no legal line or social links, since none were supplied.

## Changed after looking at screenshots
- Price figure enlarged (60px to a clamp up to 72px) and strip columns rebalanced so "$119.20" fits in annual mode.
- h1 changed from "Plans sized to your team" (fits any SaaS) to "From one seat to fifteen" (specific, true to the data).
- h2 reduced to about 44px so the hero head clearly outranks the section heads (hero 60px).
- Added a hidden h2 "Plans" so headings step h1, h2, h3 (F21).
- Added the Figures section because the linter flagged 4 sections (77); five is the minimum on a thin prompt.
- Comparison table now stacks into labelled blocks only under 40rem (was 48rem): at 768 it is a real table.

## Verified
- Widths 390, 768, 1280 (and fold shots at 1440 and 1920 by the linter): no horizontal scroll (scrollWidth equals innerWidth).
- Monthly selected on load; Annual shows $15.20, $47.20, $119.20 with "per month, billed annually" and a status line "Billed annually, 20% less than twelve monthly payments."; works without JS (CSS `:has`), JS only updates the status text.
- Keyboard: Tab order is skip link, wordmark, nav action, billing group, three plan buttons, board button, footer anchors; arrow keys move between Monthly and Annual; 2px focus ring on every stop.
- Reduced motion: emulated in the check script; transitions are removed, nothing is hidden at rest.
