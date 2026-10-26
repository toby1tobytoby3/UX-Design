# Audit: Ledgerly pricing page (`benchskills/fixtures/seeded-pricing.html`)

Run with Hallmark `audit <path>` (genre inferred: modern-minimal, a SaaS pricing page). Findings are ranked by severity: a user cannot complete or perceive something (blocker), then a barrier or a wrong signal (serious), then a defect that costs trust or readability (moderate), then polish. Line numbers are the fixture's.

## The read (Hallmark's four lines)

- **What it is for.** Finance and ops people comparing three Ledgerly plans (Starter $19, Team $59, Business $149) and picking one. The one action is choosing a plan.
- **What works and stays.** The plan content (three plans, seat counts, features) and the short FAQ are clear and honest. Native `<details>` for the FAQ works with keyboard and screen reader.
- **What reads as generated.** A purple-to-blue hero gradient (gate 2a) with an empty placeholder box, emoji as icons (30a), five font families, "Click here" on every plan, a marquee ticker.
- **What is broken.** Keyboard focus is invisible, zoom is disabled, the sticky header covers anchor targets, the page scrolls sideways on phones, the main button is unreadable, and the plan cards are uneven.

Hallmark's linter result (static plus render tier, `--before`): 58 FAIL, 17 REFLEX, 8 WARN. Many of those are token-hygiene findings (gate 48: 39 literals outside `:root`) that are not user-visible problems, so they are summarised in one row at the end rather than listed.

## Blockers

### 1. Keyboard focus is removed everywhere (WCAG 2.4.7)
- **Where:** line 10, `a:focus, button:focus, input:focus { outline: none; }`. No `:focus-visible` rule exists. Measured by tabbing: `outline-style: none` on every link, button and the email input. Only the two `<summary>` elements keep the browser ring.
- **Why it matters:** A keyboard user cannot see where they are, on a page whose job is choosing a plan with a button. Hallmark gate 26a (Floor).
- **Fix:** Delete line 10. Add `:focus-visible { outline: 3px solid <token>; outline-offset: 2px; }` with at least 3:1 contrast against the surface, and no transition. Use a light ring inside the dark header.

### 2. Pinch-zoom is disabled
- **Where:** line 5, `maximum-scale=1, user-scalable=no`.
- **Why it matters:** Low-vision users cannot enlarge the page. This is made worse by the 11 to 12px text below (WCAG 1.4.4, 1.4.10).
- **Fix:** `<meta name="viewport" content="width=device-width, initial-scale=1">`.

### 3. The primary "Submit" button is unreadable
- **Where:** `.btn-primary` (line 25), white `#fff` text on `#ffd23f`. Measured contrast is 1.44:1 (needs 4.5:1). The same yellow is the logo and the only accent token, so the page's "primary" colour is the one that fails.
- **Why it matters:** The newsletter button label is almost invisible. Hallmark gates 40 and 41 (Floor).
- **Fix:** Dark ink on the yellow (`color: var(--ink)`, about 13:1), or a darker fill with white text. Pair the ink as a token.

### 4. The page scrolls sideways on phones
- **Where:** `.compare table { min-width: 560px }` (line 40). At 375px `documentElement.scrollWidth` is 584, so the whole page pans. There is also no `overflow-x` on `html`/`body`. At 320px the nav "Sign in" and the "Click here" buttons wrap to two lines.
- **Why it matters:** Phone users get a page wider than the screen, with the right edge of the table and header cut off. Gates 34 and 49a (Floor).
- **Fix:** Wrap the table in `overflow-x: auto` with a labelled scroll region, or restack rows on small screens. Add `overflow-x: clip` to `html` and `body`. Drop the table's `min-width`.

### 5. The three plans stay in one row on a phone
- **Where:** `.plans { display: flex }` (line 26) with no wrapping or media query. At 375px the cards are 222, 139 and 135px wide, so "Unlimited reconciliations" breaks into three lines and "Click here" wraps to two lines.
- **Why it matters:** This is the core content of the page, and it is cramped at exactly the width where most visits happen.
- **Fix:** `flex-direction: column` below about 720px (or `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))`), and `white-space: nowrap` on the plan buttons.

### 6. The sticky header covers anchor targets
- **Where:** `header.site` (line 11): `position: sticky; height: 140px`. Following the "Pricing" link (`#plans`) puts the section at `top: 0`, so the top 140px of the plans (the card tops, names and prices) sit under the header. The "FAQ" link has the same issue. No `scroll-margin-top` is set.
- **Why it matters:** The nav link a visitor clicks to see prices hides the prices' heading and top of the first card.
- **Fix:** `scroll-margin-top: calc(var(--header-h) + 16px)` on `#plans` and `#faq`, and shrink the header (see 12).

## Serious

### 7. Links and controls that do not work, or lie about what they are
- **`<p class="compare-link" onclick=...>` (line 97).** "Compare plans" is a paragraph with a click handler. It is not focusable, has no role and cannot be used from the keyboard. Make it `<a href="#compare">` (or a `<button>`), and give `.compare` an id. The table is already visible, so the link only scrolls a few pixels.
- **Dead `href="#"`** on "Sign in" (line 64) and every footer link (line 128). They jump to the top and go nowhere. Give them real destinations or remove them.
- **The banner close button** (line 66) has no handler and no accessible name (the SVG is unlabelled, so the button has no name at all). Add `aria-label="Dismiss announcement"`, `aria-hidden="true"` on the SVG, and wire it up or remove it.
- **`toggleCompare()`** (line 130) is an empty function that nothing calls. It is dead code.

### 8. Tab order is broken
- **Where:** `tabindex="3"` on the FAQ link (line 63). Measured: Tab goes FAQ, then Pricing, then Sign in. The order jumps ahead of the visually first link.
- **Fix:** Remove `tabindex`. Keep DOM order.

### 9. The comparison table works by colour alone, and is incomplete
- **Where:** `td.yes` and `td.no` (lines 42, 43, 101 to 103): empty cells filled green `#2da44e` or red `#cf222e`.
- **Why it matters:** The table has no text or icon, so a screen reader reads blank cells, and people with red-green colour blindness see the same shade (WCAG 1.4.1, 1.1.1). Full-saturation red blocks also read as errors. The table lists only 3 of the features the plans show, so it does not compare seats, reconciliation limits or support.
- **Fix:** Put "Included" and "Not included" (or a check mark and a dash with visually hidden text) in each cell, drop the filled colour, and add the missing rows. Add `<caption>` and `scope="col"` or `scope="row"` on the headers. Cell borders `#ccc` are 1.6:1, so use a darker hairline.

### 10. The "Click here" buttons say nothing, and are not tied to a plan
- **Where:** three `button.choose` (lines 82, 88, 94).
- **Why it matters:** The label tells a user nothing about the action. A screen-reader user listing buttons hears "Click here" three times. The buttons also have no `type`, no `href` and no behaviour. They are 35px tall (target under 44px), and purple `#7b2ff7` while the page's accent token is yellow, so the page has two unrelated primary-button styles.
- **Fix:** "Choose Starter", "Choose Team" and "Choose Business" (or "Start Starter trial"), a real link or form action, and one button recipe across the page.

### 11. The plan cards are unequal, and the badge misleads
- **Where:** lines 27 to 30. Padding is 20, 24 and 28px, so the cards are 392, 400 and 408px wide. Business has `height: 380px`, so it is 438px tall against 267 and 237px for the others (`align-items: flex-start` makes the ragged bottoms visible). The card tops do not line up either (names at different y), and the prices are at different heights.
- **Why it matters:** Cards that should be compared like for like look arbitrary, and the tall empty Business card looks like missing content.
- **Fix:** One padding value, equal heights (`align-items: stretch`), with the CTA pinned to the bottom of each card.
- **Badge:** "Most popular tier" (line 78) sits on Starter, the cheapest plan, and nowhere else, with no basis given. If it is a recommendation, check it is true (it is also an unsupported claim). Either highlight the plan you mean, with a clearly different treatment, or remove it.

### 12. A 140px sticky header, a banner and a ticker push the content down
- **Where:** `header.site` (140px), then `.banner`, then `.ticker`, then the hero. At 1280 x 800 the first plan card starts at y=754, so no price is visible in the first screen. The header is sticky, so 140px of every viewport (17% of 800px, 37% at 375px landscape) is permanently lost.
- **Fix:** A header of 56 to 64px, move the announcement into the page flow below it (or make it dismissible and working), delete the ticker, and let the plans appear within the first screen.

### 13. The ticker marquee cannot be paused and ignores reduced motion
- **Where:** `.ticker span` (line 17), `animation: scroll 8s linear infinite`, no `prefers-reduced-motion` rule, no pause on hover or focus. At 1280px only "Reconciled this" is visible at once; the text starts off screen and crosses in 8 seconds. It also carries no information for a pricing decision.
- **Why it matters:** Moving text that runs longer than 5 seconds needs a pause control (WCAG 2.2.2). People with vestibular disorders get motion they asked the OS to turn off (2.3.3). Gates 18 and 27.
- **Fix:** Delete it, or make it static text. If it stays, add a pause button and a `prefers-reduced-motion: reduce` rule.

### 14. The newsletter form is incomplete and its errors are shown before anyone types
- **Where:** lines 110 to 116.
  - There is no `<form>` and no label (the placeholder is the only name), and the field edge `#e6e6e6` is 1.25:1 on white (needs 3:1).
  - "Error 422" and "You entered an invalid email address." are permanently on screen above an empty field. The error is a raw HTTP code, is not tied to the input (`aria-describedby`, `aria-invalid`), has no `role="alert"`, and is indented 24px further than the heading and field above it (`padding: 0 24px` inside an already padded section).
  - The input is 36px tall and the button 42px, so they do not line up.
- **Fix:** A real `<form>` with a visible `<label for="newsletter-email">`, a 3:1 field border, and an error that appears only after a failed submit, in plain words ("Enter an email address like name@company.com"), linked to the input. Equal control heights of 44px or more.

### 15. A "Delete workspace?" confirmation dialog sits in the middle of the pricing page
- **Where:** `.confirm` (lines 117 to 120), `role="dialog"`.
- **Why it matters:** It is statically rendered in the flow of a pricing page, so a visitor reads a destructive prompt that has nothing to do with the page. As a dialog it has no focus handling, no `aria-modal`, no close behaviour. "OK" for a destructive action is ambiguous, and "This cannot be undone" does not say what is lost.
- **Fix:** Remove it from this page (it belongs to the app's workspace settings). In the real place: a modal that traps focus, the labels "Delete workspace" and "Keep workspace", the workspace name in the text, and Cancel as the initial focus.

## Moderate

### 16. Low-contrast and tiny text
- `.lede` (line 21) `#bbb` on white is 1.92:1: "Prices are shown per month, billed monthly." is the key pricing fact and is nearly invisible (the `.intro .lede` override in line 23 does not change the colour). `.hero .lede` `#dcd0ff` on the gradient is 4.04:1 at best (fails the 4.5:1 for 18px).
- `.plan li` 12px (line 35), `.badge` 12px, `.feature-line` 12px, `.fineprint` 11px `#777` (4.48:1, just under), footer links 12px. The plan features, the thing a buyer compares, are the smallest text on the page.
- **Fix:** Body and list text 16px (never under 14), fineprint 13 to 14px, lede darkened to 4.5:1 or better.

### 17. A clipped feature line and a duplicated feature
- **Where:** `.feature-line` (line 36): `width: 180px; white-space: nowrap; overflow: hidden`, so the Starter card reads "100 reconciliations per month, one ba" with the rest cut off silently. It also repeats the list item above it ("100 reconciliations per month"), and the text it hides ("one bank connection, CSV and PDF export") never appears elsewhere, so a buyer loses facts. No other plan has such a line.
- **Fix:** Fold the missing facts ("1 bank connection", "CSV and PDF export") into the `<ul>` as list items and delete the clipped line. Compare the three plans on the same rows.

### 18. Price presentation
- **Where:** `.plan .price` (line 33): "$19", "$59", "$149" in Courier New at 32px, with no period. The page states "per month, billed monthly" only in the faint `#bbb` line (16 above), and the fineprint adds "Annual plans are billed once a year" although no annual price or annual option appears anywhere.
- **Why it matters:** The unit belongs with the number. A price with no unit and a contradicting footnote erodes trust at the moment of decision.
- **Fix:** "$19 /month" in the card, set in the body or display face with tabular numerals. Either show the annual price or remove the annual sentence.

### 19. Heading structure is wrong
- **Where:** h1 "Pick the perfect Package" (line 69), then `h4` plan names (lines 77, 85, 91), then h2 (106, 123) and h3 (111). Skips levels, and the plan names are headings of the most important content.
- **Fix:** Plan names as `h2` (or `h3` under an `h2` "Plans"), "Get pricing updates" as h2, sized with CSS. Also: the h1 is Title Case with a stray capital ("Package") and is vague. State what is on offer ("Plans for reconciling invoices to bank statements").

### 20. The hero is an empty gradient with a blank placeholder box
- **Where:** `.hero` (line 19): `linear-gradient(135deg, #7b2ff7, #2f80ed)` (gate 2a, Floor), and `.hero-shot` (line 24, an empty translucent rectangle with an SVG that draws only a blank rect).
- **Why it matters:** The hero takes 427px and 53% of the first screen, shows nothing, and pushes the plans below the fold. The grey box looks like a failed image load.
- **Fix:** Remove the placeholder, or show the real product reconciling an invoice. A flat anchor-hue surface instead of the purple-to-blue gradient, and a hero short enough that the plan cards start in the first screen.

### 21. Emoji used as icons
- **Where:** line 74, 🚀 🔒 📈 in `.features-icons`. The emoji render in different styles per OS, are read aloud by name ("rocket") and are not in the icon system. The row is built from loose `<span>` and bare text, so it wraps awkwardly (at 375px "Clear reports" drops to its own line under the icons).
- **Fix:** One SVG icon set with `aria-hidden`, and a proper `<ul>` of three items. Or delete the row, since it repeats nothing the plans do not say. Hallmark 30a (Floor).

### 22. Five font families, and Comic Sans
- **Where:** Georgia (body), Arial (nav, buttons, footer), Comic Sans MS (banner, line 14), Courier New (ticker, prices), Impact (h1, plan names, FAQ questions). Headings use Impact in some places and the browser serif in others (`h2` "Why teams choose Ledgerly" is Georgia bold).
- **Why it matters:** The page has no typographic system and the product looks unserious for a finance tool. Gate 37.
- **Fix:** Two families (one for display and body, one for numerals at most), declared as `--font-*` tokens at `:root`.

### 23. The "About" paragraph is a wall of text
- **Where:** `.about { max-width: none }` and `.about p { line-height: 1 }` (lines 45, 46). A single 90-word sentence runs about 144 characters per line at 1440, at line-height 1 (lines touch).
- **Fix:** `max-width: 65ch`, `line-height: 1.5`, and split into two or three sentences.

### 24. Spacing and rhythm
- The table is followed by "Why teams choose Ledgerly" with about 19px between them, and h2/h3 heads sit nearer the content above than the content they head (gate 71). The confirm box and fineprint touch. Other gaps are 179px.
- `.compare-link` has `padding: 0 24px` but the table is not aligned with it.
- At 1920px the paragraph and sections run the full width: there is no `max-width` container (gate 44d).
- **Fix:** One section spacing scale, with larger space above a heading than below, and a centred container capped near 1200px.

### 25. Plan-card hover changes layout
- **Where:** `.plan { transition: all 0.6s }` and `.plan:hover { width: 104%; height: auto }` (lines 27, 30). Animating `width` and `height` with `all` triggers layout, and the card is not interactive, so it should not react. In practice `height: auto` on hover makes the Business card (fixed at 380px) jump from 438px to its content height, and the 0.6s transition cannot animate to `auto`. The `width` rule does nothing for the flex children.
- **Fix:** Remove the hover rule, or put the hover on the button only, and limit transitions to `transform, opacity` with a `prefers-reduced-motion` guard (gates 10a, 27).

## Minor

- **Logo image has no `alt`** (line 61), and is a plain yellow rectangle, not a logo or home link. Add `alt="Ledgerly"` and wrap it in a link to the home page.
- **Footer links are tiny targets:** 12px text, 14px tall, 6px apart (lines 55, 128). Give them 44px-tall hit areas and 16px gaps.
- **Banner and header typography clash:** the Comic Sans banner (line 14) next to the Arial nav. The close button's border (`#ccc`) is 1.61:1.
- **Missing meta description** and a generic `<title>` ("Ledgerly pricing").
- **FAQ:** the questions use Impact in a serif page, and there are only two. A trial FAQ ("14 days") should match the fineprint ("All plans include a trial") and the header. Consider adding billing, cancelling and seats questions.
- **Token hygiene (gate 48):** 39 colour and font literals sit outside the `:root` block (for example `#7b2ff7`, `#06c`, `#cf222e`), and `--accent` is the only token a rule uses. No `:active` or `:disabled` styles exist on any control. Not user-visible directly, but it is why the buttons and links drift (purple, blue, yellow) and a redesign would start here.

## Hallmark verdict and depth

- **Floor FAIL (render and static): 58**, REFLEX 17, WARN 8. The user-visible Floor failures are gates 2a, 10a, 26a, 27, 30a, 33, 34, 40, 41, 44d, 49a and 58, plus the 39 gate-48 token literals.
- **Lightest depth that settles them: polish** (fix tokens, contrast, focus, motion, emoji, zoom, table colour-only, labels, heading levels, scroll margin) with the stamp `redesign: polish`. Nothing in the findings above needs content changed.
- **What only a deeper depth settles (restyle or full):** the five-family typography, the purple gradient hero with a placeholder visual, the three-equal-cards layout with its unequal heights, the 140px chrome stack, the thin and crowded section rhythm (gates 59, 77, 78, 79), and the page anatomy (the plan comparison belongs next to the plans, with a clear recommended plan). The page should be redesigned at full depth if the owner wants the layout rethought.
- **For the owner, not decided by the audit:** whether "Most popular tier" on Starter is true, the annual-billing sentence, whether the compare table should list all features, and where the destructive-dialog markup belongs.
