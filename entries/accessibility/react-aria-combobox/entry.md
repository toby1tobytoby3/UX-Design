---
title: Filterable combobox where focus stays in the input and the active option is announced
pattern: accessibility
page_type: docs
tags: [accessible, keyboard, open-source, minimal]
source_url: https://react-spectrum.adobe.com/react-aria/ComboBox.html
source_site: react-spectrum.adobe.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: Typing filters the list and arrow keys move a highlighted option while real DOM focus never leaves the text input (aria-activedescendant), so the user can keep typing, screen readers announce each option, and the focus ring and highlight are distinct.
use_when: Any select with more than about 10 options or where users know what they're looking for: assignees, countries, tags, projects.
has_example: false
---

## What it is
The React Aria ComboBox docs demo ("Favorite Animal"). We tabbed to the input, typed "a" and pressed ArrowDown twice: the popover lists
the five matching animals (Aardvark, Cat, Kangaroo, Panda, Snake: a contains-match, not prefix) with "Cat" highlighted.

## Key techniques
Read from the live DOM:
- The input has `role="combobox"`, `aria-expanded="true"` when open and `aria-activedescendant` pointing at the highlighted option;
  `document.activeElement` stayed on the `<input>` throughout.
- The highlighted option carries `data-focused` and `data-focus-visible` (plus `aria-selected="false"` until chosen), so Tailwind can style it with
  `data-[focused]:bg-…` without JavaScript state.
- Focus ring on the input: `outline: 2px solid oklch(0.519 0.250 284.23)` with `outline-offset: -1px` (inset). That indigo is 6.2:1 against white (computed).
- The highlighted option is a filled pill (indigo background, white text), different from the input's ring, so "where focus is" and "which option" don't get confused.
- The demo panel offers Vanilla CSS / Tailwind variants and a theme switcher: the component is unstyled, the styles are yours.

## Accessibility
This is the reference behaviour from the WAI-ARIA APG combobox pattern. Per React Aria's docs (see `research/A7-accessibility.md`), it also
announces the number of options and selection on VoiceOver, and works with touch screen readers.

## Weaknesses
- We didn't test the multiple-selection mode or async loading here.
- Rounded pill highlight inside a tight popover can clip long labels; check truncation.

## Related entries
- `accessibility/govuk-two-tone-focus`: a louder focus style for links
- Source: `sources/react-aria` (benchmark of headless primitives, if present)

> Captured live on 2026-10-17 with a Playwright script (focus combobox, type "a", ArrowDown ×2). Attributes and outline read from the DOM.
