---
title: Vercel AI SDK UI (useChat)
kind: source
pattern: ai-chat
page_type: app
tags: [ai, chat, streaming, open-source, headless, agents]
source_url: https://ai-sdk.dev/docs/ai-sdk-ui
source_site: ai-sdk.dev
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: ai 7.0.143 + @ai-sdk/react 4.0.147
licence: Apache-2.0
s_look: 2
s_interact: 3
s_coverage: 4
s_a11y: 2
s_perf: 3
s_react: 5
s_bundle: 2
s_licence: 5
why_it_works: The de facto streaming protocol and state hook for chat in React. Typed message parts carry text, tool calls with lifecycle states, approvals, sources and data, so every agent pattern has a home in the data model, and the UI stays entirely ours.
use_when: The default foundation for any chat or agent UI in our Next app. Pair it with Streamdown for markdown and our own Tailwind components (or assistant-ui primitives) for the UI.
avoid_when: You want finished chat UI out of the box; it ships none, so budget for building the message list, composer, controls and scroll behaviour.
alternatives: [assistant-ui, streamdown, copilotkit]
has_example: false
---

## Verdict
**The foundation to build on, not a chat UI.** `useChat` handles the stream, message state, stop, regenerate and tool
approvals; you write every pixel. That suits our stack (Tailwind, no shadcn). Don't render with plain react-markdown:
in our benchmark it was the slowest part of the chat. Use **Streamdown** (`sources/streamdown`), which is the same chat
with one component swapped.

## Benchmark (same scripted turn as every other kit)
4/4 tasks supported at the data level. Code: `benchai/libs/_aisdk-chat.jsx` + `benchai/libs/ai-sdk-ui.jsx`. Driven
offline by a mock `ChatTransport` emitting the SDK's own UI message chunks (`text-delta`, `tool-input-available`,
`tool-approval-request`, `source-url`…), so no API key. The server-side `needsApproval` path was not exercised.

| Measure (4× CPU throttle) | Result |
|---|---|
| JS, library only | **104.5 KB gz** with react-markdown + remark-gfm (hook alone 52.8, react-markdown 46.5) |
| Script time while streaming | 22.7 s, 3 long tasks (208 ms) |
| Stream finished | 32.8 s for a turn the mock paces at ~11 s: rendering fell behind |
| Layout shift | 0.001 |
| Raw markdown seen mid-stream | yes: unclosed `**` in 5 of 213 samples, half-typed `[link](…` in 8 |
| Follows the stream | no (nothing built in) |

Found in the benchmark:
- **Re-rendering the whole message through react-markdown on every chunk is the bottleneck**, not the SDK. The same
  chat with Streamdown used 9.0 s of script and finished in 18.8 s. `experimental_throttle` on `useChat` is the other lever.
- Tool approval works end to end in the hook: `addToolApprovalResponse` plus
  `sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses` resumed the run after Approve.
- Stop (`stop()`) halted the stream within one chunk (25 characters after the click); `regenerate()` replaces the
  answer, it doesn't keep the old one as a branch.
- No live region, scroll anchoring or composer label come with it: the accessibility result is whatever you write.
  Our minimal chat passed axe with 0 violations but has no `aria-live`, and its composer is named only by its placeholder.

## Coverage
| Capability | Support |
|---|---|
| Streaming text | ✓ data (`text` parts, `status`) |
| Stop / retry | ✓ functions (`stop`, `regenerate`); buttons are yours |
| Edit / branch | ✗ (edit = `setMessages` + resend by hand; no branches) |
| Attachments | ✓ data (`file` parts, `sendMessage({ files })`) |
| Tool steps | ✓ typed `tool-<name>` parts with states (`input-streaming` → `output-available`) |
| Approvals | ✓ `approval-requested` state + `addToolApprovalResponse` |
| Citations | ✓ `source-url` / `source-document` parts |
| Generative UI | ✓ render components from tool parts or `data-*` parts |
| Scroll behaviour | ✗ (add `use-stick-to-bottom` or a turn-anchoring scroller) |

## Styling with Tailwind
Nothing to override: it renders nothing. Vercel's own UI layer, **AI Elements**, is a shadcn registry and is being
folded into shadcn/ui (the ai-sdk.dev/elements banner says the project is deprecated at the end of November 2026;
see `research/E-agentic-ui.md`). Read its source for patterns; don't adopt it, since we don't use shadcn.

## Weaknesses
- No UI, no scroll model, no accessibility defaults: every chat built on it starts from zero.
- No branching; regenerate overwrites.
- Major versions move fast (v7 in 2026); pin and read the migration guides.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 2 | Hook only: no UI (rubric: hook-only kits score 2) |
| Interactivity | 3 | Stop, regenerate and approvals as functions; no edit or branch |
| Coverage | 4 | Data model covers all four bench tasks plus files and data parts; UI is yours |
| Accessibility | 2 | Provides nothing; live region and labels are on you |
| Performance | 3 | Hook is light; with react-markdown the stream fell 3× behind (fix: Streamdown or throttle) |
| React/Next fit | 5 | Idiomatic hook, typed parts, built for Next route handlers |
| Bundle size | 2 | 104.5 KB gz as benchmarked with react-markdown (52.8 hook alone) |
| Licence & health | 5 | Apache-2.0, Vercel, released 2026-10-16 |
