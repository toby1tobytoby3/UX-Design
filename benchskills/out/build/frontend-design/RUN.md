# RUN: frontend-design skill, Ledgerly pricing page

Output: `index.html` (single file, inline CSS and JS, Google Fonts: Young Serif and Schibsted Grotesk, with system fallbacks). Screenshots from review are in `shots/`.

## Skill steps followed
1. Read SKILL.md in full. It has no scripts or reference files, only guidance.
2. Grounded the design in the subject. The skill says to identify the product, audience and primary job and confirm with the client. The brief already states all three, so no confirmation was needed.
   - Subject: bank-to-ledger reconciliation for small accounting teams.
   - Audience: bookkeepers and practice managers comparing plans.
   - Job: get them to pick a plan and start the trial.
3. Pass one: a compact plan covering color (5 named hex values), type, layout (prose, ASCII wireframes in my head, left aligned) and principles.
   - Paper `#E9F0E4`, Sheet `#FAFCF7`, Ink `#17283B`, Rule green `#8FAE99`, Pen blue `#1D44C4`.
   - Young Serif for headings and prices; Schibsted Grotesk for body and UI.
4. Review against the brief and the skill's "generic default" list. I changed:
   - Three rounded SaaS cards with a "Most popular" badge became one ruled ledger sheet with double vertical rules. The badge would also have been an invented claim.
   - The "Simple pricing" headline became "Pick a plan. Try it free for 14 days." (facts from the data).
   - No hero stat. The hero visual is an abstract bank statement against ledger drawing with no figures, so it makes no claim.
   - Palette: pale ledger green and ink blue, avoiding both the cream/terracotta cluster and the dark/acid cluster. The ink is `#17283B`, not tinted near-black.
   - No all-caps or tracked eyebrows, no mono labels, no middle-dot meta strings, no arrows on buttons, no numbered markers, and no single accented word in a headline.
   - Motion: one orchestrated moment (the hero ticks draw in sequence on load). Everything else is user-triggered: price swap on toggle, FAQ marker rotation.
   - The one place boldness is spent: accounting conventions. Prices carry the double underline used for totals, and the blue tick of checking an item off appears in features, table and hero.
5. Built, with CSS specificity kept flat (class selectors, with breakpoints overriding in order).
6. Critiqued with Playwright screenshots at 390, 768 and 1280 and ran keyboard and reduced-motion checks.

## Skipped or not applicable
- No scripts to run. No dark mode (not requested). "Jot notes for future passes" is covered by this file.

## Questions I answered for the skill (from the brief)
- What is the product, audience and job? See step 2.
- Are there client preferences? None given. I made my own palette and type choices.
- Currency: the data has bare numbers. I used `$` and wrote "US dollars per month" in the small print. This is an assumption.

## Changes after looking at screenshots
- At 390px the comparison table overflowed (page was 414px wide). I switched to `table-layout: fixed`, smaller padding and font, and 34% for the label column. There is now no horizontal scroll at any width.
- Punctuation had odd gaps ("ledger ."). The cause was `tabular-nums` set on body, so I limited it to the table and prices.
- The hero ticks rendered as dots because the dash length was shorter than the path. I lengthened the dash and made the ticks larger.
- Pre-rendered the plans, table, FAQ and hero drawing into the HTML so the page is readable without JS. The script only drives the toggle and repeats the same markup.

## Checks run (Chromium via Playwright)
- No horizontal overflow at 390, 768 and 1280.
- Tab order is skip link, logo, Pricing, header CTA, billing radios (one stop, arrow keys switch), three plan CTAs, then the FAQ summaries. Focus ring is a 3px blue outline.
- Arrow keys switch monthly and annual. Annual shows 15.20, 47.20 and 119.20 with "billed annually". The live note announces the change.
- Enter opens FAQ details. With reduced motion, animation-name is `none` and the ticks show fully drawn.

## Notes and assumptions
- CTA links point to `/trial?plan=...`. These are placeholders, as the page is a standalone file.
- Header and footer text uses only the product name and tagline hint from the data file.
- Plan features come only from the data. The "Bank connections" and "Export to CSV and PDF" facts appear only in the comparison table, as in the data.
