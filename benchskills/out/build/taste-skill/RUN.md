# RUN.md: Taste Skill (design-taste-frontend), Ledgerly pricing page

Output: `index.html` (inline CSS and JS, Google Fonts, pictures in `assets/`). Working files in `.taste-skill/`
(direction.json, app/direction.json, inspect/ screenshots, shots/ my own Playwright screenshots).

## Final state
- `lint.mjs`: 0 FAIL, 0 WARN.
- `inspect.mjs` (1440/768/390), last run on the final file: **0 FAIL**, 1 WARN (`no-footage`, defended below).
- Own Playwright checks at 390/768/1280, normal and reduced motion: no horizontal overflow, no console errors, no reveal left
  hidden after scrolling, no headline over two lines from 390 to 1920 px; keyboard walk-through; toggle by arrow key.
- Opened over `file://` as well as through the inspector's server: fine.

## Skill steps followed
1. Read brief and inventory: subject items (name = ledger; statement line ticked against ledger line; "difference 0.00"; one
   reconciliation = one statement, one account, one month; seats 1/5/15; 14-day trial, no card; 30-day refund; 20% annual;
   the printed ledger page itself).
2. Argument written as claims (plans, annual 20% less, terms in brief, compare, questions, try it).
3. `draw.mjs --sector saas --sections pricing,list,faq,cta,footer --have product-ui --options 3`, then full sheet.
   Chose **dense-tiles "The well-kept board"** (seed 1030327491): a pricing page is many small true things (plans, terms, eight
   comparison rows, five answers) and a tiled board holds them without a stock hero. Type Stack Sans Headline/Text, palette Navy on white.
4. Idea sentence: *On this page, the ledger (the old account books where a statement is ticked off against entries, ending in a
   total that ties out) becomes the board: archival ledger pages are the pictures, the interface fragment shows one reconciliation
   tied out to 0.00, the plans heading is "Plans that tie out".* Competitor test: another SaaS pricing page cannot print an 1833
   ledger and a tie-out fragment. **Live thing:** the monthly/annual switch, which changes every price on the page (hero figure,
   plan tiles, closing tile) and the trial mail links. It is two native radios, so it works from the keyboard and works with no script.
5. Copy deck written in my head from `pricing-content.json` (exact facts only; no currency symbol because the file gives none).
6. Built: tokens, hero board, each section from its blueprint, imagery, live thing, fullness/frame, states.
7. Gate (lint, inspect), 8. look and fix rounds, 9. motion layer, 10. report.

## Redraws / adjustments
- `--redraw section:list=list-lineup-one-size`: the dealt list (day tabs, agenda) cannot hold an eight-row, three-plan comparison
  table; the line-up table (four columns, one size) matches the content exactly.
- App fragment: ran `draw.mjs --app --kind finance --keep palette,type` (seed 916816693, "Pastel consumer"); built the one fragment
  (`data-ui`, white panel, pale blue chips, one radius step down, income green, sums that add up: -84.00 +1,250.00 -212.40 = 953.60,
  difference 0.00) by hand rather than with `assets/app.css`/`charts.js`; the page is a pricing page and needs one small fragment, not an app shell.
  It is labelled "Sample data, March".
- Palette: kept as dealt. The direction says tangerine is never larger than a thumbnail, so the dealt accent tiles (hero second
  statement, FAQ heading band, CTA tile) became warm grey / navy fields and tangerine stays on buttons and the compare heading.
- Plan tile strips: Business tile is near-black, so its button strip is one step lighter, not darker.
- Hero on phone: name, statements, then photographs (blueprint puts a photograph before the statements) so a stranger reads what it
  is and what it costs on the first screen.
- Cut: the dealt hero "four text links beginning at the centre line" kept on desktop; phone shows three links.

## Questions the skill raised and my answers
- What imagery exists? None of its own; no product screenshots. Answer: open-collection ledger pages (found) plus one built interface fragment.
- Sector / tone: saas, no tone passed.
- Is there a destination for the call to action? None in the brief. Answer: `mailto:trial@ledgerly.example` with the plan and billing
  choice written into subject and body (the skill's "no form backend" rule). **Must be wired before launch.**
- Sample details: the fragment's three transactions and the reference numbers are invented sample UI data (no company is real).

## Found pictures (assets.mjs, credited in the footer)
- `assets/pittsboro-merchant-business-ledger.jpg`: "Pittsboro Merchant Business Ledger", public domain, Wikimedia Commons (DPLA).
  Used in the hero (top right) and as a cropped tile in "Before you start".
- `assets/account-book-of-thomas-mister.jpg`: "Account-book of Thomas Mister", CC BY 4.0, Wikimedia Commons (Wellcome Collection).
  Used in the hero (bottom left, slow drift) and the closing row.
Both are greyscale-treated by CSS. Also fetched and rejected after looking: a Met sketchbook page (not a ledger) and a Kodak
ledger cover (a company's trademark on the label). Their files and credit entries were removed.
Footage: `assets.mjs --video "writing in ledger"` and `"calculator accounting"` returned nothing honest (earth-oscillation
animations only). The one moving picture is therefore the slow scroll drift on the second hero photograph. Defended `no-footage` WARN.

## Motion (step 9)
Shutter opening on the hero ledger page (the signature move, clip-path 1.1 s, image settles from 1.12), scroll drift on the second
hero picture, staggered once-only reveals (plan tiles rise 70 ms apart, terms board, table row by row, FAQ question then answer,
closing row), price ticks when the switch changes, press/hover/focus feedback on buttons, strips, links, switch and table rows.
Transform and opacity only. Reveal states are gated by `html.js`; with `prefers-reduced-motion: reduce` everything is in its final
state and the shutter, drift, ticks and smooth scroll are off. Hero title and statements are painted on the first frame.

## Things I changed after looking at screenshots
- Hero statements and h1 had a load fade that left them invisible in the first screenshot and failed `late-title`; removed it.
- Both "Billed monthly" and "Billed annually" showed at once (a CSS override); fixed.
- Blank stretches: section gaps plus black/navy fields read as empty; shortened compare padding, let the FAQ band butt onto the
  compare field, shrank the footer mark band and footer gap.
- Closing-row left picture was positioned against the page (no `position: relative` once a reveal transform ended): fixed (`covered-text`).
- Closing tile held its content on the left only ("lopsided"): added the three plans with their prices on the right.
- Closing headline wrapped to 3 lines at 1280: shortened to "Try it free for 14 days".
- Tablet hero and tablet pricing were squeezed; recomposed (name across, statements below photographs; intro row then three stepped tiles).
- Type sizes reduced from ten to five (15, 19, 26, 64, 151px); table text now the lead size.
- Phone: hero statements moved up; two "eyebrow" detections (a 17px note above a large figure) fixed by setting those notes at 19px.

## Critique, final round (references/critique.md format, honest)
Scores (my own, out of 10): composition 8, type 7.5, colour 7.5, imagery 7, content completeness 9, motion 7.5, craft/states 8.
What still falls short: the Business tile has empty lower space by design (the stepped heights); hero statement tiles have air under
their text; the ledger photographs are archival, not product, so the page shows its product only in one small fragment; no
currency symbol (the data has none); the Stack Sans Headline face has a single light weight so prices read light; no video.
Not claimed: scenes (none dealt), real-device testing.

## Sample or placeholder content to replace before launch
`trial@ledgerly.example` mail destination; the fragment's merchants, references and amounts; the credit line wording for Wellcome.

## Environment notes (failed / worked around)
- Chromium as root refuses to start without `--no-sandbox` and the skill's scripts document no flag for it. I pointed `CHROME_PATH`
  at a two-line wrapper script (outside this folder) that execs the given Chromium with `--no-sandbox`. Nothing else failed;
  `assets.mjs` (images and video search) and Google Fonts were reachable.
- I did not read `references/research.md`, `tells.md` or `app-screens.md` in full (read copy.md, motion.md excerpts, imagery.md
  sections 1-3 and 4, the dealt sheets); `layout.md`, `type.md`, `colour.md` I opened only by accident in one oversized dump and did not rely on.
