---
title: Agent plan, tool calls and subagent steps as quiet collapsible rows
pattern: agent-activity
page_type: app
tags: [minimal, devtools, tool-calls, animated, saas]
source_url: https://ui.shadcn.com/docs/ai-elements/base/plan
source_site: ui.shadcn.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: Agent work is shown as low-contrast one-line rows ("Ran npm --version", "Plan: migrate to Base UI 1 of 4 done") that expand on demand, with the final answer in normal text below, so progress is visible and inspectable without the log drowning the answer; failures switch to red and open automatically.
use_when: Any agent or assistant that runs tools, follows a plan or delegates to subagents and must show progress and let users inspect what happened.
has_example: false
---

## What it is
Live previews from shadcn/ui's **AI Elements** docs (Plan, Tool, Subagent, Queue, Checkpoint, Confirmation), each with a Replay button.
Captured states:
- **Plan** (`crop-plan-running.jpg`): "Plan: migrate to Base UI · 1 of 4 done" with a check for the finished step, a half-filled circle and shimmering label for the current step, and empty circles for upcoming steps. Finished: "4 of 4 done", then a one-line summary ("Migrated Dialog and AlertDialog. The type checker passes.").
- **Tool** (`crop-tool-running.jpg`, `crop-tool-failed.jpg`): rows prefixed with a terminal glyph, "Ran node --version ›", "Running npm --version" (shimmer while running) and, on failure, "**Failed to run pnpm --version**" in red, expanded to show `command not found: pnpm`.
- **Subagent**: "Ran the research subagent ⌄" with nested tool rows and the subagent's own conclusion indented in muted text, then the main answer.
- **Queue**: "4 completed ⌄" checklist of finished tasks.

## Key techniques
- **Past-tense, verb-first labels** ("Ran", "Failed to run", "Running"), one line each, with the command itself as the label.
- **Collapsed by default, expanded on failure**: the red row opens to show the error; successful rows stay one line with a chevron.
- Status by **icon shape plus colour** (check, half circle, empty circle, red prompt), and a text counter ("1 of 4 done").
- Running state uses a text shimmer, not a spinner per row, which keeps the column calm.
- Rows are `<button aria-expanded>` (seen in the DOM: "Plan: migrate to Base UI … aria-expanded=true").
- A left rule groups the steps visually under their parent (plan, subagent).

## Accessibility
Expandable rows are buttons with `aria-expanded`, so they're keyboard operable. We found no live region announcing step progress in the
preview; in a real app announce milestones ("Step 2 of 4 done", failures) politely rather than every row. Red failure text also has a
"Failed" word, so it doesn't rely on colour.

## Weaknesses
- AI Elements is shadcn-registry code and the old package is being folded into shadcn/ui (per `research/E-agentic-ui.md`); our stack doesn't use shadcn, so treat it as a visual and interaction reference and rebuild with our primitives.
- These are scripted previews: no real latency, long logs, parallel tasks or pause/redirect controls.
- Grey-on-white row text is low contrast by design; check it still meets 4.5:1 for the labels.

## Related entries
- `ai-review/ai-elements-inline-approval-checkpoint`: the Confirmation and Checkpoint components from the same set
- `ai-review/pierre-diffs-keep-undo-hunks`
- `ai-chat/streamdown-streaming-markdown`

> Captured live on 2026-10-17 with a Playwright script on each AI Elements docs page (preview element only, after Replay for running states).
