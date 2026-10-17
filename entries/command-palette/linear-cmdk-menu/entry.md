---
title: Cmd+K command menu with grouped actions and shortcuts
pattern: command-palette
page_type: app
tags: [saas, devtools, keyboard, dark, progressive-disclosure]
source_url: https://linear.app
source_site: linear.app
captured_at: 2026-10-17
captured_by: base-pack
input: base-pack
rating: 5
why_it_works: Every action in the app becomes reachable from one shortcut; showing each action's own shortcut beside it teaches power-user keys without any tutorial.
use_when: Apps with many actions or objects where users repeat tasks — dashboards, editors, admin tools.
has_example: false
needs_capture: true
---

## What it is
Centred modal (~640px) over a dimmed app. Large search input at the top, results grouped under
small uppercase headings (e.g. Issues, Navigation, Actions), each row with icon, label and right-aligned
keyboard shortcut chips. Context-aware: actions for the selected item appear first.

## Key techniques
- Opens on Cmd/Ctrl+K, closes on Esc; arrow keys move a highlighted row; Enter runs it.
- Fuzzy matching with highlighted matched characters.
- Sub-pages: choosing "Change status…" swaps the list in place with a breadcrumb chip in the input.
- Fast motion: ~120ms scale-from-98% + fade.

## Accessibility
Use the ARIA combobox + listbox pattern (`aria-activedescendant`), trap focus, return focus on close.
Shortcut chips need `aria-hidden` or readable labels.

## Weaknesses
Undiscoverable without a visible hint — pair it with a "⌘K" affordance in the UI.

> Base-pack entry written from knowledge of the product; re-capture with **ux-add** to attach real screenshots.
