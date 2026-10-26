# Review: Ledgerly pricing page (seeded-pricing.html)

Rendered at 1280, 390 and 320 px in Chromium. Contrast ratios were computed from the CSS values. Line numbers refer to the fixture. Ranked by severity.

## Critical

1. **Keyboard focus indicator removed everywhere** (line 10, `a:focus, button:focus, input:focus { outline: none }`).
   - Tabbing through the page, computed outline is `none` on every link, button and input. Only `<summary>` still shows one.
   - Keyboard and switch users cannot tell where they are (WCAG 2.4.7, 2.4.11).
   - Fix: delete the rule. Add a `:focus-visible` style, e.g. `outline: 3px solid #1a56db; outline-offset: 2px`.

2. **Page blocks zoom** (line 5, `maximum-scale=1, user-scalable=no`).
   - Low-vision users cannot pinch-zoom on mobile (WCAG 1.4.4).
   - Fix: use `width=device-width, initial-scale=1`.

3. **Horizontal scroll and squashed plan cards on phones** (`.plans`, `.compare table { min-width: 560px }`).
   - At 390 and 320 px `scrollWidth` is 584 against a 390 or 320 px viewport, so the page scrolls sideways. The comparison table is the cause.
   - The three plan cards stay in one row. Each is about 135-220 px wide and wraps text (e.g. "Shared matching rules" breaks over 3 lines, and the Business button wraps to "Click / here").
   - The pricing decision is the page's purpose, so it breaks on the devices that matter most.
   - Fix: add `@media (max-width: 720px) { .plans { flex-direction: column } }`. Wrap the table in `overflow-x: auto`, or restack it as cards. Reflow at 320 px (WCAG 1.4.10).

4. **Comparison table encodes yes/no by colour only** (`td.yes` green #2da44e, `td.no` red #cf222e; lines 42-43, 101-103).
   - The cells are empty, so there is no text, icon or accessible name. Screen readers read blank cells.
   - Colour-blind users cannot separate them (green against red is only 1.67:1).
   - Fix: put "Included" / "Not included" in the cell, or a check / dash icon with a visually hidden label. Use softer colours. Add `<caption>`, `<thead>` and `scope="col"` / `scope="row"` for the headers.

## High

5. **Sticky header is 140 px tall and covers anchor targets** (line 11, `header.site`).
   - It is about 17% of an 800 px viewport, and on phones in landscape it is a large share of the screen. It contains only a logo and three links, so it has no reason to be that tall.
   - "Pricing" scrolls `#plans` to the viewport top. The first card then sits at y=32 under the 140 px header, so the plan names are hidden.
   - "Compare plans" (`scrollIntoView`) puts the table at y=5, also hidden behind the header.
   - Fix: set the height to about 56-64 px. Add `scroll-margin-top` (about 72 px) to `#plans`, `#faq` and `.compare`.

6. **Primary buttons have unreadable text** (line 25, `.btn-primary`).
   - White text on #ffd23f is 1.44:1, so the "Submit" label is barely visible.
   - Fix: use dark text (#222) on the yellow, which is about 11:1. Or use a darker fill.

7. **Plan CTAs read "Click here"** (three `.choose` buttons, lines 82, 88, 94).
   - The label says nothing about the outcome. Screen-reader users listing buttons hear three identical "Click here".
   - Fix: use "Start Starter plan", "Choose Team" and "Choose Business", or add `aria-label`s that include the plan name.

8. **"Most popular tier" badge is on the wrong card and the three cards are not consistent** (line 78 and `.plan:nth-child(1/3)` rules, lines 28-29).
   - "Most popular" sits on Starter, the cheapest plan, with no visual emphasis, while Team is the natural pick.
   - Paddings differ (20, 24, 28 px) and Business has a fixed `height: 380px`. In the render the heights come out as 267, 237 and 438 px, so the row is ragged and the Business card has a large empty area. Titles and prices do not line up across cards.
   - Fix: decide which plan is the recommended one and mark it with a badge and a highlighted border. Use one padding and `align-items: stretch`. Drop the fixed height. Pin the CTA to the bottom of each card.

9. **Hover jolts the layout** (lines 27 and 30, `.plan { transition: all 0.6s }`, `.plan:hover { width: 104%; height: auto }`).
   - Hovering the Business card snaps its height from 438 px to 266 px over 0.6 s. The card shrinks and the cursor can fall off it, so it flickers.
   - Width has no effect in the flex row. `transition: all` animates layout properties and runs the 0.6 s transition on everything.
   - Fix: remove the size changes. Use a subtle `box-shadow` or `transform` hover on a specific property, with a short duration, and respect `prefers-reduced-motion`.

10. **Starter feature line is clipped** (line 81, `.feature-line { width: 180px; white-space: nowrap; overflow: hidden }`).
    - The text "100 reconciliations per month, one bank connection, CSV and PDF export" is cut at "one ba" (scrollWidth 357 px against 180 px). The line also duplicates the list item above it.
    - "One bank connection" and "CSV and PDF export" are plan limits users need and cannot read.
    - Fix: remove the width and nowrap, and fold the details into the `<ul>`.

11. **Looping, auto-scrolling ticker** (lines 16-18, `.ticker span`, 8 s linear infinite).
    - The text is mostly off-screen (only "Rec" shows on desktop). It moves constantly, cannot be paused, and has no `prefers-reduced-motion` handling.
    - WCAG 2.2.2 (pause, stop, hide) and 2.3.3 apply. It also pulls the eye away from the pricing.
    - Fix: delete it, or make it static text. If it stays, add a pause control and a reduced-motion override.

12. **Low-contrast light-grey text** (line 21, `.lede { color: #bbb }`).
    - "Prices are shown per month, billed monthly." is #bbb on white, 1.92:1. It is the key billing statement for the prices.
    - The hero lede (#dcd0ff) is 4.04:1 on the purple end of the gradient and 2.67:1 on the blue end, which also fails.
    - Fix: use #555 or darker on white (the page's #222 ink also works). Lighten the hero lede to near white, or darken the gradient.

13. **Error message is unhelpful and not announced** (lines 114-115).
    - "Error 422" is a raw status code, followed by "You entered an invalid email address.". That blames the user and gives no example or next step.
    - It is split into two paragraphs, sits indented 24 px more than the field (because `.error` has its own padding inside the already padded section), and has no association with the input.
    - Fix: one inline message, "Enter an email address like name@example.com". Add `aria-describedby` and `aria-invalid="true"` on the input, and `role="alert"` or `aria-live` on the message. Drop the code.

14. **Newsletter input is low-visibility and has no label** (line 44, 112).
    - The border is #e6e6e6 on white, 1.25:1 (WCAG 1.4.11 needs 3:1). The only label is the placeholder, which disappears on typing and is not a reliable accessible name.
    - Fix: add a visible `<label for="newsletter-email">`. Use a border of #767676 or darker. Add `autocomplete="email"`.

15. **Destructive dialog is mislabelled and unsafe** (lines 117-120).
    - A "Delete workspace" confirmation sits inline in a pricing page, which is out of context. It is a static `div` with `role="dialog"` but no `aria-modal`, no focus management and no heading.
    - The buttons "OK" and "Cancel" are vague, and both look identical, so the destructive action has no distinct treatment.
    - Fix: if it is needed, use a real modal with focus trapping, and a labelled destructive button, "Delete workspace" (red) next to "Keep workspace". Otherwise remove it from this page.

## Medium

16. **Banner close button has no accessible name and a small target** (line 66, `.banner-close`, 28x28 px).
    - It contains only an SVG, so a screen reader announces "button". Pointer targets are under the 44 px comfort size (24 px is the WCAG 2.5.8 minimum).
    - Fix: add `aria-label="Dismiss announcement"`, `aria-hidden` on the SVG, and a hit area of 44 px. It also has no JavaScript, so it does nothing (the only script is the empty `toggleCompare()`).

17. **"Compare plans" is a `<p>` with an `onclick`** (line 97).
    - It is not focusable and not reachable by keyboard, and it has no role. Styled as a link, it is not a link. It also scrolls the table under the sticky header (see 5).
    - Fix: use `<a href="#compare">` with an id on the table's container. The `toggleCompare` stub is dead code.

18. **Tab order is overridden** (line 63, `<a href="#faq" tabindex="3">`).
    - Measured tab order: FAQ, Pricing, Sign in, ... A positive tabindex jumps FAQ ahead of Pricing, which breaks reading order (WCAG 2.4.3).
    - Fix: remove the tabindex.

19. **Brand and hero images missing alt text** (lines 61 and 71).
    - Both `<img>` tags have no `alt`. The logo is a flat yellow rectangle with no brand name or text, and there is no link to the home page.
    - The hero image is a blank translucent rectangle that adds nothing and pushes the plans about 200 px down.
    - Fix: `alt="Ledgerly"` on the logo (wrapped in a link to `/`). Use `alt=""` on the hero image, or remove it.

20. **Too many typefaces, with headings that do not use heading semantics well** (lines 9, 14, 16, 20, 31, 33, 53).
    - Georgia, Arial, Comic Sans MS, Courier New and Impact are mixed in one view. Comic Sans on the banner, Courier on the ticker and prices, and Impact on h1, h4 and summaries make the page look unprofessional for a finance product.
    - Heading levels jump: h1 then h4 (plan names), h2, h3, and the plan name `h4` is 16 px, smaller than its price. Impact has no bold/italic and falls back on some systems.
    - Fix: pick one or two families. Use `h2` for the plan names, and style them with the scale (about 20-24 px).

21. **Body copy too small** (lines 35, 36, 47, 55).
    - Feature list items are 12 px, the badge 12 px, the fine print 11 px and the footer links 12 px. Prices are the key detail and the features sit beneath them in the smallest type on the page.
    - Fix: minimum of 14-16 px for list items and footer links, 13 px at least for fine print.

22. **Fine print contradicts the plans and is hard to read** (line 121).
    - "Annual plans are billed once a year" and "All plans include a trial" conflict with "Prices are shown per month, billed monthly" and give no annual price. The FAQ says "14 days" while the fine print gives no length. The text is #777 at 11 px, 4.48:1, just under the 4.5:1 minimum.
    - Fix: state the trial length once, remove annual-billing text if there is no annual option, or show an annual toggle. Raise the contrast to #666 or darker and the size to 13 px.

23. **Prose block is hard to read** (lines 45-46, `.about { max-width: none }`, `.about p { line-height: 1 }`).
    - A single 100+ word sentence is set across the full 1230 px width, around 190 characters per line, with line-height 1 so lines touch.
    - Fix: `max-width: 65ch`, `line-height: 1.5-1.6`, and break the paragraph into short sentences. "Why teams choose" would read better as three short benefit points.

24. **Headline and hero copy is vague** (line 69, "Pick the perfect Package").
    - "Perfect Package" is filler and "Package" is capitalised at random, while the page calls them "plans" and "tier" in other places.
    - Fix: "Plans for every finance team" or similar, in sentence case. Use "plan" consistently (the badge says "Most popular tier").

25. **Emoji feature icons** (line 74, `.features-icons`).
    - The emoji are read aloud ("rocket", "locked", "chart increasing") and render differently per platform. The row is plain inline text that wraps awkwardly at 390 px ("Clear reports" falls onto its own line).
    - Fix: use SVG icons with `aria-hidden`, and lay the row out as a list with flex gap.

## Low

26. **Footer links are tiny and tightly packed** (line 55, `footer a`, 12 px, 6 px gap, 14 px tall).
    - Touch targets are about 14 px high. Links such as Terms/Privacy are easy to mis-tap on mobile.
    - Fix: increase to 14-16 px, add vertical padding to reach at least 24 px (preferably 44 px), and a wider gap.

27. **FAQ is thin and uses weak affordances** (lines 122-126).
    - Only two questions, with no billing, cancellation or tax answers that the fine print hints at. The summary text is Impact, and the default disclosure triangle is the only cue. The FAQ answer says "14 days" only here.
    - Fix: add the missing billing questions, give summaries a visible focus ring (the default outline remains), and bump the font.

28. **Newsletter form is not a `<form>`** (lines 110-113).
    - The input and button are not in a form element, so Enter does not submit and autofill is limited.
    - Fix: wrap in `<form>`, add `type="submit"` to the button, and make the label "Get pricing updates by email" explicit about what is being signed up for.

