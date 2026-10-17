---
title: assistant-ui
kind: source
pattern: ai-chat
page_type: app
tags: [ai, chat, streaming, open-source, headless, agents, keyboard]
source_url: https://www.assistant-ui.com
source_site: assistant-ui.com
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 0.15.29
licence: MIT
s_look: 2
s_interact: 5
s_coverage: 5
s_a11y: 3
s_perf: 2
s_react: 4
s_bundle: 1
s_licence: 5
why_it_works: Unstyled, composable chat primitives (thread, composer, action bar, branch picker, tool and source slots) that already know the hard behaviours, including stop, retry as a new branch, edit, scroll-follow that lets go when you scroll up, and pause-for-approval, so you style them in Tailwind instead of rebuilding them.
use_when: A real chat or agent surface in our app where we want branching, editing and tool/approval UI without writing the state machine, and we're happy to style primitives ourselves.
avoid_when: A small embedded assistant where bundle size matters, or a team that only wants the shadcn-styled version (its styled layer is a shadcn registry).
alternatives: [ai-sdk-ui, copilotkit, llamaindex-chat-ui]
has_example: false
---

## Verdict
**The most complete chat behaviour, if you style it yourself.** It was the only kit to pass every control in the
benchmark: stop, retry that keeps the old answer as a branch (`‹ 2/2 ›`), edit, and a scroll that follows the stream
but stays put when you scroll up. Two costs: it's heavy (192 KB gz with its markdown), and its default markdown path
was the slowest renderer we measured. Swap in Streamdown for the text part.

## Benchmark (same scripted turn as every other kit)
4/4 tasks. Code: `benchai/libs/assistant-ui.jsx` (local runtime with a `ChatModelAdapter` streaming from the mock).

| Measure (4× CPU throttle) | Result |
|---|---|
| JS, library only | **192.4 KB gz** including `@assistant-ui/react-markdown` |
| Script time while streaming | 37.8 s, 59 long tasks (3.4 s) |
| Stream finished | 53.8 s for a turn the mock paces at ~11 s |
| Layout shift | 0.001 |
| Raw markdown seen mid-stream | yes: unclosed `**` in 6 of 312 samples, half-typed links in 9 |
| Follows the stream / lets go on scroll-up | yes / yes |

Found in the benchmark:
- **Controls all work out of the box:** `ComposerPrimitive.Cancel` stopped the run (130 characters still appeared from
  its text-smoothing buffer before it settled); `ActionBarPrimitive.Reload` re-ran and kept the stopped answer as
  branch 1 of 2; `ActionBarPrimitive.Edit` is there on user messages.
- **Approval works, but on experimental options in the local runtime:** the tool must be listed in
  `unstable_humanToolNames`, the adapter must end with `status: requires-action`, and the continuation reads the
  paused message via `unstable_getMessage()`. With the AI SDK integration (`@assistant-ui/react-ai-sdk` 1.4.18) this
  maps onto the SDK's own approvals instead (not benchmarked).
- Tool calls and sources render through typed slots (`tools.by_name`, `Fallback`, `Source`): the kit decides when, you write the markup.
- Main-thread cost was the highest of the five: markdown re-rendering plus smoothing. Use Streamdown as the `Text` component.
- No live region by default; axe found 0 violations; Enter sends and Shift+Enter adds a line.

## Coverage
| Capability | Support |
|---|---|
| Streaming text | ✓ with optional smoothing |
| Stop / retry / edit / branch | ✓ primitives for all four (retry creates a branch) |
| Attachments | ✓ `AttachmentPrimitive`, `ComposerPrimitive.AddAttachment` |
| Tool steps | ✓ per-tool render slots, `ChainOfThoughtPrimitive` |
| Approvals | ✓ `addResult` / `respondToApproval` in tool UIs (local runtime: experimental options) |
| Citations | ✓ `Source` part slot |
| Generative UI | ✓ `GenerativeUI`, tool UIs, MCP Apps renderer |
| Queued follow-ups | ✓ `QueueItemPrimitive` (not benchmarked) |
| Scroll behaviour | ✓ follows, releases on user scroll, `ScrollToBottom` primitive |

## Styling with Tailwind
Primitives are unstyled Radix-style components that take `className`, so Tailwind works directly; our bench used
plain CSS. The ready-made styled thread (`npx assistant-ui add thread`) is a **shadcn registry**, which we don't use.
Depends on zustand and `assistant-cloud` (the client for its optional paid cloud).

## Weaknesses
- Heaviest of the headless options (192 KB gz) and slowest default markdown path.
- Pre-1.0 (0.15) with frequent releases and many APIs marked `unstable_`/experimental.
- You build every visual yourself.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 2 | Unstyled primitives; styled layer is shadcn-only |
| Interactivity | 5 | Stop, retry-as-branch, edit, copy, attachments, queue |
| Coverage | 5 | All four bench tasks plus generative UI and chain of thought |
| Accessibility | 3 | axe clean, keyboard send/stop, focusable controls; no live region by default |
| Performance | 2 | 37.8 s script and 59 long tasks streaming the same answer; stream finished 5× behind pace |
| React/Next fit | 4 | Idiomatic composable primitives; HITL on the local runtime relies on unstable options |
| Bundle size | 1 | 192.4 KB gz |
| Licence & health | 5 | MIT, released 2026-10-15, very active |
