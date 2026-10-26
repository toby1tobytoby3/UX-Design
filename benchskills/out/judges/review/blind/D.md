# Report: Ledgerly pricing page (`fixtures/seeded-pricing.html`)

I rendered the page at 1280px and 375px and measured computed styles, contrast, tab order and overflow. Line numbers are fixture lines, and rule IDs in brackets are the skill's.

## Critical
1. **Focus rings removed (L10).** `a:focus, button:focus, input:focus {outline:none}` has no replacement. Measured `outline-style: none` on every link, button and the input. Only the `<summary>` elements still show a ring. Keyboard users can't see where they are. Fix: delete the rule or use `:focus-visible` with a 3px ring at 3:1 contrast. [focus-states]
2. **Zoom disabled (L5).** `maximum-scale=1, user-scalable=no`. Fix: `width=device-width, initial-scale=1`. [viewport-meta]
3. **"Compare plans" is a `<p onclick>` (L97).** Measured `tabIndex` -1 and no role, so keyboard and screen-reader users can't reach it. `toggleCompare()` (L130) is an empty stub. Fix: use `<a href="#compare">` with an id on `.compare`, or a `<button>`. [keyboard-nav]
4. **All three plan CTAs read "Click here" (L82, 88, 94).** They are indistinguishable in a screen-reader button list and say nothing about the action. They are 13.3px type at 87x35px. Fix: "Choose Starter" and so on, 16px, at least 44px tall. [aria-labels, touch-target-size]
5. **Comparison table uses colour only (L42-43, 101-103).** The cells are empty red and green blocks with no text or icon. Colour-blind and screen-reader users get nothing. Fix: add "Included" / "Not included" text or icons with hidden text, and avoid red/green as the only cue. [color-not-only]
6. **375px layout breaks.** `scrollWidth` is 584 against 375.
   - `.compare table {min-width:560px}` (L40) forces page-wide horizontal scroll.
   - `.plans` (L26) is a no-wrap flex row, so the cards shrink to 222, 139 and 135px. Their content spills past the card borders (right edge 522px against cards ending at 401 and 551).
   - Fix: wrap or stack the cards below about 720px, and put the table in an `overflow-x:auto` wrapper. [horizontal-scroll, mobile-first]
7. **Newsletter form (L110-116).**
   - Placeholder-only input with no `<label>`.
   - There is no `<form>` element, so Enter does nothing.
   - Static errors show on load: a raw "Error 422" plus a redundant "invalid email address".
   - The errors have no `aria-describedby`, `role="alert"` or `aria-invalid`, and give no recovery hint.
   - Fix: add a form, a label, one inline error under the field with a recovery hint, and `role="alert"` only after a failed submit. [input-labels, error-placement, error-clarity]
8. **Delete-workspace dialog (L117-120).**
   - Buttons are a generic "OK" / "Cancel", with no danger styling and OK first.
   - `role=dialog` is inline and not modal, with no focus management or Escape handling.
   - A workspace-deletion prompt makes no sense on a pricing page.
   - Fix: label the buttons "Delete workspace" and "Keep workspace", make Cancel the default, manage focus, or remove it. [confirmation-dialogs, destructive-emphasis]

## High
9. **Contrast failures (measured).**
   - `.lede` #bbb on white (L21, 73) is 1.92:1. It is the line that states "billed monthly".
   - `.hero .lede` on the violet gradient (L22) is 4.04:1 at 18px.
   - `.btn-primary` white on #ffd23f (L25, "Submit") is 1.44:1.
   - `.fineprint` #777 at 11px (L47) is 4.48:1.
   - Input border #e6e6e6 (L44) is about 1.3:1 against white, against a 3:1 target.
   - Fix: darker text colours and dark ink on yellow. [color-contrast]
10. **Sticky header is 140px tall (L11).** That is 20% of a 700px viewport. `#plans` scrolls to y=0 under it (no `scroll-margin-top`), and tabbed focus can be hidden behind it. Fix: a 56-64px header plus `scroll-padding-top`. [fixed-element-offset, focus-not-obscured]
11. **Ticker marquee (L16-18, 67).** It runs `scroll 8s linear infinite` with `padding-left:100%`, so the strip is blank for part of each cycle and the span is 2147px wide. There is no pause control. Reduced motion is ignored (verified: animation is still `scroll`). It carries real content. Fix: static text or a pause button, and wrap the animation in `prefers-reduced-motion: no-preference`. [auto-rotation-controls, reduced-motion]
12. **Tiny text.** `.plan li` is 12px (L35), `.feature-line` 12px, `.fineprint` 11px, footer links 12px, badge 12px. The feature lists are the smallest text on the page. Fix: 14-16px for lists and 12-13px as the floor for fine print. [readable-font-size]
13. **Plan cards uneven and jumpy (L26-30).**
    - Paddings are 20, 24 and 28px, and heights are 267, 237 and 438px.
    - Business has `height:380px`, which leaves about 170px of dead space.
    - `transition: all 0.6s` plus `:hover {width:104%; height:auto}`: hovering Business drops its height from 438 to 266px (measured) and reflows the page. The width change is ignored by `flex:1`.
    - Fix: equal padding, `align-items: stretch`, no fixed height, a transform or shadow hover at 150-200ms. [transform-performance, layout-shift-avoid]
14. **`.feature-line` clipped (L36, 81).** It is `width:180px; overflow:hidden; nowrap`, with scrollWidth 357 against clientWidth 180. It shows "100 reconciliations per month, one ba" with no ellipsis, so "one bank connection, CSV and PDF export" is unreachable. Fix: let it wrap or merge it into the `<ul>`. [truncation-strategy]
15. **Heading levels skip.** The plan names are `<h4>` straight after `<h1>` (L77, 85, 91), then `<h2>` and `<h3>` appear later. Fix: use h3 under an h2 "Plans". [heading-hierarchy]
16. **No landmarks or skip link.** There is no `<nav>` or `<main>`, and the 140px header, banner and ticker come before content. [skip-links]
17. **Tab order (L63).** `tabindex="3"` on FAQ. Measured tab sequence is FAQ, Pricing, Sign in. Fix: remove the tabindex. [keyboard-nav]
18. **Banner close button (L66).** It has an SVG only, with no `aria-label`, a 28x28px target and a 1px #ccc border. It also does nothing. Fix: add `aria-label="Dismiss announcement"`, `aria-hidden` on the SVG and a 44px hit area. [aria-labels]

## Medium
19. **Emoji icons (L74).** Rocket, lock and chart emoji are not hidden from assistive tech and render differently per OS. Spacing is uneven. Fix: SVG icons with `aria-hidden="true"`. [no-emoji-icons]
20. **About paragraph (L45-46, 108).** `max-width:none` gives a 1232px measure of about 190 characters per line, with `line-height:1`. Fix: `max-width: 65ch` and `line-height: 1.5-1.7`. [line-height, line-length]
21. **Small targets.** Footer links are about 14px tall with 6px gaps (below the 24px WCAG 2.2 minimum), OK/Cancel are 31px tall, FAQ summaries are 18px, and the close button is 28px. Fix: pad each to at least 44px tall with 8px or more of gap. [web-target-size]
22. **Competing button styles.** Yellow `.btn-primary` and purple `.choose` have the same weight, and no plan is clearly recommended. "Most popular tier" sits on the cheapest tier (Starter). Its badge pushes the Starter price lower (y about 811 against 794 and 797), so prices don't align. [primary-action]
23. **Price units missing.** Prices show $19, $59 and $149 with no "/month". The only statement is the faint line at L73. The fine print (L121) mentions annual billing that no price shows. Fix: "$19 / month" in each card and one consistent trial claim. [consistency]
24. **Five unrelated font stacks.** Georgia, Arial, Comic Sans (banner, L14), Courier (ticker and prices, L16, 33) and Impact (headings, L20, 31, 53). Impact falls back unpredictably, and Comic Sans undermines trust in a finance product. Fix: one or two families, with tabular figures for prices. [font-pairing]
25. **Raw hex instead of tokens.** `:root` tokens exist but components use raw hex. `--accent` is paired with white text it can't support. [color-semantic, color-accessible-pairs]
26. **Images without alt (L61, 71).** Neither the logo nor the hero image has `alt`. The logo isn't a link home, and the empty 320x180 hero placeholder adds scroll. Fix: `alt=""` for decorative images, `alt="Ledgerly"` plus a link for the logo. [alt-text]
27. **Hero pushes plans down.** Banner, ticker and hero take about 410px at 1280px, so the plans start about 730px down. Fix: shorten the hero. [content-priority]

## Low
28. **Navigation has no current state.** The links at L62-64 and the footer links are `href="#"` placeholders. [nav-state-active]
29. **Table structure.** It has no `<caption>` or `scope` on `<th>`, and it compares only 3 features, so it doesn't match the cards. [data-table]

**Checked and fine:** `lang` and `<title>` are present, base text is 16px, error red is 5.36:1, and footer link blue is 4.88:1.
