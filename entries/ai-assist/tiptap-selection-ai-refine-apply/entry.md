---
title: Selection AI menu whose result can be refined in words before Apply
pattern: ai-assist
page_type: app
tags: [rewrite, refine, notion-like, interactive]
source_url: https://template.tiptap.dev/preview/templates/notion-like
source_site: template.tiptap.dev
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 4
why_it_works: After the AI rewrites the selection, a "Tell AI what else needs to be changed…" field lets the user steer the result in plain words, so a near-miss is fixed by refining rather than starting over.
use_when: Editors where users rewrite their own text and often want a second, more specific pass (tone, length, wording).
has_example: false
---

## What it is
Tiptap's Notion-like template, live with a real model (no login needed today). Selecting text shows a floating toolbar
whose first button is **Improve** (purple sparkle). Its menu: Adjust tone ›, Fix spelling & grammar, Extend text,
Reduce text, Simplify text, Emojify, then Ask AI, Complete sentence, Summarize, Translate ›. After "Fix spelling &
grammar" the changed text is highlighted in place (purple) with a prompt field "Tell AI what else needs to be
changed…" and **Try again · Discard · Apply** (Apply is the primary, filled button).

**Reference only, not a source:** Tiptap's AI features need a paid Tiptap subscription, which we exclude as a
dependency. Copy the interaction, not the code.

## Key techniques
- The AI entry point is the first item of the existing selection toolbar, labelled with a verb ("Improve"), not a
  separate AI button somewhere else.
- Presets are grouped: edits of the selection first, then generation (Ask AI, Complete, Summarize, Translate).
- Refine-in-words field plus Try again: two kinds of retry, steered and unsteered.
- Apply is visually primary; Discard is secondary; Try again sits on the left away from the commit action.

## Accessibility
- Toolbar buttons have `aria-label`s ("Improve", "Bold"…), and the menu is keyboard reachable.
- Not checked: whether the result or the error is announced to screen readers.

## Weaknesses
- **No visible before/after**: the new text replaces the selection and is only tinted, so the user can't see what
  changed without discarding. Prefer an inline diff (see `ai-assist/plate-ai-inline-diff-rewrite`) or a "Show changes" toggle.
- A real model behind a public demo means results vary and may be rate-limited.

## Related entries
- `ai-assist/plate-ai-inline-diff-rewrite`
- `ai-assist/blocknote-ai-menu-failure-retry`
