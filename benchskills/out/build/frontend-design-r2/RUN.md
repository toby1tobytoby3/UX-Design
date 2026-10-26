# RUN: frontend-design, build brief (Ledgerly pricing), run r2

## Skill steps followed
1. Read vendor/skills/frontend-design/SKILL.md in full, then the brief and pricing-content.json.
2. "Ground in the subject": the brief names the product, audience and job, so no confirmation was needed. Subject: invoice reconciliation, matching bank statements to a ledger. Audience: bookkeepers and practice managers at 2 to 20 person firms. Job: let them compare three plans and start a trial. I took my vocabulary from bookkeeping: ruled ledger paper, tick marks, and the double rule under a column total.
3. Design plan, then review against the brief, then build, then screenshots and critique.

### Design plan (first pass)
- Color: paper #ECF1ED (green-tinted ledger paper), sheet #F7FAF8, ink #15212C, rule #A7B9AE, pen blue #1E3CB8 (ticks and CTA).
- Type: one family, Bricolage Grotesque (variable: width and weight axes). Condensed and heavy for the headline and prices, normal width for body. No second face, no monospace.
- Layout: left-aligned throughout. The plans are one ruled sheet with three columns (not three separate cards), with the CTA directly under the price so the buttons line up. The comparison table and FAQ use the same heavy top rule.
```
 Pricing for small            [Monthly|Annual]  Annual billing is 20% less.
 accounting teams             +----------+----------+-----------+
 lede                         | Starter  | Team     | Business  |
                              | $19      | $59      | $149      |
                              | =======  | =======  | =======   |   (double "total" rule)
                              | [trial]  | [trial]  | [trial]   |
                              | ticks    | ticks    | ticks     |
 Compare plans  (table)
 Questions (heading left, accordion right)
```
- Principles: the double rule under each price is the one memorable thing; everything else stays quiet. Structure carries information only: the vertical rules separate plans, the ticks mean "included", the rules in the table separate rows. Nothing is numbered, because nothing here is a sequence.

### Review of the plan against the brief and the skill's default list
Changes I made at this step:
- My first instinct was a cream or off-white page with a serif display face. I dropped it for a green-grey ledger paper and a grotesque, which is what the subject suggests.
- I dropped eyebrow labels, a monospace face for figures, "01/02/03" markers, a highlighted "most popular" plan, and arrows on the buttons. The popular plan would also have been an invented claim.
- I dropped the SaaS card kit (equal rounded cards with soft shadows) in favour of one ruled sheet.
- I dropped the big-number-plus-gradient hero. The hero is the headline and a short lede only, and the prices carry the visual weight below it.
- Accent: only one hue, used for action and "included". No gradient and no decorative shadows.
- Motion: one moment only. On load the double total rules draw in left to right, staggered across the three plans. This is disabled under prefers-reduced-motion. The FAQ plus/minus rotation is user-triggered and is also disabled under reduced motion.

## Questions the skill raised, and my answers
The skill says to confirm the subject with the client if the brief does not give it. The brief did, so I did not need to ask. It also says to take aesthetic risk where justified. I did that in the type treatment and the ledger motif, not in the layout, because comparison tasks need predictable columns.

## Decisions on content (nothing invented)
- Everything comes from pricing-content.json. The hero lede reuses the FAQ wording ("14-day free trial, no card needed").
- The toggle's note ("Annual billing is 20% less") comes from `annual_discount`. In annual mode each plan shows the annual price and "billed annually". I did not compute yearly totals, to avoid adding numbers that are not in the file.
- The JSON prices have no currency. I assumed "$", which is an assumption and not content from the file. Say so if a different symbol or none is wanted.
- The CTA links are placeholders (`#trial-starter` and so on) because the brief gives no sign-up URL.
- There is no nav, no logo wall, no badges and no testimonials. The header carries only the wordmark and a tick mark I drew (not a claim).

## Failures and fixes after screenshots
Screenshots were taken at 390, 768 and 1280 px with Playwright. Google Fonts loaded in the check (font check true).
- At 390 px the comparison table overflowed the page by 7 px, which produced a horizontal scroll. I switched to a fixed table layout on phones, smaller type and tighter cell padding. After that, scrollWidth equalled the viewport at all three widths.
- My first fix on mobile broke "Business" and "Reconciliations" mid-word because I had used `overflow-wrap: anywhere`. I removed it and changed the column widths and font size instead.
- The headline and prices were too condensed and too tightly tracked (letters touched). I widened the font stretch to 84 to 88% and loosened the tracking.
- The hero's ruled lines were first applied with a mask on the whole hero, which faded the text. I moved the lines to a pseudo-element.
- The radio inputs of the toggle were stretched over their labels, and Playwright reported the input intercepting clicks on the label text. I made the inputs 1px and let the label take the click.
- At 768 px the plan sheet is one plan per row, with the feature list beside the price. That layout was checked and left as is.

## Checks run
- Overflow: no horizontal scroll at 390, 768 and 1280.
- Toggle: monthly is selected on load. Clicking Annual shows 15.20, 47.20 and 119.20 and "billed annually". Arrow keys on the radios also switch it.
- Keyboard: tab order is skip link, wordmark, toggle, three CTAs, then the FAQ summaries. Focus rings are visible (3px pen-blue outline). Details elements open with Enter or Space.
- Reduced motion: the load animation is `none` when `prefers-reduced-motion: reduce` is emulated.
- Not done: no automated contrast tool was run. Text and background pairs were chosen for roughly 6:1 or better (muted #465850 on #ECF1ED, white on #1E3CB8), but I did not measure them.
