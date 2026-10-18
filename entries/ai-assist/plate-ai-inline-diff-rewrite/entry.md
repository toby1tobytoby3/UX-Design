---
title: Selection rewrite shown as an inline diff with Accept, Discard, Insert below and Try again
pattern: ai-assist
page_type: docs
tags: [inline-diff, rewrite, open-source, keyboard, streaming]
source_url: https://platejs.org/docs/ai
source_site: platejs.org
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 5
why_it_works: The original stays visible (struck in red) next to the AI's version (green) while it streams, so the user judges the change in place and nothing is replaced until they press Accept.
use_when: Rewriting a sentence or paragraph the user already wrote (improve, shorten, fix grammar, change tone) in a rich-text editor.
has_example: false
---

## What it is
Plate's AI menu (`@platejs/ai`, MIT, built on the AI SDK). Select text and press **⌘J / Ctrl+J** (or "Ask AI" in the
floating toolbar, right-click, or space in an empty block). A command menu opens with "Ask AI anything…" and presets
(Improve writing, Comment, Emojify, Make longer, Make shorter, Fix spelling & grammar, Simplify language). The rewrite
streams in as a suggestion: deletions red, insertions green. When it finishes the menu offers **Accept · Discard ·
Insert below · Try again**. While streaming a pill reads **"Writing… Stop Esc"** (found in the DOM; it renders just
below the fold in this capture). The demo's model route is mocked, so the inserted words are Latin filler.

## Key techniques
- The diff is written into the document as suggestion marks (`slate-suggestion`), not an overlay, so it survives scroll
  and reflow: red `text-red-700` on `bg-red-100` (**5.3:1**), green `text-emerald-700` on `bg-emerald-100` (**4.7:1**).
- One menu for both stages: the same `cmdk` list holds the prompts before and the decisions after, so the keyboard
  model (arrows + Enter) never changes.
- **Insert below** keeps the original and adds the AI version underneath, a useful fourth option between accept and discard.
- A "1" edit badge in the margin marks the block that has a pending suggestion.

## Accessibility
- **Gap:** insertions and deletions differ only by colour (`text-decoration: none` on both), which fails WCAG 1.4.1;
  add strikethrough to deletions and underline to insertions.
- No ARIA on the suggestion marks; one `aria-live="polite"` region exists on the page but stayed empty during the run.
- "Ask AI anything…" is a placeholder with no `aria-label`.

## Weaknesses
- The UI ships through the shadcn registry, so in our stack we'd rebuild the menu with our own primitives.
- The diff is word-level; for long rewrites it becomes a wall of red and green, where a side-by-side or "show changes" toggle reads better.

## Related entries
- `ai-assist/plate-copilot-ghost-text` (same editor, ghost text)
- `ai-assist/tiptap-selection-ai-refine-apply` (same job without a visible diff)
- `ai-review/pierre-diffs-keep-undo-hunks` (code-hunk version of accept/reject)
