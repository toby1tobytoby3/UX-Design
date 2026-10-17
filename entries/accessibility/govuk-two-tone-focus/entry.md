---
title: Two-tone focus indicator (yellow fill, thick black underline) that survives any background
pattern: accessibility
page_type: docs
tags: [accessible, keyboard, minimal]
source_url: https://design-system.service.gov.uk/get-started/focus-states/
source_site: design-system.service.gov.uk
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: The focused link gets a yellow background and a 4px black bar under it, so one of the two colours always contrasts with whatever is behind it; a transparent outline is kept underneath so the indicator still appears in Windows forced-colours mode, where backgrounds and box-shadows are stripped.
use_when: Defining the focus-visible style for links, buttons and inputs in any product, especially one with both light and dark or coloured surfaces.
has_example: false
---

## What it is
GOV.UK Design System's "Understanding focus state styles" page, captured by tabbing through it. Every focused link gets the same
treatment: yellow highlight behind the text, black bar along the bottom edge, black text. The page explains why: yellow contrasts
with dark backgrounds and the black bar with light ones, meeting WCAG 2.2 1.4.11 (non-text contrast) on any background GOV.UK uses.

## Key techniques
Computed styles on a focused link (identical for all 14 tab stops we recorded, including footer links):
- `background-color: rgb(255,221,0)` (#ffdd00) and `color: rgb(11,12,12)`.
- `box-shadow: 0 -2px 0 #ffdd00, 0 4px 0 #0b0c0c`: the yellow extends 2px above the text and a **4px black bar** sits below it.
- `outline: 3px solid transparent; outline-offset: 1px`: invisible normally, but **forced-colours mode replaces it with a system colour**.
  Our forced-colours capture (`crop-forced-colors.jpg`) shows exactly that: the yellow and the bar are gone, and a 3px outline box appears.
- Contrast we computed: black text on the yellow 14.6:1; black bar against white 19.6:1. The yellow against white is only 1.35:1, which is why the bar is needed.
- `:focus-visible` behaviour: the focus style is applied on keyboard focus; text colour switches to black on focus so links stay readable on yellow.

## Accessibility
This is the accessibility reference. It meets 2.4.7 (focus visible) and 1.4.11, and is designed with 2.4.13 (focus appearance, AAA) area in mind.
For components rather than links, GOV.UK uses the same yellow + black as an outline/box-shadow ring (per `research/A7-accessibility.md`).

## Weaknesses
- Very loud: ideal for public services, but a product UI may prefer a 2px ring at 2px offset (the research default) as long as it keeps 3:1 against adjacent colours.
- Yellow fill on large focused areas (cards) is heavy; use the outline form there.
- Don't copy the transparent-outline trick without also testing forced colours yourself; ring-only styles (box-shadow, Tailwind `ring-*`) disappear there.

## Related entries
- `accessibility/govuk-error-summary`: the same focus style on error links
- `accessibility/react-aria-combobox`: focus ring and active option in a composite widget

> Captured live on 2026-10-17 with a Playwright script: focus `main`, press Tab 14 times, record computed styles; second run with
> `forcedColors: 'active'`. Contrast ratios computed from the computed colours.
