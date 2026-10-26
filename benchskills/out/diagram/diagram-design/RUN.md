# RUN: Diagram Design skill (diagram-design v2.6)

Output: `diagram.html` (one self-contained file; Google Fonts link plus inline CSS and two inline SVGs).

## Skill steps followed
1. Read the brief and all of `SKILL.md`.
2. Section 0 style-guide gate. No `.diagram-design` marker applies (the output folder is the only place I may write) and the style guide is still the shipped default, so the gate fires. I answered the question myself from the brief: **(e) keep the default style**. No marker or profile was written. Font source stays `web`.
3. Section 3 selection. Checked the semantic-pattern table: none matches. "Unstructured input to structured artifact" is about a dialogue turned into fields, which this is not. So I chose the visual type directly: **Swimlane**. Lanes are Person, ux-add, Library and ux-find, and the flow runs left to right in time. Loaded `type-swimlane.md`, `primitives-core.md`, `layout-budget.md`, `style-guide.md`, `output-spec.md`, `profiles.md`, `type-architecture.md` (elbow and crossing grammar), `primitive-annotation.md`, plus `type-data-flow.md` (header only) and the shipped `example-swimlane-full.html` as a pattern.
4. Plan, stated before drawing (nobody to confirm with, so these are assumptions): swimlane, no pattern, size `fit` (viewBox 1200x788, because the template frame is 1200 wide), detail balanced, audience mixed, light variant on the shipped skin. Budget: 9 nodes, 9 arrows, 2 coral elements (the `npm run catalog` node and the dashed catalog arrow), 2 neutral callouts. Cut: the four layers became a callout and a card, because four more boxes would break the 9-node budget. The duplicate check inside ux-add and the Playwright detail live in node text and the card, not in extra nodes.
5. Built from the `template.html` skeleton: tokens, three-font stack, accessible SVG (`role="img"`, `aria-labelledby`, title first child, prefixed ids), arrows before nodes, opaque paper masks, masked arrow labels with an 8px gap, r=8 elbows, horizontal legend strip, wide SVG with `min-width` equal to its viewBox width inside an `overflow-x:auto` wrapper, `@media print` release.
6. Ran `python3 scripts/self_check.py diagram.html`: **OK**.
7. Summary cards with varied widths (1.15fr / 1fr / 0.85fr), no shadows. They double as the visible text alternative ("the same flow in words").

## Skipped or unavailable
- `scripts/verify-geometry.py` and the render linter are repo scripts, not in the skill folder, and I may not read the repo. Instead I ran my own Playwright check at 1280 and 390 px. It checks that no text overflows its box (6px side padding), that no label mask overlaps a node, and that the page has no horizontal overflow. It reported nothing.
- No PNG/SVG export (not requested).
- Not run: the onboarding flows, import flows, motion.

## Deviations I chose
- **Second, narrow SVG.** The skill's answer for phones is a wide SVG that scrolls. The brief wants it to read at 390 px, and a 1200px canvas shows about a third of itself there. So below 760px the wide SVG is hidden and a single-column version of the same swimlane shows: lane tags on each card, a left rail for the catalog link, and a right rail for the answer. Between 761 and 1200px the wide SVG scrolls inside its wrapper as the skill specifies. The narrow SVG has its own ids and markers.
- `optional` node stroke is ink at 0.35 (skill says 0.20) so the dashed box does not look like a rendering fault.
- Node width 124 (a multiple of 4, but not in the skill's width list). Chosen so seven columns fit 1200px.
- The second callout (four layers) has no dashed leader; it sits beside the Library lane label.
- Wide node text is block-centred vertically in short nodes, and narrow cards use fuller wording than the wide nodes. Same facts either way.

## Changes after viewing
- First render: the two-line nodes (Gives a URL, Asks ux-find, Publishes) had a half-empty bottom, so I centred the text block vertically in nodes with fewer than four lines.
- Removed the extra gap between header and diagram (header margin 0) and trimmed the top padding of the narrow SVG.
- Text fit, label masks and overflow were already clean on the first check, so no box or label was resized.
- Fonts (Geist, Geist Mono, Instrument Serif) did load through the proxy, so the screenshots reflect the real faces.
