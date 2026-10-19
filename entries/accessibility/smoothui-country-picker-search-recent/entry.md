---
title: Country picker in a modal with search by name, code or dial code, recent picks first, and correct focus handling
pattern: accessibility
page_type: docs
tags: [minimal, keyboard, accessible, open-source, animated]
source_url: https://smoothui.dev/docs/components/country-picker
source_site: smoothui.dev
captured_at: 2026-10-19
captured_by: toby
input: url
rating: 5
why_it_works: It gets every part of the keyboard model right (focus moves into the picker, stays there, and returns to the trigger on Escape) while making a long list fast to use with search across three fields and a Recent group.
use_when: Any long single-choice list (countries, currencies, time zones, accounts) where a native select is too plain and a custom one usually breaks keyboard use.
has_example: false
---

## What it is
Smooth UI's Country Picker (MIT). The trigger shows the current choice (🇫🇷 France +33). Pressing it opens a modal with a
search field ("Search by name, code or dial code…"), a **Recent** group (France ✓, United States, Japan), then groups by region
(Americas…), each row with flag, name and dial code.

## Key techniques
- **Search across name, ISO code and dial code**, which is how people actually look ("+44", "GB", "United").
- **Recent first**, with the current choice ticked.
- **Grouped by region** with sticky group labels for scanning.
- The trigger shows flag, name and dial code, so the choice is clear without opening it.

## Accessibility
Measured with Playwright: the trigger has `aria-haspopup="dialog"` and `aria-expanded`; Enter opens a `role="dialog"` with
`aria-modal="true"`; **focus moves to the search box** (`role="combobox"`) with a `listbox` of options; four Tabs keep focus
inside; **Escape closes it and returns focus to the trigger**. The component's source checks `prefers-reduced-motion`, and it
ships with tests. In the kit as a whole, 191 of 229 components handle reduced motion, by far the most of the kits checked.

## Weaknesses
- Flags as emoji render differently per OS (Windows shows letters); keep the ISO code visible.
- A modal is heavy for a phone-number field on mobile; a full-screen sheet is the usual phone pattern.

> Captured live on 19 Oct 2026 with Playwright (screenshots plus keyboard probes). Supplied as an Instagram reel screenshot; the live site replaced it.
