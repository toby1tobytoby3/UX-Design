---
title: AI SDK + rich-textarea (our reference build)
kind: source
pattern: ai-assist
page_type: app
tags: [ai, ghost-text, ai-fill, open-source, accessible, keyboard]
source_url: https://ai-sdk.dev/docs/ai-sdk-ui/completion
source_site: ai-sdk.dev
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: ai 7.0.143 + @ai-sdk/react 4.0.147 + rich-textarea 0.28.0 + diff 9.0.0 + zod 4.1.12
licence: Apache-2.0 / MIT / BSD-3-Clause (our code in benchinline/libs/ai-sdk-inline.jsx)
s_look: 3
s_interact: 5
s_coverage: 5
s_a11y: 5
s_perf: 5
s_react: 5
s_bundle: 3
s_licence: 4
why_it_works: Inline AI on ordinary form fields with no editor framework. Ghost text drawn behind a real textarea (so IME, autofill and undo stay native), a ⌘J menu with a word-diff review before anything changes, and AI form fill that only touches empty fields and labels every AI value with a revert.
use_when: Plain fields and forms (descriptions, comments, tickets, notes, settings), which is most of what product briefs ask for, or as the pattern to follow when adding inline AI to any component.
avoid_when: Rich documents with headings, lists and tables (use a rich editor's AI layer instead), or you want a finished visual design out of the box (this is deliberately plain).
alternatives: [plate-ai, blocknote-ai]
has_example: false
---

## Verdict
**The default for inline AI on plain fields, and the code to copy.** It's our own small build on the AI SDK, written to the
defaults in `research/E6-inline-ai.md`, and it passed every probe in the bench: 4/4 tasks, every keyboard and IME check, zero
axe violations, and the lowest main-thread cost. **Read the scores with that in mind:** the bench checks the same defaults the
build was written to, so its lead on keyboard and accessibility is partly by construction. Its job is to show those defaults
are cheap to meet; the third-party kits are judged against them.

## Benchmark (same four tasks and mock as every kit)
4/4 tasks. **96.8 KB gz** for the library code (React subtracted); zod is a large share, so `zod/mini` or a JSON-schema helper
would shrink it (not measured). Code: `benchinline/libs/ai-sdk-inline.jsx` (`AiTextField`, `AiRewriteField`, `AiFillForm`).

| Probe | Result |
|---|---|
| Ghost text latency (last keystroke → suggestion) | 671 ms = 300 ms debounce + 300 ms mock model + render |
| Requests while typing 42 characters | **1** (debounce, trigger only after a space at the end) |
| Screen readers | Ghost `aria-hidden`, **not** in Chrome's accessibility tree; one polite announcement: "Suggestion available. Tab to accept, Escape to dismiss." |
| Tab / Esc / Ctrl+→ | Tab accepts and keeps focus; **Tab moves focus on when no suggestion shows**; Esc dismisses; Ctrl+→ accepts one word |
| IME (Chrome's own composition API) | No request and no ghost while composing (composition text reached the field) |
| Rewrite (272 words, Improve writing) | Word diff (`<ins>`/`<del>` with hidden "added/removed" labels) before anything changes; Accept · Discard · Try again; applied 3/3; **one Ctrl+Z restores the original** 3/3 (edits go through the native undo stack) |
| AI form fill | 3 empty fields filled; the user's "Billing" category left alone; each AI value marked "AI" with Revert; editing clears the mark; nothing submitted |
| AI command menu (Ctrl/⌘+J) | Opens with focus in the input; 4 presets; arrow keys move; free text; Esc closes and returns focus |
| Rewrite stream at 4× CPU throttle (median of 3) | **1.5 s script**, review after 4.6 s |
| axe-core (WCAG 2.2 AA tags), menu closed and open | 0 violations |

## Coverage
| Need | Support |
|---|---|
| Ghost text in a textarea | ✓ `AiTextField` (rich-textarea draws the suggestion) |
| Partial accept, Esc, IME safety, single announcement | ✓ |
| Rewrite with diff, Accept / Discard / Try again, native undo | ✓ `AiRewriteField` (jsdiff `diffWords`) |
| AI form fill with labels and revert | ✓ `AiFillForm` (`useObject` + zod schema) |
| Slash or ⌘J menu with presets and free text | ✓ (⌘J; a slash trigger would be a small addition) |
| Rich text (headings, lists, tables) | ✗ plain text only |
| Inline summaries, suggested replies | Not built; the same `useCompletion` pattern applies |

## Styling with Tailwind
Plain elements with a dozen class names; restyle freely. No shadcn or registry dependency. `rich-textarea` needs the textarea
to keep a fixed font and padding so the mirrored ghost layer lines up.

## Weaknesses
- It's a reference build, not a maintained library: we own its bugs and its upgrades.
- `document.execCommand('insertText')` is how edits land on the native undo stack; it's deprecated but still the only way that
  works in Chrome, Safari and Firefox (with a `setRangeText` fallback that loses undo).
- Ghost text needs the caret at the end of the text; mid-text suggestions (next-edit prediction) are out of scope.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Clean but plain: a grey suggestion, a diff panel and a list menu |
| Interactivity | 5 | Accept, dismiss, word accept, try again, revert and native undo all passed |
| Coverage | 5 | 4/4 tasks |
| Accessibility | 5 | Ghost hidden from screen readers with one announcement, Tab only while a suggestion shows, IME-safe, 0 axe |
| Performance | 5 | 1 request while typing; 1.5 s script for the 272-word rewrite (Plate 20.9 s) |
| React/Next fit | 5 | Hooks and plain components; client components only |
| Bundle size | 3 | 96.8 KB gz, mostly zod and the AI SDK |
| Licence & health | 4 | Permissive dependencies, all released in 2026; the glue code is ours to maintain |
