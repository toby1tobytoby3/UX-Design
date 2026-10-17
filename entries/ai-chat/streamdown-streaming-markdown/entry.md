---
title: Streaming markdown that never shows half-typed syntax
pattern: ai-chat
page_type: docs
tags: [minimal, open-source, streaming, devtools]
source_url: https://streamdown.ai/playground
source_site: streamdown.ai
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: An AI answer is rendered as formatted markdown while it is still arriving, and unfinished syntax (an open **, a half-written link, an unclosed code fence) is completed or hidden on each chunk, so the reader sees clean text growing smoothly instead of asterisks and brackets flickering into formatting.
use_when: Any chat or agent surface that streams markdown answers with code, tables, maths or diagrams.
has_example: false
---

## What it is
Vercel's Streamdown playground: markdown source on the left, the Streamdown output on the right. "Simulate Stream" replays the source
chunk by chunk; the toolbar shows a red **Stop** button while streaming and a "Streaming" mode selector. Our frames show headings,
bold/italic/strikethrough, links, blockquotes, nested lists, KaTeX maths and a Mermaid flowchart arriving in order, with a block cursor at the end.

## Key techniques
- **Measured:** over 126 samples (every 150 ms across a ~21 s simulated stream), the rendered output never contained a literal `**` or `](`.
  Per the research, its `remend` preprocessor closes dangling emphasis and inline code and swaps half-typed link URLs for a placeholder (`research/E-agentic-ui.md`).
- **Heavy blocks get placeholders**: the Mermaid diagram showed "Loading diagram…" until its block was complete, instead of re-rendering on every chunk.
- Output elements carry `data-streamdown="heading-1" | "strong" | "inline-code" | "horizontal-rule"…`, so styling targets semantic roles.
- Stop is a prominent filled red button in the same place as the run control.

## Accessibility
The playground doesn't show how the stream is announced. Don't put the whole growing answer in an `aria-live` region; announce
"Responding…" and then the finished answer (or use `role="log"` politely), per the research defaults.

## Weaknesses
- Stack flag: Streamdown needs a Tailwind `@source` line and about 11 shadcn-style CSS variables (research file).
- A playground, not a chat: scroll-following, retry and editing aren't shown.
- Code blocks and Mermaid add weight; load those plugins only where needed.

## Related entries
- `ai-review/pierre-diffs-keep-undo-hunks`
- `feedback/sonner-stacked-toasts`

> Captured live on 2026-10-17 with a Playwright script (Simulate Stream; frames at ~0.9, 1.8, 3.2 s and ~11 s; text sampled every 150 ms).
