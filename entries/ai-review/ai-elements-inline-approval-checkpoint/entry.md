---
title: Inline approval card for a risky agent action, plus restore checkpoints
pattern: ai-review
page_type: app
tags: [minimal, devtools, human-in-the-loop, tool-calls]
source_url: https://ui.shadcn.com/docs/ai-elements/base/confirmation
source_site: ui.shadcn.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: The agent pauses inside the conversation with a small card stating exactly what it will do ("Run rm -rf dist?"), where it runs ("The command runs in this project.") and two buttons (Deny, Approve); once approved the card collapses into a past-tense row ("Ran rm -rf dist"), and checkpoints between turns offer a one-click Restore.
use_when: Agents that take actions with side effects (commands, deletes, sends, payments, writes) and need per-action consent and an undo path.
has_example: false
---

## What it is
Two AI Elements previews from shadcn/ui:
- **Confirmation**: user asks "Clean up the build folder." The agent shows "Thought ›", then a bordered card with a terminal glyph,
  the command as a question ("Run rm -rf dist?"), a scope line ("The command runs in this project."), and **Deny** (outline) / **Approve** (solid black).
  After Approve (`crop-after-approve.jpg`) the card becomes the row "Ran rm -rf dist" and the answer "Removed the dist folder." follows.
- **Checkpoint**: between turns, a centred divider "Button renamed · Restore" marks a point the user can roll back to.

## Key techniques
- **The exact action is the headline**, phrased as a question, with the scope underneath; no generic "Allow tool call?".
- Approve is the primary (filled) button but Deny comes first, so a hasty Enter/Tab doesn't approve by habit (check focus order in your build).
- **The card turns into history**: after a decision it collapses into the same one-line row style as other tool calls, so the log stays uniform.
- **Checkpoints are inline dividers** with a short label of what changed and a small Restore button, so undo lives where the change happened.

## Accessibility
Deny/Approve are real buttons. Move focus to the card (or announce it) when it appears, since the agent is blocked waiting;
otherwise keyboard and screen-reader users may not notice the pause. Restore needs a confirmation or an undo of its own.

## Weaknesses
- No "always allow this command" / permission-mode option, which real agents need to avoid approval fatigue (see `research/E-agentic-ui.md` on permission modes).
- No preview of consequences (e.g. what's in `dist`, how many files) for a destructive command.
- shadcn-registry code: use as a pattern reference, rebuild with our primitives.

## Related entries
- `agent-activity/ai-elements-plan-tool-steps`
- `ai-review/pierre-diffs-keep-undo-hunks`: per-change review for edits rather than commands

> Captured live on 2026-10-17 with a Playwright script: clicked "Send message", waited for the card, clicked Approve; Checkpoint preview captured as rendered.
