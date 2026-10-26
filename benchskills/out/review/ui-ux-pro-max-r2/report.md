# Review: Ledgerly pricing page (`fixtures/seeded-pricing.html`)

Method: static read of the source plus rendering in Chromium at 1280 and 375 px. Measured contrast, target sizes, tab order, overflow, hover and reduced-motion behaviour. Rule IDs in brackets come from the ui-ux-pro-max quick-reference. Findings are ranked by severity. Line numbers refer to the fixture file.

## Critical / High

1. **Zoom is disabled** (line 5, `<meta name="viewport" ... maximum-scale=1, user-scalable=no>`).
   - Low-vision users cannot pinch-zoom the page, and this fails WCAG 1.4.4. [viewport-meta]
   - Fix: use `content="width=device-width, initial-scale=1"`.

2. **Focus outlines are removed everywhere** (line 10, `a:focus, button:focus, input:focus { outline: none; }`).
   - I tabbed the whole page. Every link, button and input reports `outline-style: none`, so keyboard users cannot see where they are. Only the `<summary>` elements keep a ring. [focus-states]
   - Fix: delete the rule. Add `:focus-visible { outline: 3px solid #1a56db; outline-offset: 2px; }`, which gives 3:1 contrast against the neighbouring colours.

3. **Primary buttons are unreadable**: white text on yellow.
   - `.btn-primary` (Submit, line 25) is `#fff` on `#ffd23f`, a measured ratio of **1.44:1**. The minimum is 4.5:1. [color-contrast]
   - Fix: use dark text (`#1d1d2b` on `#ffd23f` is about 12:1).

4. **Page overflows horizontally at 375 px** (`.compare table { min-width: 560px }`, line 40).
   - At 375 px, `scrollWidth` is 584 against a 375 px viewport. The table sits in a plain `div` with no overflow handling, so the whole page scrolls sideways. [horizontal-scroll]
   - Fix: wrap the table in `overflow-x:auto` with a visible scroll cue, or restack the table as per-plan cards on small screens.

5. **The three plans are squeezed side by side on phones.**
   - `.plans` is `display:flex` with no wrapping or breakpoint. At 375 px the cards are 222, 139 and 135 px wide. "Unlimited reconciliations" and "Click here" wrap awkwardly. [mobile-first]
   - Fix: use `flex-wrap:wrap` or a single column below about 700 px, e.g. `@media (max-width:720px){.plans{flex-direction:column}}`.

6. **The comparison table says yes/no with colour alone.**
   - `td.yes` is green and `td.no` is red, with empty cells (lines 101-103). There is no text, icon or accessible name.
   - Colour-blind users and screen-reader users get nothing. Red and green are 1.67:1 against each other. [color-not-only]
   - Fix: put "Included" / "Not included" text, or a check/cross icon with a visually hidden label, in each cell. Add `scope="col"` and `scope="row"`, and a `<caption>`.

7. **"Compare plans" is not keyboard operable** (line 97, `<p class="compare-link" onclick=...>`).
   - It is a paragraph with a click handler, so it is not focusable and has no role. Keyboard and screen-reader users cannot use it. [keyboard-nav]
   - A `toggleCompare()` function exists (line 130) but is empty and unused, which is dead code.
   - Fix: make it `<a href="#compare">` or a `<button>`, and give `.compare` an `id`.

8. **The newsletter form is placeholder-only and its error is disconnected.**
   - `#newsletter-email` has no `<label>` (line 112). [input-labels]
   - The input border is `#e6e6e6` on white, 1.25:1, so the field is almost invisible (needs 3:1).
   - The error text shows "Error 422" and "You entered an invalid email address." in static paragraphs placed below the button, before the user has submitted anything. Neither is tied to the field: no `aria-describedby`, `aria-invalid` or `role="alert"`. [error-placement, aria-live-errors]
   - "Error 422" is an HTTP code the user cannot act on, and the message gives no way to fix it. [error-clarity]
   - Fix: add a visible `<label for>`, use a border of `#767676` or darker, and put one specific error directly under the input. For example: "Enter an email like name@company.com", with `id` and `aria-describedby`, `aria-invalid="true"` and `role="alert"`. Show it only after a failed submit.

9. **Plan call-to-action buttons are all "Click here".**
   - There are three identical buttons in the accessible-name list (lines 82, 88, 94). Their labels are vague, and a screen-reader button list cannot tell them apart. [error-clarity, aria-labels]
   - Nothing marks a recommended plan: all three buttons look the same, and `.choose` is purple while `.btn-primary` is yellow, so button styling is inconsistent. [primary-action]
   - Fix: label them "Choose Starter", "Choose Team", "Choose Business". Make the recommended plan the single filled primary and the others secondary.

10. **Light-grey text is unreadable.**
    - `.lede` is `#bbb` on white (line 21), used for "Prices are shown per month, billed monthly." Measured **1.92:1**. It is the only statement of the billing period, so it is critical content.
    - The hero lede `#dcd0ff` on the gradient is 4.04:1 at the purple end and **2.67:1** at the blue end (line 22).
    - `.fineprint` is `#777` at 11 px, 4.48:1, just under 4.5:1 and also too small. [color-contrast, readable-font-size]
    - Fix: set `.lede` to `#555` or darker. Make the hero lede white or near-white. Make the fineprint `#595959` at 13 px or larger.

## Medium

11. **Prices have no billing unit.**
    - "$19", "$59" and "$149" carry no "/month". The unit appears only in the faint grey line above (finding 10).
    - Fix: render `$19<span>/mo</span>` inside each card.

12. **Content contradicts itself.**
    - The fineprint says "Annual plans are billed once a year" and "All plans include a trial". The page says "per month, billed monthly" and offers no annual option.
    - The FAQ says a free trial is "Yes, 14 days".
    - Fix: show the annual option, or remove the line. State the trial length once.

13. **The "Most popular tier" badge is on the cheapest plan only and cannot be compared** (line 78).
    - The badge sits on Starter, which is not visually emphasised. The other cards are not aligned with it, and the badge adds height to one card only, so the prices sit at different heights (visible in the screenshot).
    - Fix: put the badge on the plan you recommend, in a reserved slot on every card so the layout stays aligned.

14. **The plan cards are inconsistent and misaligned.**
    - Padding is 20 / 24 / 28 px across the three cards (`.plan:nth-child(1)` and `(3)`, lines 28-29). Business has a fixed `height:380px`, which leaves roughly 200 px of empty space under its content at 1280 px.
    - The cards render at heights of 267, 237 and 438 px. [spacing-scale, consistency]
    - Fix: remove the nth-child overrides. Use `align-items: stretch` so the cards match, and pin the CTA to the bottom with flex.

15. **The hover effect animates layout** (line 27 `transition: all .6s`, line 30 `.plan:hover { width:104%; height:auto }`).
    - It animates width and height with `all`, which causes reflow and layout shift. [transform-performance, layout-shift-avoid]
    - In the flex layout the width change does nothing, but `height:auto` makes the Business card jump from 380 px to its content height on hover.
    - Fix: remove it. Use a `transform: translateY(-2px)` and box-shadow transition, listing the properties explicitly. Wrap it in `@media (hover:hover)`.

16. **A feature line is clipped with no ellipsis and no way to read the rest** (line 36, `.feature-line`).
    - It is `width:180px; white-space:nowrap; overflow:hidden`, so the text shows "100 reconciliations per month, one ba". `scrollWidth` is 357 px against 180 px, so half the text is hidden, including "one bank connection, CSV and PDF export". It also repeats the list item above it. [truncation-strategy]
    - Fix: remove the fixed width and `nowrap` and let it wrap. Fold the unique information (bank connection, CSV/PDF export) into the list.

17. **The marquee ticker never pauses and ignores reduced motion** (lines 16-18).
    - It scrolls forever with `animation: scroll 8s linear infinite`. Under `prefers-reduced-motion: reduce` the animation name is still `scroll`. There are no pause controls, and the text is cut off at any moment.
    - It is distracting, and hard to read for users with cognitive or attention difficulties. WCAG 2.2.2 requires a way to pause content that moves for more than 5 seconds. [auto-rotation-controls, reduced-motion]
    - Fix: remove it, or show it as static text. At minimum add a pause button and a `prefers-reduced-motion` override with `animation:none`.

18. **The Delete workspace dialog does not belong on this page and is not a working dialog** (lines 117-120).
    - `role="dialog"` without `aria-modal`, focus management or Escape handling. It sits in the page flow.
    - "OK" is an ambiguous label for a destructive action, "OK" comes before "Cancel", and the destructive action has no danger styling. [destructive-emphasis, confirmation-dialogs]
    - It is unrelated to pricing and probably stray. If real: label the buttons "Delete workspace" (red) and "Keep workspace", move focus into the dialog, trap and restore it, and close on Escape. If stray, remove it.

19. **Tab order is broken** (line 63, `<a href="#faq" tabindex="3">`).
    - A positive `tabindex` makes FAQ the first stop, before "Pricing" and "Sign in". Measured tab order: FAQ, Pricing, Sign in. [keyboard-nav]
    - Fix: remove the `tabindex`.

20. **The sticky header is 140 px tall** (line 11).
    - It takes 21% of a 667 px phone viewport and permanently reduces the reading area. The logo inside is only 40 px. I did not find a case where it hid a focused control: the banner close button sat just below it when focused. [fixed-element-offset]
    - Fix: about 56-64 px. Add `scroll-padding-top` equal to the header height so anchor links (`#plans`, `#faq`) do not land under it.

21. **Icon-only controls and images have no accessible names.**
    - The banner close button (line 66) contains only an SVG and no `aria-label`. The `<img class="logo">` (line 61) and `.hero-shot` (line 71) have no `alt` at all. The logo is not a link home. [aria-labels, alt-text]
    - The emoji icons in `.features-icons` (line 74) are read aloud ("rocket", "locked", "chart increasing") and are not hidden from assistive tech. They are also emoji used as icons. [icon-context, no-emoji-icons]
    - Fix: `aria-label="Dismiss announcement"` on the button. Give the logo `alt="Ledgerly"` inside a link to `/`. Give the placeholder image `alt=""` or remove it. Replace the emoji with SVG icons carrying `aria-hidden="true"`.

22. **Heading hierarchy skips levels.**
    - The page goes h1 (hero), then h4 for plan names, then h2 ("Why teams choose", "Questions") and h3 ("Get pricing updates"). The plan names have no h2 or h3 above them. [heading-hierarchy]
    - Fix: add an h2 such as "Plans" and make the plan names h3. Use `<h3>` for the newsletter heading only if it is under an h2.

23. **Body paragraph is hard to read** (lines 45-46, `.about p { line-height:1 }`, `max-width:none`).
    - With `line-height: 1` the lines touch (`line-height` below the 1.5 minimum), and the measure is about 170 characters per line at 1280 px against a 65-75 character guideline. [line-height, line-length]
    - Fix: `line-height: 1.6; max-width: 65ch`.

## Low

24. **Typography is a mix of six families.**
    - Georgia (body), Arial, Comic Sans MS (banner), Courier New (price, ticker), Impact (h1 and card titles) and Times New Roman (fallback) are all in use. Impact and Comic Sans are not installed on many systems and fall back differently. [font-pairing, consistency]
    - Fix: pick one or two families. Use tabular figures in the sans for prices rather than Courier.

25. **Text is too small.**
    - Plan list items are 12 px (line 35), the badge is 12 px, the feature line is 12 px, footer links are 12 px and the fineprint is 11 px. [readable-font-size]
    - Fix: 14-16 px for plan content, no smaller than 12 px for any meta text.

26. **Small, tightly packed targets.**
    - Footer links are 12 px high, 14 px tall boxes, with a 6 px gap (line 55) and no padding. The banner close is 28 px. The plan CTAs are about 35 px high and the OK / Cancel buttons are 31 px.
    - These pass the WCAG 2.2 AA 24 px minimum or its spacing exception, but are poor for touch. [touch-target-size, touch-spacing]
    - Fix: footer links `padding: 10px 6px` with an 8 px gap. Set `min-height: 44px` on buttons, including the close button.

27. **The page has no `<main>` or `<nav>` landmarks, and no skip link.**
    - The header is a `<header>` but its links are not in a `<nav>`, and the content is not in `<main>`. [skip-links]
    - Fix: add `<nav aria-label="Primary">`, `<main id="main">` and a skip link.
