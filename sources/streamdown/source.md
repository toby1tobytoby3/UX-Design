---
title: Streamdown
kind: source
featured: ai-chat/streamdown-streaming-markdown
pattern: ai-chat
page_type: app
tags: [ai, chat, streaming, markdown, open-source]
source_url: https://streamdown.ai
source_site: streamdown.ai
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 2.7.0
licence: Apache-2.0
s_look: 4
s_interact: 3
s_coverage: 2
s_a11y: 3
s_perf: 5
s_react: 4
s_bundle: 1
s_licence: 5
why_it_works: A drop-in replacement for react-markdown built for streaming. It repairs half-typed markdown (unclosed bold, links, code) before rendering and memoises finished blocks, so a long answer streams without raw syntax and with a fraction of the main-thread work.
use_when: Rendering any streamed model output as markdown, in a useChat chat or anywhere else. It is the markdown layer we recommend under the AI SDK.
avoid_when: Bundle size is critical and answers are short or plain text (react-markdown is 46.5 KB gz against 154.6), or you need real links by default (it renders them as buttons behind a confirmation).
alternatives: [ai-sdk-ui, assistant-ui]
has_example: false
---

## Verdict
**The markdown renderer to use for streamed answers.** It isn't a chat kit (coverage scores low for that reason);
it's the piece that fixes the slowest, glitchiest part of a hand-built chat. In the same `useChat` chat, swapping
react-markdown for Streamdown cut script time by 60% and removed the visible raw syntax.

## Benchmark (same scripted turn; only the renderer differs from ai-sdk-ui)
4/4 tasks (the chat around it is `benchai/libs/_aisdk-chat.jsx`). Code: `benchai/libs/streamdown.jsx`.

| Measure (4× CPU throttle) | Streamdown | react-markdown (ai-sdk-ui) |
|---|---|---|
| Script time while streaming | **9.0 s** | 22.7 s |
| Long tasks | 1 (73 ms) | 3 (208 ms) |
| Stream finished (mock paced at ~11 s) | **18.8 s** | 32.8 s |
| Layout shift | 0.005 | 0.001 |
| Raw `**` / half-typed links seen | **never** | 5 and 8 of ~200 samples |
| Raw table pipes seen | once (header row before its `---` row arrives) | never sampled |
| JS, renderer alone | 154.6 KB gz (+0.5 lazy) | 46.5 KB gz |

Found in the benchmark:
- The repair step (remend) worked as advertised: no unbalanced `**` or `[text](https://…` ever reached the screen.
  A table header shows as raw pipes for a moment until the delimiter row arrives; no renderer can avoid that.
- **Markdown links render as `<button>`s**, not `<a>`s: its link-safety feature opens a confirmation before leaving.
  Good for untrusted model output, but it loses real link behaviour (open in new tab, copy link address). Configure
  `linkSafety` if you want anchors.
- Code blocks come with syntax highlighting, line numbers, copy and download; tables get copy/download menus.
- The final table rendered correctly. The older Streamdown 1.6.11 bundled inside CopilotKit appended stray `*`
  to table cells on the same text (see `sources/copilotkit`), so pin 2.x.
- It's heavy for a markdown renderer: 154.6 KB gz initial.

## Coverage
| Capability | Support |
|---|---|
| Streaming markdown | ✓ self-healing (remend), block memoisation |
| Code / tables / math / Mermaid | ✓ code and tables built in; math, Mermaid, CJK as plugins |
| Sanitising | ✓ `rehype-harden` |
| Stop / retry / edit / branch | – not its job (comes from the chat layer) |
| Tool steps / approvals / citations | – not its job |

## Styling with Tailwind
Needs a Tailwind v4 `@source "../node_modules/streamdown/dist/*.js"` line and shadcn-style CSS variables
(`--background`, `--muted`, `--border`…), which we defined ourselves in `benchai/libs/_shadcn-theme.css`. No shadcn
components are required.

## Weaknesses
- 154.6 KB gz on its own, three times react-markdown.
- Links-as-buttons by default changes link semantics.
- Expects shadcn token names, so our tokens must map onto them.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Finished code blocks, tables, controls with no work |
| Interactivity | 3 | Copy/download for code and tables, link safety; no chat controls (not its job) |
| Coverage | 2 | Covers 1 of the 4 chat tasks (streaming markdown) by design |
| Accessibility | 3 | axe clean in our chat; links become buttons; no live-region handling of its own |
| Performance | 5 | 9.0 s script vs 22.7 s for react-markdown, 1 long task, no raw syntax |
| React/Next fit | 4 | Drop-in component; needs the Tailwind @source line and token variables |
| Bundle size | 1 | 154.6 KB gz |
| Licence & health | 5 | Apache-2.0, Vercel, released 2026-09-30 |
