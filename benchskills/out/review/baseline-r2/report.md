# Review: seeded-pricing.html (Ledgerly pricing)

Method: read the source (line numbers refer to `fixtures/seeded-pricing.html`), rendered at 1280 and 375 px in Chromium, measured box sizes and computed contrast ratios. Ranked by severity (Critical, High, Medium, Low).

## Critical

1. **Pinch zoom disabled** (line 5, `<meta viewport ... maximum-scale=1, user-scalable=no>`).
   Low-vision users cannot enlarge text on mobile; this fails WCAG 1.4.4 and 1.4.10. Fix: `<meta name="viewport" content="width=device-width, initial-scale=1">`.

2. **Keyboard focus is invisible** (line 10, `a:focus, button:focus, input:focus { outline: none; }`).
   Nothing replaces the outline, so a keyboard user cannot see where they are on any link, button or the email input (WCAG 2.4.7). Fix: delete the rule, or use `:focus-visible { outline: 2px solid #1a56db; outline-offset: 2px; }` with at least 3:1 contrast against its surroundings.

3. **Primary CTAs do not say what they do** (lines 82, 88, 94, `.choose` "Click here" x3).
   Three identical buttons give no plan context to screen-reader users listing buttons, and sighted users get no verb or outcome. Fix: "Choose Starter", "Choose Team", "Choose Business" (or "Start Starter trial"), or add `aria-label`/visually hidden plan name.

4. **Submit button text is nearly unreadable** (line 25, `.btn-primary`, white on `--accent #ffd23f`).
   Contrast is 1.44:1 against a 4.5:1 requirement. This is the only button for the newsletter form. Fix: dark text (`#222` on `#ffd23f` is about 12:1) or a dark button fill.

5. **Plan comparison is conveyed by color only** (lines 42-43 and 101-103, `td.yes`/`td.no`).
   Cells are empty red or green blocks with no text or icon. Red-green color-blind users cannot tell yes from no (green vs red is 1.67:1), and screen readers hear nothing but empty cells. Fix: put "Included"/"Not included" (or a check/cross icon with visible or `sr-only` text) in each cell and use softer tints with dark text.

6. **Pricing facts contradict each other** (line 73 vs 121 vs 125).
   The intro says "Prices are shown per month, billed monthly", the fine print says "Annual plans are billed once a year" (no annual plan or price appears anywhere), and "All plans include a trial" vs the FAQ's "14 days" (not mentioned beside the plans). For a pricing page this erodes trust and may be a legal/billing problem. Fix: state billing period next to each price ("$19 / month"), remove or add the annual option with its price, and state the trial length once, consistently.

## High

7. **Plan cards: wrong "Most popular" badge and uneven layout** (line 78, lines 26-30).
   "Most popular tier" sits on the cheapest plan, which dilutes the signal (typically the middle plan is highlighted and nothing else is). Cards also have different paddings (20/24/28 px) and the Business card is forced to `height: 380px` (line 29) so it has about 200 px of empty space and is much taller than the other two (267/237/438 px). Fix: one padding value, remove the fixed height, use `align-items: stretch`, pin the CTA to the bottom of each card, and badge only the intended plan with a visual emphasis (border/colour), not a different size.

8. **Hover resizes cards and shifts layout** (lines 27, 30, `.plan { transition: all 0.6s }`, `.plan:hover { width: 104%; height: auto }`).
   Hovering a card changes its width and height over 0.6 s, pushing neighbours and the content below, so targets move under the pointer. Fix: remove the width/height change; if emphasis is wanted use `box-shadow` or `transform` with a short transition limited to those properties, honouring `prefers-reduced-motion`.

9. **Feature text is clipped** (line 81, `.feature-line`, 180 px wide, `nowrap`, `overflow: hidden`).
   Reads "100 reconciliations per month, one ba" and cuts off "nk connection, CSV and PDF export", which are real plan features, with no ellipsis or other cue. It also repeats the bullet above it, and only the Starter card has such a line. Fix: delete the line and merge its unique items ("1 bank connection", "CSV and PDF export") into the list, or let it wrap (`white-space: normal; width: auto`).

10. **Horizontal scroll and no mobile layout** (lines 26, 40; measured at 375 px: scrollWidth 584 vs 375).
    The compare table has `min-width: 560px` and sits in an unscrolled container, so the whole page scrolls sideways. The three plans stay in a row and shrink to 222/139/135 px, so text wraps at about 6 characters ("Shared matching rules" breaks over three lines) and "Click here" wraps in the Business card. Fix: stack cards below about 700 px (`flex-direction: column` or a media query), wrap the table in `overflow-x: auto` (with a visible cue) or restructure it for narrow widths.

11. **Newsletter form has no label and its error is poor** (lines 112-115, 44, 48).
    - The input has only a placeholder, no `<label>` (disappears on typing, not announced reliably). Border `#e6e6e6` on white is 1.25:1 (needs 3:1 for UI components, WCAG 1.4.11).
    - Errors are shown on a pristine form, in two separate paragraphs, one of which is "Error 422", an HTTP code meaningless to users. Colour is the only differentiator, they are not linked to the field (`aria-describedby`, `aria-invalid`), not announced (`role="alert"`), and they are indented differently from the heading and input (24px padding on top of the section's 24px).
    - Fix: add a visible label, a 3:1 border, show the error only after a failed submit, delete "Error 422", use one message such as "Enter an email address like name@company.com", place it directly under the input, connect it with `aria-describedby` and set `aria-invalid="true"`.

12. **Delete-workspace confirmation on a pricing page** (lines 117-120).
    A destructive confirmation dialog is rendered inline in the page flow, with no trigger, unrelated to pricing, and with generic "OK"/"Cancel" buttons. If it is a real dialog it lacks `aria-modal`, focus management and Escape handling; "OK" does not say which action it performs. Fix: remove from this page, or make it a real modal opened by a trigger, with buttons "Delete workspace" (destructive style) and "Keep workspace", initial focus on the safe one.

13. **"Compare plans" is not a control** (line 97, `<p class="compare-link" onclick=...>`).
    A paragraph styled as a link cannot be focused or activated by keyboard and is not announced as a link/button; the compare table is also placed directly beneath it so it does little. Also `scrollIntoView()` lands under the sticky header (see 15). Fix: `<a href="#compare">Compare plans</a>` with `id="compare"` on the table section; delete the empty `toggleCompare()` script (line 130) which is dead code.

14. **Low-contrast text** (lines 21, 22, 47).
    - `.lede` `#bbb` on white ("Prices are shown per month, billed monthly") is 1.92:1. It carries the billing information that matters most for a pricing page.
    - Hero lede `#dcd0ff` on the gradient is 4.04:1 at the purple end and 2.67:1 at the blue end (18 px, normal weight, so needs 4.5:1).
    - `.fineprint` `#777` at 11 px is 4.48:1 and the text is too small to read comfortably; it holds the tax/renewal terms.
    - Fix: lede `#555` or darker on white; hero lede white or a darker gradient end; fine print `#595959` at 13-14 px minimum.

## Medium

15. **Sticky header is 140 px tall and covers anchor targets** (line 11, `height: 140px; position: sticky`).
    On a 667 px phone viewport that is 21% of the screen permanently. In-page links "Pricing" (`#plans`) and "FAQ" (`#faq`) scroll the heading beneath the header. Fix: about 56-64 px height, and `scroll-margin-top` on `#plans`, `#faq` and the compare target.

16. **Auto-scrolling ticker with no pause** (lines 16-18, 67, 8 s infinite).
    Moving text that starts automatically and lasts more than 5 s needs a pause/stop control (WCAG 2.2.2); it is also a distraction right above the headline, cannot be read in full (it moves left out of view; at 375 px only "Reconcile" shows), is not useful to the buyer, and does not respect `prefers-reduced-motion`. Fix: remove it, or make it static; if kept, add a pause button and a reduced-motion override.

17. **Banner close button has no accessible name** (line 66, `.banner-close`).
    It contains only an SVG, so it is announced as just "button". It is 28x28 px, small for touch. Fix: `aria-label="Dismiss announcement"`, `aria-hidden="true"` on the svg, and a hit area of at least 40-44 px; make it actually dismiss (no handler exists).

18. **Tab order is overridden** (line 63, `<a href="#faq" tabindex="3">`).
    A positive tabindex jumps FAQ ahead of every natural tab stop (Pricing, Sign in, close button, ...), so keyboard order no longer follows the visual order. Fix: remove `tabindex`.

19. **Inconsistent, decorative font stack** (lines 9, 14, 16, 20, 31, 33, 53).
    Georgia body, Arial header/buttons/footer, Impact headings and h1, Comic Sans banner, Courier New ticker and prices. On a finance product this undermines credibility, and prices in a monospace face look like code. Impact/Comic Sans are also not available on all platforms (here Impact fell back to a generic bold sans). Fix: one or two families (a sans for UI, optionally one for headings) with a defined scale; headings in 600-700 weight.

20. **Heading structure is broken** (lines 69, 77, 85, 91, 107, 111, 123).
    h1, then plan names as `h4` with no h2/h3 above them, then h2 "Why teams choose Ledgerly", h3 "Get pricing updates", h2 "Questions". Screen-reader heading navigation sees a skipped hierarchy and plans are not under a section heading. Also the h1 "Pick the perfect Package" is unnecessarily capitalised and generic. Fix: add an h2 "Plans" (visually hidden if needed) and make plan names h3.

21. **Body paragraph is hard to read** (lines 45-46, `.about { max-width: none }`, `p { line-height: 1 }`).
    At 1280 px the paragraph runs about 170 characters per line with line-height 1, so lines nearly touch, and it is one 90-word sentence. Fix: `max-width: 65ch; line-height: 1.5`, split into two or three short sentences.

22. **Compare table is thin and badly structured** (lines 99-104, 40-41).
    Only three rows (all of them already in the cards) and none of the numeric differences (seats, reconciliations, support). No `<caption>`, header cells lack `scope`, no price row, it does not fill the width (560 px vs 1232 px container) and is not aligned with the card columns. Fix: add seats/reconciliations/support/exports rows, `scope="col"/"row"` and a caption, make it full-width.

23. **Plan feature lists are very small** (lines 35, 36, `li { font-size: 12px }`).
    12 px body-level content in the main decision area is hard to read; the prices are 32 px so the hierarchy is inverted (price huge, what you get tiny). Fix: 14-16 px list text.

## Low

24. **Small targets in the footer** (line 55; links measure 33-43 x 14 px, 6 px apart, 12 px text).
    Hard to tap and read. Fix: 14 px text, padding to reach at least 24x24 (ideally 44 px tall) hit areas.

25. **Images lack alt text** (lines 61, 71).
    The logo `<img>` has no `alt` (should be "Ledgerly", linked to the home page) and the hero image has none either (use `alt=""` if decorative). The hero image is an empty translucent rectangle that adds height (180 px) but no content; replace with a real product screenshot or remove it.

26. **Emoji used as feature icons** (line 74).
    Not wrapped in a list, emojis are read aloud ("rocket", "locked"), they wrap awkwardly at narrow widths ("Clear reports" falls to a new line at 375 px) and the baseline differs from the text. Fix: mark decorative icons `aria-hidden="true"`, use a `<ul>` with flex-wrap and consistent icons.

27. **Banner spacing and Submit/input alignment** (lines 66, 110-113).
    The Submit button is 42 px high vs 34 px for the input, and `.error` paragraphs carry an extra 24 px indent (section already padded 24 px), so the form is not on one left edge. Fix: same height for both controls and drop the doubled padding.

28. **Badge and tag styling** (line 32).
    The "Most popular tier" badge at 12 px with `#eef` on white is low emphasis; the phrase "tier" is redundant. If kept, use "Most popular" on the intended plan with a stronger treatment.

## Checked and fine
- `lang="en"` and `<title>` are present; `.error` red `#cf222e` on white is 5.36:1; white on purple `.choose` button (`#7b2ff7`) has sufficient contrast (about 6:1); the FAQ uses native `<details>`, which is keyboard-operable.
