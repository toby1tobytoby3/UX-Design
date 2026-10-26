# RUN.md (baseline control, no review skill)

Steps followed:
1. Read briefs/review.md and fixtures/seeded-pricing.html in full (source review).
2. Rendered the page in Chromium via Playwright at 1280, 390 and 320 px wide, with full-page screenshots (shot-1280.png, shot-390.png, shot-320.png, shot-hover.png in this folder).
3. Measured in the rendered page:
   - Document scroll width against viewport (584 against 390 and 320, horizontal overflow).
   - Plan card sizes and positions (heights 267/237/438 at 1280).
   - Feature-line clipping (scrollWidth 357 against clientWidth 180).
   - Sticky header size and where anchor targets land (#plans card at y=32, compare table at y=5, both under the 140 px header).
   - Tab order and computed outline on each focusable element (all `none` except summary; FAQ link before Pricing).
   - Hover behaviour on the Business card (height 438 to 266).
   - Image alt attributes (both empty/missing).
4. Computed WCAG contrast ratios from CSS colours (lede 1.92, white on yellow 1.44, hero lede 4.04 and 2.67, fine print 4.48, input border 1.25, yes/no cells 1.67).

Skipped or not done:
- No review skill was used. No axe or other automated accessibility scanner was run.
- Did not test with a screen reader, did not test dark mode or print, and did not test RTL or long translated strings.
- Did not test click behaviour of the banner close button beyond reading the source (no handler is attached).
