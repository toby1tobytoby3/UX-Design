---
title: Plate AI (@platejs/ai)
kind: source
pattern: ai-assist
page_type: app
tags: [ai, ghost-text, rich-text, editor, open-source]
source_url: https://platejs.org/docs/ai
source_site: platejs.org
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: platejs 53.3.15 + @platejs/ai 53.3.17
licence: MIT
s_look: 4
s_interact: 3
s_coverage: 4
s_a11y: 2
s_perf: 1
s_react: 4
s_bundle: 1
s_licence: 5
why_it_works: The most complete open-source AI layer for a rich-text editor. Copilot ghost text with Tab, Esc and word accept, a ⌘J AI menu with presets and free text, and rewrites shown as inline red/green suggestions with Accept, Discard, Insert below and Try again, built on the AI SDK v7 we already use.
use_when: You need inline AI inside a rich document editor (headings, lists, tables) and have chosen Slate/Plate as that editor.
avoid_when: Plain form fields (far too heavy: 487 KB gz), screen-reader or IME-heavy audiences until the ghost text is fixed, or you can't adopt its shadcn-registry UI.
alternatives: [ai-sdk-inline, blocknote-ai]
has_example: false
---

## Verdict
**Capable and MIT, but not ready to drop in.** It covered three of the four tasks natively and its keyboard model is right
(Tab, Esc, Ctrl+→, Try again). But in our runs the ghost text was read by screen readers and appeared mid-IME composition,
the rewrite stream cost **20.9 s of main-thread script** for a 272-word paragraph, and **Accept intermittently left the original
text**. Use it only if Plate is already your rich editor, and budget time to fix those.

## Benchmark (same four tasks and mock as every kit)
3/4 tasks (no structured form fill). **486.9 KB gz** initial plus 60.6 KB lazy (React subtracted), with the registry kits a
team would install: CopilotKit, AIKit, SuggestionKit, BlockSelectionKit, MarkdownKit. Code: `benchinline/libs/plate-ai.jsx`
and the registry files vendored unchanged in `benchinline/libs/plate/registry/`. Only the shadcn Button/Command/Popover are
thin shims over the same cmdk and Radix parts, the comment/discussion UI is stubbed, and the demo-only `@faker-js/faker`
fallback is shimmed so it doesn't inflate the bundle.

| Probe | Result |
|---|---|
| Ghost text latency | 914 ms = 500 ms registry debounce + 300 ms mock model + render |
| Requests while typing 42 characters | 2, none aborted (a stale request isn't cancelled) |
| Screen readers | **Ghost text is in Chrome's accessibility tree** (a `contenteditable=false` span inside the paragraph, not `aria-hidden`); no announcement |
| Tab / Esc / Ctrl+→ | All work; Tab moves focus on when no suggestion shows |
| IME (Chrome's composition API) | **A ghost suggestion appeared while a composition was still open** |
| Rewrite (272 words, Improve writing) | Inline red/green suggestion diff; Accept · Discard · Try again (and Insert below); one Ctrl+Z restores the original |
| Accept reliability | **Accept applied the rewrite in 16 of 27 trials** (mouse click 2/6 at 8 ms chunks and 3/6 at 30 ms, Enter 5/6, and 2/3 in each of three probe runs); in the others the document was left at the original. One capture (bench.jpg) shows a misplaced preview: the diff landed mid-paragraph with the original text duplicated around it. Cause not isolated: confirm against a real model route before relying on it |
| AI command menu (⌘J) | Opens with focus in the input; presets; arrow keys; free text; Esc closes and returns focus |
| Rewrite stream at 4× CPU throttle (median of 3) | **20.9 s script**, review after 24.6 s: every chunk re-diffs the whole block (`applyAISuggestions`) and the registry `useChat` sets no throttle |
| axe-core (WCAG 2.2 AA) | 2 critical `label`: Slate's hidden `slate-shadow-input` elements; plus 1 contrast issue with the menu open |

## Coverage
| Need | Support |
|---|---|
| Ghost text (copilot) | ✓ `CopilotPlugin`: Tab, Esc, Ctrl+→, Ctrl+Space, debounce, trigger rules |
| Rewrite with inline diff, Accept / Discard / Try again | ✓ `AIChatPlugin` + suggestions (reliability above) |
| ⌘J AI menu with presets and free text | ✓ (registry `ai-menu`, cmdk) |
| Streaming insert, comments, table-cell edits | ✓ (docs; not benchmarked) |
| AI form fill | ✗ editor content only |

## Styling with Tailwind
The plugins are headless, but every piece of UI (ghost text, menu, suggestion marks) comes from Plate's **shadcn registry**
(`npx shadcn add @plate/ai-kit`): Tailwind classes and shadcn colour variables. We compiled Tailwind over the vendored files
for the screenshot. Without shadcn you rebuild or restyle the menu.

## Weaknesses
- Ghost text is exposed to screen readers and appears during IME composition (both fixable in the registry `GhostText`).
- Slow on long rewrites: add `experimental_throttle` to the chat (not tested here) or keep rewrites short.
- Accept intermittently didn't apply in our harness (above).
- Heavy: 487 KB gz for the editor and AI kits.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Polished registry UI: inline red/green suggestions, cmdk menu, loading pill |
| Interactivity | 3 | Right keyboard model and Try again, but Accept failed in 11 of 27 trials |
| Coverage | 4 | 3/4 tasks natively, plus comments and table edits |
| Accessibility | 2 | Ghost read by screen readers, no announcement, not IME-safe, 2 critical axe (Slate shadow inputs) |
| Performance | 1 | 20.9 s script for the rewrite stream; stale ghost requests not aborted |
| React/Next fit | 4 | React-first, AI SDK v7 peers; UI arrives via the shadcn registry |
| Bundle size | 1 | 486.9 KB gz (+60.6 lazy) |
| Licence & health | 5 | MIT; @platejs/ai released 14 Oct 2026 (paid "Plus" templates exist, the plugins are free) |
