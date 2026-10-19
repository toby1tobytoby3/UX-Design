---
title: Prompt-first start screen where a starter chip becomes a mode token and opens a template tray
pattern: ai-chat
page_type: app
tags: [minimal, saas, progressive-disclosure, keyboard, generative-ui]
source_url: https://manus.im
source_site: manus.im
captured_at: 2026-10-19
captured_by: toby
input: url
rating: 4
why_it_works: One question and one box, with a short row of starter tasks underneath; picking a task doesn't fire a canned prompt but sets a mode inside the composer and shows matching templates, so a blank box becomes a guided start without leaving it.
use_when: The first screen of an AI tool that can do several kinds of job (build, write, analyse), where people need a nudge on what to ask without being pushed into a wizard.
has_example: false
---

## What it is
Manus's signed-out home (live, 19 Oct 2026). A serif question, **"What can I do for you?"**, above one large composer
("Assign a task or ask anything", a + attach button, a round send button). Under it, five starter chips: Create slides,
Build website, Create games (New), Video (New), More.

Pressing **Build website** (`crop-after-chip.jpg`):
- the chip becomes a **"Website" token inside the composer**, next to an "Import from…" (Figma, URL) control;
- the placeholder changes to **"Describe the website you want to build"**;
- a **tray** opens under the box: "Build a website" with template cards (E-commerce, Landing Page, Dashboard,
  Corporate) and an "Explore ideas" row with a refresh button, plus ✕ to close it.

Nothing is sent and the page doesn't change; you still type the actual request.

## Key techniques
- **Starter chips set context, they don't send.** The choice shows up as a removable token in the input, so people can
  see and undo it. Better than chips that drop a canned sentence into the box.
- **Placeholder follows the mode**, telling people what a good request looks like for that job.
- **Templates appear only after a choice** (progressive disclosure): the first screen stays one question and one box.
- **≤ 5 chips plus More**, with a small "New" badge for recent features.
- The composer has the focus on load, so typing works immediately.

## Accessibility
Measured with Playwright:
- **The composer has no accessible name**: it's a `contenteditable` div with no `role`, `aria-label` or label (the
  placeholder is visual only). Use a `textarea` with a label, or `role="textbox"` + `aria-multiline` + `aria-label`.
- **The + button has no name** (an empty `button`).
- Starter chips are `div role="button"` and are in the Tab order after the composer. Good, but native `<button>`s
  would also get Enter/Space for free.
- The composer is focused on load. Fine on a page whose only job is this box; don't copy it on pages with other content.

## Weaknesses
- The intro video card above the question pushes the composer down on small laptops; keep the box above the fold.
- The tray can get long (templates plus ideas), so on phones put it in a sheet or limit it to one row.

## Related entries
- `ai-chat/shadcn-message-scroller-turn-anchoring` (what happens after the first message)
- `ai-assist/*` (AI inside existing screens rather than a blank start)

> Captured live with `scripts/capture.mjs` (desktop, mobile) and a Playwright probe for the chip state and keyboard order.
> Supplied as an Instagram reel screenshot ("sites u just WONT regret using", @buildwaleesh); the live site replaced it.
