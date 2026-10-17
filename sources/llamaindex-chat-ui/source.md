---
title: LlamaIndex chat-ui
kind: source
pattern: ai-chat
page_type: app
tags: [ai, chat, streaming, open-source, rag]
source_url: https://github.com/run-llama/chat-ui
source_site: github.com/run-llama/chat-ui
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 0.6.1
licence: MIT
s_look: 3
s_interact: 2
s_coverage: 3
s_a11y: 1
s_perf: 2
s_react: 3
s_bundle: 1
s_licence: 2
why_it_works: A complete RAG-style chat section (messages, composer, event steps, source document cards, artifact canvas, PDF viewer) that plugs into any useChat-compatible handler with one component.
use_when: An internal RAG prototype over documents where source cards and a PDF viewer matter more than polish, weight or accessibility.
avoid_when: Anything customer-facing or accessibility-sensitive; anything where bundle size matters (1 MB gz up front); anything needing approvals, edit or branching.
alternatives: [assistant-ui, ai-sdk-ui, copilotkit]
has_example: false
---

## Verdict
**Not recommended for our product.** It renders a usable chat in one line and its event steps and source cards work,
but it was the heaviest kit by far (1 MB gz initial), had the worst accessibility, has no approval mechanism, and
hasn't had a release since August 2025.

## Benchmark (same scripted turn as every other kit)
3/4 tasks. Code: `benchai/libs/llamaindex-chat-ui.jsx` (`<ChatSection>` over the AI SDK's `useChat`). The tool step and
sources were sent as its own `data-event` and `data-sources` parts.

| Measure (4× CPU throttle) | Result |
|---|---|
| JS, library only | **1,009 KB gz** initial, +571 KB lazy, 9.9 KB CSS |
| Script time while streaming | 28.8 s; layout 6.2 s and style 2.0 s, both the highest of the five |
| Stream finished | 51.6 s for a turn the mock paces at ~11 s |
| Layout shift | 0.035 |
| Raw markdown seen mid-stream | yes: `**` in 7 of 275 samples, half-typed links in 9 (react-markdown **8**) |
| Follows the stream / lets go on scroll-up | yes / **no**: it pulled the view back down after we scrolled up |

Found in the benchmark:
- CodeMirror, the PDF viewer, KaTeX and highlight.js load up front, hence the 1 MB.
- The default `ChatSection` has **no Stop button** while streaming (a `ChatMessages.Actions` component with
  "Stop generating" exists but isn't in the default layout). Regenerate appears after the answer finishes and replaces it.
- Event steps (`data-event`) render with title, arguments and status; the result is behind a "Show data" toggle.
- Source cards show a file name derived from the URL ("branching", "retention"), not the title we sent, and are
  clickable `div`s with **no focusable element**: keyboard users can't open them.
- The package's own markup sets no `aria-*` attributes (the only ARIA comes from its Radix dependencies, e.g. the
  "Show data" collapsible). axe: `button-name` (critical, the icon-only send button) and
  `scrollable-region-focusable` (serious).
- No approval or human-in-the-loop mechanism.

## Coverage
| Capability | Support |
|---|---|
| Streaming text | ✓ (react-markdown 8) |
| Stop / retry | Stop not in the default layout; retry replaces |
| Edit / branch | ✗ |
| Attachments | ✓ upload input (not benchmarked) |
| Tool steps | ✓ `data-event` parts |
| Approvals | ✗ |
| Citations | ✓ as source cards, not links, not keyboard-reachable |
| Generative UI | ◐ artifacts canvas (code, document) |

## Styling with Tailwind
Built from shadcn components: you add an `@source` line for the package and shadcn theme variables (we mapped them in
`benchai/libs/_shadcn-theme.css`). The recommended install is a shadcn registry (`npx shadcn add …/chat.json`).

## Weaknesses
- 1 MB gz initial, slowest layout and style work.
- No release since 0.6.1 on 2025-08-28; pins react-markdown 8.
- Accessibility gaps throughout.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 3 | Finished but dated shadcn look |
| Interactivity | 2 | Retry only by default; no stop, edit or branch |
| Coverage | 3 | Steps and source cards yes, approvals no; artifact canvas |
| Accessibility | 1 | No ARIA of its own, critical axe failure, unreachable source cards, forced scroll |
| Performance | 2 | 28.8 s script, 6.2 s layout, stream 5× behind pace |
| React/Next fit | 3 | One component over useChat, but needs Tailwind scanning, shadcn variables and old react-markdown |
| Bundle size | 1 | 1,009 KB gz initial |
| Licence & health | 2 | MIT, but no release in over a year |
