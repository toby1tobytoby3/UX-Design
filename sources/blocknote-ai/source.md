---
title: BlockNote AI (@blocknote/xl-ai)
kind: source
pattern: ai-assist
page_type: app
tags: [ai, rich-text, editor, gpl]
source_url: https://www.blocknotejs.org/docs/features/ai
source_site: blocknotejs.org
captured_at: 2026-10-18
captured_by: toby
input: library-render
version: 0.56.0
licence: GPL-3.0 OR proprietary (BlockNote Business subscription for closed source); core MPL-2.0
s_look: 4
s_interact: 2
s_coverage: 2
s_a11y: 2
s_perf: 2
s_react: 3
s_bundle: 1
s_licence: 2
why_it_works: A Notion-style AI menu for the BlockNote editor, where the model edits blocks through a tool call and the changes appear as tracked insertions and deletions with an animated agent cursor, then Accept or Revert.
use_when: An open-source (GPL-compatible) product already built on BlockNote that wants a Notion-like "Ask AI" menu.
avoid_when: Closed-source products without a BlockNote Business licence, plain fields, or anywhere a rewrite must be quick and undoable (an 18 s animated rewrite in our run, and undo after Accept left garbled text).
alternatives: [plate-ai, ai-sdk-inline]
has_example: false
---

## Verdict
**Polished to look at, hard to recommend.** It ran fully offline and produced a clear tracked-changes review, but it has no
ghost text and no form fill, its agent animation made a 272-word rewrite take **18.6 s** to review (the model finished in about
1.5 s), **undo after Accept walked back into garbled intermediate text** instead of the original, and the AI package is
**GPL-3.0 or paid** for closed-source use. It also still depends on AI SDK v6, a major version behind.

## Benchmark (same four tasks and mock as every kit)
2/4 tasks (no ghost text, no form fill). **473.7 KB gz** initial plus 107.9 KB lazy and 38.9 KB CSS (React subtracted), with
Mantine as the default UI. Code: `benchinline/libs/blocknote-ai.jsx`, wired as its docs show (AIExtension, AIMenuController,
the AI toolbar button and slash items). Offline through `ClientSideTransport` and a mock model from xl-ai's own bundled AI SDK
v6, answering with an `applyDocumentOperations` tool call.

| Probe | Result |
|---|---|
| Ghost text | ✗ not offered by `@blocknote/xl-ai` 0.56 |
| Rewrite (272 words, Improve Writing) | Tracked insert/strike-through diff before applying; **Accept** and **Revert** (Revert restores the original cleanly); no Try again in the review state; applied 3/3 |
| Review time | **18.6 s** in a normal run: `delayAgentStep` adds 10–200 ms of artificial delay per edit step to animate the agent cursor (source comment: "this can take longer due to artificial delays") |
| Undo after Accept | **Never returned to the original within 40 presses** (3/3 trials): the first Ctrl+Z gives a half-reverted mix ("confusingnfus or that felt…") |
| AI command menu (slash `/ai` → Ask AI) | Opens with focus in the input; presets; arrow keys; free text; Esc closes and returns focus |
| Rewrite stream at 4× CPU throttle (median of 3) | 3.5 s script, review after 27.8 s (mostly the animation) |
| axe-core (WCAG 2.2 AA) | Menu closed: 1 critical `aria-allowed-attr`, 2 serious `aria-input-field-name`. Menu open: also 3 serious `aria-hidden-focus` |

## Coverage
| Need | Support |
|---|---|
| Ghost text | ✗ |
| Rewrite with tracked changes, Accept / Revert | ✓ (no Try again while reviewing; Retry appears on errors) |
| Slash and toolbar AI menu with presets and free text | ✓ |
| AI form fill | ✗ editor blocks only |
| Agent cursor animation | ✓ (on by default; it's what makes reviews slow) |

## Styling with Tailwind
Default UI is Mantine (38.9 KB CSS). A shadcn variant (`@blocknote/shadcn`) needs Tailwind 4; either way you're inside
BlockNote's design system rather than ours.

## Weaknesses
- Licence: closed-source use of the AI package needs a paid BlockNote Business subscription; its server helper is AGPL.
- No ghost text or form fill.
- Slow, animated rewrites; undo after Accept doesn't restore the original.
- Depends on AI SDK v6 while the rest of our stack is on v7 (two copies in the bundle).

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Notion-like menu, tracked changes, agent cursor |
| Interactivity | 2 | Accept and Revert only; no Try again in review; undo after Accept broken |
| Coverage | 2 | 2/4 tasks |
| Accessibility | 2 | 1 critical and 2–5 serious axe violations |
| Performance | 2 | Modest script (3.5 s) but 18.6 s to review a rewrite by design |
| React/Next fit | 3 | React 19 works; Mantine by default; AI SDK v6 alongside our v7 |
| Bundle size | 1 | 473.7 KB gz (+107.9 lazy) |
| Licence & health | 2 | GPL-3.0 or paid (capped at 2 by the rubric); actively released (0.56.0, Oct 2026) |
