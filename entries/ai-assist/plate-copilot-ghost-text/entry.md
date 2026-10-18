---
title: Ghost-text completion after the caret, accepted with Tab
pattern: ai-assist
page_type: docs
tags: [ghost-text, keyboard, open-source, minimal, interactive]
source_url: https://platejs.org/docs/copilot
source_site: platejs.org
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 4
why_it_works: The suggestion appears inline at the caret in dimmed text and becomes real text with one key, so writing never leaves the flow and nothing changes until you accept.
use_when: Rich-text or long-form fields where a continuation is likely useful (notes, descriptions, replies) and the user is typing at the end of a block.
has_example: false
---

## What it is
Plate's Copilot plugin (`@platejs/ai`, MIT) shown on its docs page. After typing at the end of a paragraph, a grey
continuation appears directly after the caret. **Tab** accepts it all, **⌘→ / Ctrl+→** accepts word by word, **Esc**
dismisses, **Ctrl+Space** asks again. The page's API route returns 404 in this demo, so the suggestion is mocked Latin
filler text: the behaviour is real, the words aren't. `crop-ghost.jpg` is before Tab, `crop-after-tab.jpg` after.

## Key techniques
- Ghost text is a separate non-editable span after the caret: `<span contenteditable="false" class="pointer-events-none text-muted-foreground/70">`,
  so clicks and selection pass through to the real text.
- Colour `oklab(0.556 0 0 / 0.7)` on white, about **2.7:1**. That's deliberately low (it must read as "not yet yours"),
  but it's under the 4.5:1 text minimum, so it can't carry anything the user must read to decide.
- Triggered after typing at the end of a block (debounced; the research found 250–400 ms in comparable tools) and on
  demand with Ctrl+Space. On accept the span is replaced by plain text with the same formatting as its neighbours.
- `max-sm:hidden`: ghost text is switched off on small screens, where Tab isn't available.

## Accessibility
- **Gap:** the ghost span has no `aria-hidden` and there is no live-region announcement, so a screen reader may read the
  suggestion as if it were document text, or not mention it at all. Our default: `aria-hidden="true"` on the ghost plus
  one polite announcement ("Suggestion available, Tab to accept").
- Tab is only intercepted while a suggestion is showing; otherwise it keeps its normal meaning (good).
- No sign of IME handling in the demo (couldn't be tested headless); suggestions should never appear mid-composition.

## Weaknesses
- The page's "Plus" badge refers to Plate's paid templates; the plugin itself is MIT (see `research/E6-inline-ai.md`).
- No visible hint that Tab will accept (the docs list the keys, but the editor itself shows none).

## Related entries
- `ai-assist/plate-ai-inline-diff-rewrite` (same editor, rewrite flow)
- `ai-assist/vscode-copilot-ghost-text-nes` (the same keyboard model in a code editor, with a hover toolbar)
