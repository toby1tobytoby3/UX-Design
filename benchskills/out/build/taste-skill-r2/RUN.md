# RUN: taste-skill, build brief (Ledgerly pricing), run r2

Output: `index.html` (single file, inline CSS and JS, Google Fonts link for Libre Franklin and Source Serif 4 with system fallbacks).
Working files from the skill's scripts are in `.taste-skill/` (direction sheet, app sheet, inspector screenshots and report).

## Skill steps followed

1. **Read the brief and project.** Kind of work: a page (pricing), not an app screen. Imagery that really exists: none. The only honest pictures are fragments of the product's own interface built in HTML.
   Inventory of the subject: the name (a ledger), the bank statement and the ledger it is matched against, the tick that marks a line as matched, the difference of 0.00 that closes a reconciliation, seat counts 1/5/15, bank connections 1/5/20, the 14-day trial, the 30-day refund, the 20% annual discount.
2. **Argument** (one claim per section, a section with no claim deleted):
   - It is Ledgerly's pricing and every plan starts with a trial: hero with the name, one sentence, the action, and a real statement and ledger fragment.
   - Three plans step up with the seats: Plans and prices, with the monthly/annual toggle.
   - You can compare every row: the eight-row table.
   - The odd rules (what counts as a reconciliation, billing, refunds) are answered: the five-question FAQ.
   - Close on the action: footer board with the trial terms and the same button name.
3. **Draw.** `draw.mjs --sector finance --sections pricing,list,faq,footer --have product-ui --options 3` dealt three directions: sentence-as-layout, colour-chapters, type-only-statement.
   Chosen: **Colour chapters** (seed 510434295). Why: the page has four distinct jobs (plans, comparison, questions, close) and each can be a whole flat field, and the stepped-plan tiles literally make the bigger plan bigger, which matches how Ledgerly's plans differ (1, 5, 15 seats). The other two needed a photograph slot in the sentence or a type-only first screen with later pictures; there are no photographs.
   Dealt: hero "Colour field, two-ink statement"; type Libre Franklin / Source Serif 4; palette Blush, sage, slate (kept: slate, sage, blush and an olive close are neutral, calm and do not fight a bookkeeping product; the dealt olive is the button colour); motion "Colour by chapter".
   Dealt sections: pricing "Plans that step up", list "Cards that fold into spines", faq "Accordion of filled tiles", footer "A footer of tiles".
   **Redraw (one):** `section:list=list-lineup-one-size`. Reason: the brief's content for that slot is an eight-row, four-column comparison table; "Cards that fold into spines" is a pinned deck of text cards and cannot hold a table without bending the content. The "Line-up at one type size" table blueprint can (column starts organise it, one size, no rules). It is set in the dealt faces and palette, with tone-step rows instead of lines.
4. **App sheet for the interface fragments.** `draw.mjs --app --kind finance --keep palette,type --out .taste-skill/app` dealt "Achromatic ledger". Used for the fragments only: near-zero colour in the chrome, tabular figures right-aligned, one tick colour (the page's olive), figures that add up (the statement and ledger both total 2,627.50, difference 0.00). Its suggestion of a monospace face for figures was not used: monospace is banned on the page, so tabular numerals in the text face instead.
5. **Idea.** "On this page, **the bookkeeper's tick against a statement line** becomes **the page's one motif: every included feature, every Yes in the table and every matched line in the fragments carries the tick, and the hero shows the real output of the product, a bank statement and a ledger that agree to the last 0.00.**" Competitor test: a generic SaaS pricing page does not put a matched statement and ledger beside its title; this one is made of the product's own output. Honest limit: another reconciliation tool could use the same tick, so the idea is stronger in the hero and FAQ fragments than in the plan tiles.
   **Live thing:** the monthly/annual toggle. Real radio inputs (keyboard: arrow keys, Space), monthly on load; annual swaps every price and the "per month, billed annually" line (digits roll with transform and opacity), updates a spoken note, and works with no script (CSS `:has()` fallback) and with reduced motion (swap without travel).
6. **Words.** Copy deck written first; h1 "Ledgerly pricing" (16 characters, two lines at every width, fitted by measurement so the longer line runs to the right margin). All plan, price, feature, table and FAQ strings are verbatim from `pricing-content.json`. The tagline hint is used as the supporting sentence; the 14-day trial sentence in the hero and the trial and refund sentence in the footer restate FAQ answers. Currency is not in the content file, so no currency symbol is shown (to be added by the client).
7. **Build, still.** Tokens first, hero at desktop and phone, each section from its blueprint, one pair of 16-32px margins, five type steps (display, head, lead, body, small), square corners everywhere except inside interface fragments (the product's own 8px radius), one flat olive button fill. Header is a plain bar that takes the colour of the chapter beneath it (the dealt signature move).
8. **Gate.** `lint.mjs`: 0 FAIL, 0 WARN. `inspect.mjs` (at 1440, 768, 390): final run **0 FAIL, 3 WARN**.
9. **Look.** Opened the inspector's screenshots and my own Playwright screenshots (390, 768, 1280, with and without reduced motion, annual state). Critique below.
10. **Move.** Chapter-colour header (300ms), staggered entrances per section (heading, then text, then picture, 70-120ms apart, 26px rise, once, never hidden without script), ticks that land in sequence in the fragments, price roll on the toggle, hero fragments drifting slightly against the scroll, hover/press/focus feedback on every control (tile strips, toggle, buttons, FAQ tiles, table rows, footer tiles). Everything has a `prefers-reduced-motion` fallback that keeps content and drops travel.

## Skipped or failed

- **`assets.mjs` downloads were skipped.** One search (`"ledger book"`, Openverse) ran and returned archival ledger pages (public-domain and CC0 Tiffany Studios ledger books from the Met would have fit), but the follow-up call that would have downloaded pictures with `--get` was denied by the environment's permission classifier. The brief says to skip outside downloads and say so, so no found pictures or footage are on the page. Consequences: inspector WARNs `no-real-pictures` and `no-footage`; the "four real pictures" floor is met only by interface fragments (four `data-ui` panels of at least 300x200: statement, ledger, matching rules, one reconciliation), which the skill counts for software. No credits line is needed because nothing is borrowed.
- **Inspector needed a browser path.** `inspect.mjs` found no Chrome on its own; run with `CHROME_PATH` pointing at a wrapper that adds `--no-sandbox` around Playwright's Chromium. No change to the page.
- `scenes.mjs` not run: the direction dealt no scroll scenes.
- Image-tool generation: none available.

## Inspector WARNs left, and why

- `no-real-pictures`, `no-footage`: see above (no downloads). Not defensible as a design choice, only as a constraint of this run.
- `off-centre` (32px left, 48px right): the measure takes the 98th-percentile right edge of text boxes; the text inside the four interface panels sits 16px inside panels whose edges are on the 32px margin. Header, h1, tiles, table, FAQ and footer board all end at the same 32px margin (checked: no horizontal overflow at 390, 768, 1280). Defended, not changed.

## Questions the skill raised, answered from the brief

- Page or app screen? A page (pricing, read and compared).
- What imagery exists? None of the project's own; only interface fragments I could build.
- Sector for the draw: finance (closest to bookkeeping software). Tone: none (the brief does not ask for one).
- Primary action: "Start free trial", the one name used everywhere. No checkout or backend: the plan buttons point at `#start-trial` (with the plan and billing choice appended by script), which has no target. **Must be wired to the real sign-up before launch.**

## Sample content (not from the content file; to confirm or replace)

- Interface fragments: sample statement and ledger lines (invoice numbers 2041-2043, a bank charge, amounts, "March", "Current account"), sample matching rules (Invoice to Sales, Bank charge to Bank charges, Transfer to Savings account, Interest to Interest income), the "One reconciliation" panel. All are labelled "Sample". Totals are arithmetic on those sample lines.
- Short connective copy: "Monthly billing." / "Annual billing is 20% less, billed annually."; "Shared matching rules come with Team and Business." (read off the table); "Ledgerly matches bank statements to the ledger." (the brief's own description).
- No metric, customer, rating, testimonial, logo, award or badge is on the page.

## Critique (references/critique.md, last round)

Look rounds: two (after the first inspector run, then after fixes), screenshots at 1440, 768, 390 and my own 1280 and 390 reduced-motion captures.

Round 1 problems found: the tiles' inner features ran under the button strip on Starter (price block too tall, annual line reserving two lines); the interface "Matching rules" header inherited the heading class and rendered at 68px; the footer wordmark came out at body size (a more specific `.ft p` rule beat it); on phone the stacked plan tiles were pushed right by an inherited `align-items`; table values touched at 390 ("UnlimitedUnlimited"); the plan tile's button label was read as an eyebrow for the next price at 390; icon-topped feature rows were flagged as icon cards.
Fixes: price block one line, strip clear of the features; renamed the panel class; scoped the wordmark rule; `align-items: stretch` on the stacked layout and a larger gap; table column widths and 15px cells on phone; feature ticks drawn as CSS pseudo-elements instead of inline icons; skip link hidden with clip rather than off-screen offset; hero fit factor corrected and re-run when the web font loads; reduced-motion transition rule changed to `0s` after it was found to freeze the hero's fit measurement mid-transition.

Scores (my own, honest, with the caps in mind: no real photographs, so imagery is capped):
- Design and hierarchy: 7 (huge two-ink title, one flat field per chapter, tiles that step with the seats; the tablet and phone are real compositions).
- Originality: 6 (the colour-chapter system with the statement and ledger fragment is specific to the product; plan tiles and an accordion are still recognisable blueprints).
- Content and usability: 8 (every required string present, toggle works from the keyboard and without script, table is a real table with row and column headers).
- Imagery: 5 (interface fragments only; no found pictures).
Still falls short: no archival or found pictures and no footage (download skipped); the middle plan tiles carry some empty tile height on desktop (Business has about 100px under its list, by design of the stepped heights); sticky table head and page header together take about 110px on small laptop screens.

## What I changed after looking at screenshots

See "Round 1 problems found" and "Fixes" above. Nothing was changed to hide a meter finding: the three remaining WARNs are reported, not suppressed.
