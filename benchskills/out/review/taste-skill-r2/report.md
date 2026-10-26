# Review: Ledgerly pricing page (`fixtures/seeded-pricing.html`)

Method: taste-skill review workflow (record the before with `inspect.mjs`, lint the source, critique the screenshots with `references/critique.md`, list findings with measurements). Page rendered at 1440, 768 and 390 px. Line numbers refer to the fixture. Findings are ranked by severity (what stops or misleads a user first). The fixture was not edited.

Inspector result: 14 FAIL, 6 WARN. Lint: 5 FAIL, 8 WARN. Both are folded into the findings below only where they point at a real user-facing problem. Rules that are only house style are listed in the last section and not ranked.

## Critical

### 1. Phone layout breaks: the page scrolls sideways by 194 px and the third plan is off-screen
- Where: `.plans` (line 26, `display:flex`, no wrap), `.plan` (27), `.compare table { min-width:560px }` (40). Measured at 390 px: `scrollWidth` 584, plan 1 is 222 px wide, plan 2 139 px, plan 3 sits at x=417-552, entirely beyond the 390 px screen. The Business plan, the most expensive one, cannot be seen without a sideways scroll. Inspector `[overflow]`: +194 px.
- Why it matters: on a phone most visitors will never find Business, and Team's text is squeezed to 2-3 words per line ("Shared / matching / rules"). The comparison table is cut after the Starter column, so the green/red comparison cannot be read.
- Fix: stack the plans in one column below ~720 px (`flex-direction:column` or `flex-wrap:wrap` with `flex:1 1 280px`). Wrap the table in a container with `overflow-x:auto`, or give each plan its own comparison rows on small screens. Drop `min-width:560px` from the table.

### 2. The comparison table says "yes" and "no" with colour only
- Where: `td.yes` / `td.no` (lines 42-43), cells at lines 101-103 are empty. Each `td` has no text, no icon and no accessible name.
- Why it matters: screen-reader users hear a row of blank cells. About 1 in 12 men cannot tell red `#cf222e` from green `#2da44e`. Red also reads as an error or a warning, when it only means "not included". A plain "Included" or "Not included" would work.
- Fix: put visible text or a symbol in each cell ("Included" / "Not included", or a check and a dash) plus visually hidden text, and use a neutral tone for "not included". Add `<caption>` and `scope="col"` / `scope="row"` to the `th` cells. Also add the rows that actually differ between plans (seats, reconciliations per month, support), because the three rows now repeat what the cards already say.

### 3. Keyboard focus is invisible and the tab order is wrong
- Where: line 10, `a:focus, button:focus, input:focus { outline:none }` with no replacement style. Measured: every link, button and the email input has `outline-style:none` and no box-shadow when focused; only the `<summary>` rows keep the browser ring. Line 63, `tabindex="3"` on the FAQ link. Measured tab sequence from the top of the page: FAQ, Pricing, Sign in, banner close, Click here, ...
- Why it matters: a keyboard user cannot see where they are on any control except the FAQ rows. A positive tabindex jumps FAQ ahead of the logo-side links and of Pricing, so the order does not match the visual order.
- Fix: delete line 10 and add a visible `:focus-visible` style (2-3 px outline, offset 2 px, 3:1 against the surface). Remove `tabindex="3"`.

### 4. The error message is on screen before anyone has typed, and it is not tied to the field
- Where: lines 110-116. `<p class="error">Error 422</p>` and `<p class="error">You entered an invalid email address.</p>` are in the static markup, so a first-time visitor is told they got their email wrong. "Error 422" is an internal status code. The input has no `<label>` (placeholder only, `input.labels.length` = 0), no `aria-invalid`, no `aria-describedby`, and the message has no `role="alert"`. The section is a `<section>`, not a `<form>`, so pressing Enter in the field does nothing.
- Why it matters: it is false feedback. Assistive technology users get no announcement when a real error occurs, and the field has no name once the placeholder disappears.
- Fix: remove both messages from the static markup and show one only after a failed submit. Write it as "Enter an email address like name@company.com", put it next to the field, set `role="alert"`, `aria-invalid="true"` and `aria-describedby` on the input. Wrap the field and the button in a `<form>` and add a visible `<label for="newsletter-email">`.

## High

### 5. Plan cards: wrong button labels, no plan named in the action, and the primary button is invisible-looking
- Where: lines 82, 88, 94, `.choose` (line 37), `.btn-primary` (25), line 113.
- What is wrong: all three plan buttons say "Click here". A screen-reader button list would read "Click here, Click here, Click here". The hero has no button at all (inspector `[first-action]`: no visible button in the first screen). `.btn-primary` is white text on yellow `#ffd23f` (contrast 1.4:1, line 25, used by "Submit"), so its label is nearly unreadable. The plan buttons are a different colour (violet) from the only other action, so the page has two unrelated button styles. Plan buttons are 35 px tall (below the 44 px touch size).
- Fix: label them "Choose Starter", "Choose Team", "Choose Business" (or "Start Starter trial"). Use one button style, dark ink on the accent (about 12:1) or white on a dark accent, at least 44 px tall. Add one primary action to the hero ("See plans", linking to `#plans`).

### 6. Plan cards are misaligned and one is cut off, so prices cannot be compared at a glance
- Where: lines 27-29, 31, 36, 78. `.plan:nth-child(1)` has padding 20, `(3)` has padding 28 and `height:380px`, the others 24; `align-items:flex-start` (26) leaves the cards at heights 267 / 237 / 438 px. Measured at 1440: plan names sit at y=783 / 787 / 791 and prices at y=840 / 822 / 825. Business has about 170 px of empty card below its button. The "Most popular tier" pill (line 78) sits on the cheapest plan only, pushes its price down, and makes the claim ("most popular") unconfirmed.
- Also: `.feature-line` (line 36, `width:180px; overflow:hidden; white-space:nowrap`) is clipped in Starter: "100 reconciliations per month, one ba", so "one bank connection, CSV and PDF export" can never be read. It also repeats the list item above it.
- Fix: one padding for all cards, `align-items:stretch`, no fixed height, name/price/list/button in the same positions, and the button pinned to the bottom with `margin-top:auto`. Delete the clipped `.feature-line` and move its useful words ("one bank connection", "CSV and PDF export") into the list as normal wrapping items. Highlight at most one plan, and only with a claim you can stand behind.

### 7. Hover on a plan makes the layout jump
- Where: line 27 `transition: all .6s` and line 30 `.plan:hover { width:104%; height:auto }`. Measured: hovering Business changes its height from 438 px to 266 px, so everything below moves up 172 px under the pointer. `width:104%` does nothing (flex items), so the intended effect is also broken.
- Why it matters: the Compare link, the table and the heading below slide away as the pointer passes over the cards, and the click target can move out from under the cursor.
- Fix: remove the hover rule. If a hover effect is wanted, animate `transform` or background colour only, and name the properties instead of `all`.

### 8. The sticky header is 140 px tall and covers what anchor links jump to
- Where: line 11 (`position:sticky; height:140px; z-index:5`), links lines 62-63, `onclick` scrollIntoView line 97. Measured: after clicking "Pricing" the `#plans` section sits at top 0, behind the header, so the plan names and the badge are hidden. After "Compare plans" the table's top is at 105 px, its header row under the bar. The bar uses 140 of 900 px on desktop and 140 of 844 px on a phone, 16-17% of every screen, and carries only a blank yellow rectangle and three links.
- Fix: reduce the bar to 56-64 px and add `scroll-margin-top` (or `scroll-padding-top` on `html`) equal to the bar height plus 16 px.

### 9. Text below readable size or contrast in the places that matter most
- `.lede` (line 21, `#bbb`) is the "Prices are shown per month, billed monthly." line at 1.9:1 on white. It is the only statement of the billing period and the cards show bare "$19", "$59", "$149" with no "/month". Hero lede (line 22, `#dcd0ff` over the gradient) measures 4.04:1 at the purple end and 2.67:1 at the blue end, below 4.5:1 at 18 px.
- `.plan li` (35) and `.feature-line` (36) are 12 px, `.plan .badge` is 12 px, `.fineprint` (47) is 11 px `#777` (4.48:1) and holds "Prices exclude tax", "Annual plans are billed once a year", the trial terms. Footer links (55) are 12 px, 14 px tall, 6 px apart. Inspector `[small-text]`: 8 blocks under 13 px.
- Why it matters: the facts a buyer decides on (what is in each plan, per what period, tax) are set smaller and lighter than decoration.
- Fix: plan list items 16 px, fine print 14 px minimum in full ink, footer links 14-16 px with 44 px hit areas, intro line in body ink at 16-18 px and printed beside the prices as "$19 / month".

### 10. The "Compare plans" link is not a link
- Where: line 97 `<p class="compare-link" onclick=...>`. Measured `tabIndex -1`: not reachable by keyboard, no role, not announced as interactive. The target is the table about 20 px below it, so it also does almost nothing. `function toggleCompare() {}` (line 130) is an empty leftover.
- Fix: delete it, or make it a real `<a href="#compare">` / `<button>` that expands a hidden table. Remove the empty function.

### 11. The banner's close button does nothing and has no name
- Where: line 66, `.banner-close`. Clicking leaves the banner in place (verified). The button holds only an SVG, so it has no accessible name; it is 28 x 28 px with a 1px `#ccc` border.
- Fix: add `aria-label="Dismiss announcement"`, wire it to hide the banner, make the target at least 44 px. If dismissal is not wanted, remove the button.

### 12. Zoom is disabled
- Where: line 5, `maximum-scale=1, user-scalable=no`.
- Why it matters: low-vision users cannot pinch-zoom the 11-12 px text above (WCAG 1.4.4).
- Fix: `content="width=device-width, initial-scale=1"`.

## Medium

### 13. A destructive confirmation sits in the middle of the pricing page
- Where: lines 117-120, `role="dialog" aria-label="Delete workspace"`. A bordered box reading "Delete workspace? This cannot be undone." with "OK" and "Cancel" is inline between the form and the fine print. It is not modal, not focus-managed, and has no relation to a pricing page. "OK" for an irreversible delete is the wrong label, and OK/Cancel are unstyled default buttons 31 px high with Cancel not the default.
- Fix: remove it from this page. When it is needed, use a real modal (`<dialog>`), label the buttons "Delete workspace" and "Keep workspace", style the destructive one as destructive, focus Cancel first.

### 14. The moving ticker is distracting and cannot be stopped
- Where: lines 16-18, 67. A monospace marquee ("Reconciled this week: invoices matched...") loops every 8 s, starts blank (`padding-left:100%`), is cut off at the right edge in every screenshot, and has no pause or reduced-motion rule. It is not information a buyer needs at this point.
- Why it matters: moving text longer than 5 s needs a pause control (WCAG 2.2.2), it pulls the eye off the headline, and its text is never fully visible.
- Fix: remove it, or make it static; if kept, honour `prefers-reduced-motion` and give it a pause button.

### 15. Hero is weak and holds an empty placeholder
- Where: lines 19-24, 68-72. The headline "Pick the perfect Package" (44 px, 3.1vw, "Package" capitalised mid-sentence) says nothing about the product, and the product name Ledgerly appears nowhere in the header or hero (the logo is a blank yellow rectangle with no `alt`, line 61). Below it `.hero-shot` is a translucent blank box (line 71: a 320 x 180 empty rect) that looks like a failed image. Hero is centred while every other section is left-aligned. Inspector `[focal-point]`: nothing on the first screen dominates; `[few-pictures]`: 0 real pictures.
- Fix: write a headline that names the product and the price ("Reconcile invoices to bank lines from $19 a month"), a visible wordmark and `alt="Ledgerly"` (or `alt=""` if the text name is beside it), and either a real product screenshot or remove the box. Put the one action under the headline.

### 16. The "What you get" icon row is made of emoji and breaks at phone width
- Where: lines 56, 74. Emoji 🚀 🔒 📈 carry the points; the three items are loose text in a div with no list structure, wrap at 390 px with "Clear reports" falling alone on the next line (mobile screenshot), and sit between the billing note and the plans, pushing the prices down. Emoji look different on every platform and are read aloud as "rocket", "locked", "chart increasing".
- Fix: remove the row or turn it into a `<ul>` of three short statements in words, with no emoji, and give it a layout that wraps as whole items.

### 17. The "Why teams choose Ledgerly" paragraph is one 73-word sentence at 174 characters per line with 1.0 line height
- Where: lines 45-46 (`.about { max-width:none }`, `.about p { line-height:1 }`), line 108. Measured: line-height 16 px on 16 px type, so descenders touch ascenders (visible in the 1440 and 768 screenshots), and the line length is about 174 characters (inspector `[measure]`) against a comfortable 45-75.
- Fix: `max-width:60ch`, `line-height:1.5`, and split it into two or three sentences or a short list of reasons.

### 18. Heading structure is broken, and the plans have no section heading
- Where: line 69 h1, then `h4` for plan names (lines 77, 85, 91), `h2` "Why teams choose Ledgerly", `h3` "Get pricing updates", `h2` "Questions". The h1 jumps to h4; the plans section has no heading at all (the one section the visitor came for), and the page has no `<main>` or `<nav>` landmark. Inspector counted 4 headings.
- Fix: add `<h2>Plans</h2>` before the cards, use `h3` for plan names, make "Get pricing updates" an h2 or h3 in order, wrap the header links in `<nav>` and the body in `<main>`.

### 19. The email field is hard to see and mismatched with its button
- Where: line 44. Border `#e6e6e6` on white is 1.25:1 (WCAG asks 3:1 for the edge of a control). The input is 36 px tall and the button 42 px, so they do not line up in the screenshots. The "Submit" label (line 113) is generic.
- Fix: border `#767676` or darker, same height (44 px) for field and button, label the button "Get pricing updates" or "Subscribe".

### 20. FAQ is two one-line answers and the footer is a row of 14 px links
- Where: lines 122-126, 127-129. The FAQ has two questions with answers of 5-6 words; nothing about billing, annual pricing, cancelling, or what happens above the plan limits, although the fine print mentions annual plans and cancellation. The footer links all go to `href="#"`, are 12 px and 14 px tall (below the 24 px minimum target size, WCAG 2.5.8), and sit 6 px apart.
- Fix: add answers for the questions the page itself raises (annual billing, tax, cancelling, going over 100 reconciliations), 16 px footer links with spacing, and real URLs (or remove dead links; "Sign in" at line 64 is also `#`).

## Low

### 21. Five typefaces and ten font sizes
- Where: Georgia (body, line 9), Impact (20, 31, 53; falls back to the system sans where Impact is missing, as in my renders), Courier New (16, 33), Comic Sans (14), Arial (13, 25, 54). Inspector: `[font-count]` 5, `[size-count]` 10 sizes (11 to 44).
- Why it matters: the page looks assembled from unrelated pieces, and the fallback means the intended Impact headings render differently on different machines. Prices in Courier look like code.
- Fix: one family (two at most), a five-step scale, tabular figures for prices.

### 22. Decoration that adds nothing
- The violet-to-blue gradient hero (line 19), pill badge (32), rounded 1px outlined cards (27, 49), hairlines on FAQ items (52). They are house-style failures in taste-skill and add visual noise; replace with flat fields and tone steps. Lower priority than everything above because none blocks a task.

## Critique round (references/critique.md shape)

```
ROUND 1
Seen in one second: a purple-blue gradient with a blank translucent box.
Idea (one sentence): none; "a pricing page for software" with the product name missing.
Live thing: none (a dead banner button, a dead Compare link).
Layout words by section: hero=centred stack / features=inline emoji row / plans=three-column row / compare=colour grid / about=full-width text / newsletter=form / FAQ=list / footer=link row
Scores: design 3 · usability 3 · creativity 3 · content 4 → overall 3.2
Caps applied: any FAIL (6.0), fewer than four real pictures (6.5), still-page (7), small grey text (6.5), placeholder (content 5), no first-screen button (usability 7), anything not reachable on phone / content clipped off-screen (usability 5)
Top three problems:
1. Phone: three plans and the table overflow by 194 px, Business is off-screen (mobile-page-01.jpg).
2. Plans are misaligned, one is clipped, labels read "Click here", and the table says yes/no with colour only (desktop-page-01.jpg, plans-1440.png).
3. No visible focus, wrong tab order, a false error message shown at load (inspector output and tab-order measurement).
```

## What I did not list as findings
Lint and inspector items that are style rules and not a user problem at this point (eyebrow label rule on plan names, violet palette rule, no footage, no motion layer) are not ranked above; the pill badge and violet are in finding 22 only.
