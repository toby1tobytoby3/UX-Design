---
title: Per-hunk Keep / Undo on an AI edit, with a changed-files panel
pattern: ai-review
page_type: docs
tags: [dark, devtools, keyboard, open-source, human-in-the-loop]
source_url: https://diffs.com/
source_site: diffs.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: Each AI-proposed change sits inline in the file as a red/green hunk with its own Undo (⌘N) and Keep (⌘Y) buttons, so the person reviews and decides change by change in context; keeping a hunk folds it into normal code immediately, so what's left to review is always visible.
use_when: Any agent that edits user content (code, documents, configs, data) and needs the person to approve changes before they land; especially multi-file agent runs.
has_example: false
---

## What it is
The home page of `@pierre/diffs` (v1.5.2, Apache-2.0 per `research/E-agentic-ui.md`), an open-source diff renderer built on Shiki.
Three live demos matter for agent review:
1. **Accept/Reject Changes**: `index.html` with one hunk (−2 +3). Floating buttons at the hunk's end: **Undo ⌘N** and **Keep ⌘Y**.
   Clicking Keep (captured in `crop-after-keep.jpg`) removes the red/green styling and the header counter drops to −0 +0.
2. **Agent UI** at the top: a code pane with collapsed "16 unmodified lines" separators, a right-hand **Changes 5** tab listing
   each touched file with +/− counts and A/M status, and an agent composer ("Ask for changes, @mention files, or run commands…").
3. **Merge conflict resolution UI**: an inline bar "Accept current change | Accept incoming change | Accept both", and
   **Comments & Annotations**: a threaded comment on a line with "Add reply…" and "Resolve".

## Key techniques
- Decisions are **per hunk, inline**, not a separate approval dialog; each control has a **keyboard shortcut** shown on the button.
- **Unchanged code is collapsed** into "N unmodified lines" bars that expand on click, so long files stay reviewable.
- File-level summary (Changes count, per-file +/−, added vs modified) lets the reviewer see the blast radius before reading code.
- Line numbers show both old and new numbering in the hunk (9/10 removed, 9/10/11 added).
- The same annotation slot powers keep/undo buttons, comments and lint markers, so review UI is one system.

## Accessibility
Buttons are real `<button>`s with visible shortcut hints. Red/green is reinforced by the gutter bar and old/new line numbers, but
check that added/removed lines are announced (e.g. visually hidden "added"/"removed" text) before relying on colour alone.
The demo is dark-only by default (Auto/Light/Dark toggle on some demos).

## Weaknesses
- A rendering library: the agent workflow (what happens after Keep, how undo reaches the agent) is yours to build.
- ⌘N and ⌘Y clash with browser shortcuts (new window / history) on some platforms; choose app-scoped shortcuts.
- No "accept all in file" control shown in the demo; long agent runs need bulk actions.

## Related entries
- `ai-chat/streamdown-streaming-markdown`: the chat side of an agent UI
- `agent-activity/ai-elements-plan-tool-confirmation` (if present): plan and tool-call display

> Captured live on 2026-10-17 with a Playwright script: scrolled to each demo, clicked Keep in the Accept/Reject demo.
> Button labels read from the DOM.
