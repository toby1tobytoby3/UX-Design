---
title: New turn anchors near the top; the answer streams below without yanking the view
pattern: ai-chat
page_type: docs
tags: [minimal, streaming, saas, interactive]
source_url: https://ui.shadcn.com/docs/components/message-scroller
source_site: ui.shadcn.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: When the user sends a message, that message settles near the top of the viewport (with a peek of the previous answer above it) and the reply streams in underneath, so the reader starts reading at the start of the answer; once the answer runs past the fold a small ↓ button appears instead of the view chasing every token.
use_when: Any chat or agent transcript with streamed replies, especially long answers that users read while they stream.
has_example: false
---

## What it is
The live preview on shadcn/ui's **Message Scroller** docs page: a read-only scripted chat ("Demo is read only. Press send to send messages.").
Pressing Send plays turns. Captured states:
- Empty state with a greeting ("Morning, shadcn!") and a pre-filled composer.
- Turn 1 streaming in below the user bubble (`crop-first-turn-frames.jpg`).
- Turn 2 (`crop-turn-anchored.jpg`): the new user bubble ("Okay, but when someone sends a new message…") sits near the top, with
  the last two lines of the previous answer visible above it; the reply begins under it.
- As the reply overflows (`desktop.jpg`), text fades under the composer and a round **↓** button appears above the fade.

## Key techniques
- **Turn anchoring**: the docs describe setting `scrollAnchor` on the turn that should settle near the top "instead of blindly snapping to the document bottom".
- **Follow only while at the bottom**: per the docs and the demo's own script, auto-scroll applies only while the reader is already at the bottom; scrolling up stops it and preserves position.
- **A peek of the previous exchange** above the anchored turn keeps context.
- **Bottom fade + jump button** signals "more below" without moving the reader.
- The docs page also covers prepending history without jumping, opening saved transcripts at the right place, and jump-to-message.

## Accessibility
The ↓ button is a real button; give it a label ("Jump to latest message"). Don't use the scroll container as the live region for streaming
text; announce reply start and completion instead (see `research/E-agentic-ui.md`).

## Weaknesses
- A scripted, read-only demo: no real latency, no stop button, no long code blocks.
- It's a shadcn component; the behaviour is the reference, and we'd rebuild it with `use-stick-to-bottom`-style logic or our own hook.
- In our automated run we couldn't reliably read the scroll container's position, so the "follows only at bottom" behaviour is from the docs, not measured.

## Related entries
- `ai-chat/streamdown-streaming-markdown`: what renders inside each answer
- `agent-activity/ai-elements-plan-tool-steps`

> Captured live on 2026-10-17 with a Playwright script on the docs preview (Send pressed twice; frames at about 0.3, 1.5, 4 s and later).
