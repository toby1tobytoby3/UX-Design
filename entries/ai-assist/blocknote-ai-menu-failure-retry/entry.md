---
title: AI edit failure that keeps the selection and offers Retry or Cancel
pattern: ai-assist
page_type: docs
tags: [error-state, rewrite, open-source]
source_url: https://www.blocknotejs.org/examples/ai/minimal
source_site: blocknotejs.org
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 3
why_it_works: When generation fails the user's text and selection are untouched and the same menu turns into a two-choice recovery (Retry · Cancel), so a failure costs one click, not the user's work.
use_when: Any inline AI action that can fail (network, quota, model error) while the user has a selection or draft open.
has_example: false
---

## What it is
BlockNote's AI example. Selecting a block and choosing **Edit with AI** (toolbar button, `aria-label="Edit with AI"`)
opens "Ask AI anything…" with Improve Writing, Fix Spelling, Translate…, Simplify. In this headless capture the
example's backend wasn't reachable, so choosing Simplify produced the **failure state**, which is what this entry
records: the prompt field reads "Oops! Something went wrong" and the menu offers **Retry** and **Cancel**. The error
state itself is the reference here; the successful flow wasn't captured.

**Licence flag:** BlockNote's AI package (`@blocknote/xl-ai`) is GPL-3.0 or commercial, so it's a reference, not a
default dependency for us (see `research/E6-inline-ai.md`).

## Key techniques
- Failure doesn't move focus or close the menu: the user stays where they were, with the text still selected.
- Two clear choices; Cancel restores the pre-AI state.

## Accessibility
- **Gap:** the error is shown only as placeholder-style grey text in the prompt field; no `role="alert"` or live region
  was found, so screen-reader users hear nothing. Announce failures politely and use real text, not a placeholder.
- **Gap:** "Something went wrong" gives no reason or next step (offline? quota? try later?).

## Weaknesses
- Generic copy; no indication whether retrying will help.

## Related entries
- `ai-assist/tiptap-selection-ai-refine-apply`
- `ai-assist/plate-ai-inline-diff-rewrite`
