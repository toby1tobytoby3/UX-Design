---
title: Ghost text with a cycling toolbar, and next-edit suggestions in the gutter
pattern: ai-assist
page_type: docs
tags: [ghost-text, keyboard, devtools, dark]
source_url: https://code.visualstudio.com/docs/copilot/ai-powered-suggestions
source_site: code.visualstudio.com
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 5
why_it_works: The mature keyboard model for inline AI, in one place. Tab accepts, partial accept goes word by word, alternatives cycle in a small hover toolbar that shows its own shortcuts, and suggestions away from the caret are flagged in the gutter instead of being forced into the text.
use_when: Designing the keyboard model and discoverability for any ghost-text feature, especially for power users.
has_example: false
---

## What it is
The VS Code documentation for GitHub Copilot inline suggestions. The two crops are Microsoft's own product
screenshots on that public page (captured live from the page, not by us running Copilot):
- `crop-hover-toolbar.jpg`: dimmed italic ghost text with a hover toolbar: **‹ 1/3 ›** to cycle alternatives,
  **Accept (Tab)**, **Accept Word (Ctrl + RightArrow)**, and an overflow menu.
- `crop-nes-gutter.jpg`: a **Next Edit Suggestion**: a gutter marker on line 21 opens "Copilot Next Edit Suggestion"
  with **Go To / Accept (Tab)**, **Reject (Escape)**, Show Collapsed, Settings. The proposed change is drawn inline.

## Key techniques
- Shortcuts are printed inside the UI (key caps in the toolbar and menu), which teaches the model without docs.
- Partial accept: ⌘→ / Ctrl+→ accepts the next word or line.
- Alternatives are numbered ("1/3") so the user knows there are more without asking.
- Suggestions away from the caret are announced by a gutter marker, not by moving the cursor.
- Restraint (from the page text): a **Snooze** button in the status-bar menu pauses suggestions for five minutes at a time,
  inline suggestions can be turned off on metered connections, and `editor.inlineSuggest.minShowDelay` sets a show delay
  (default 0 ms).

## Accessibility
- The page doesn't show the screen-reader path here; VS Code documents an Accessible View for suggestions
  (`research/E6-inline-ai.md`). Ghost text is dimmed and italic, i.e. low contrast by design, the same trade-off as Plate.

## Weaknesses
- Code-editor context: dense prose UIs need a lighter version (no gutter).
- Screenshots on a docs page can lag the shipping product.

## Related entries
- `ai-assist/plate-copilot-ghost-text` (the same model in a rich-text editor)
