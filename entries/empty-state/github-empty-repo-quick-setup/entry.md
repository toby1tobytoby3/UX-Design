---
title: Empty state as a quick-setup guide with copyable commands
pattern: empty-state
page_type: app
tags: [devtools, b2b, minimal]
source_url: https://github.com
source_site: github.com
captured_at: 2026-10-17
captured_by: base-pack
input: base-pack
rating: 4
why_it_works: Instead of saying "nothing here", the empty screen hands users the exact next steps for each starting situation, with one-click copy, so the empty state becomes the onboarding.
use_when: Any object (project, workspace, integration) that starts empty and needs setup before it's useful.
has_example: false
needs_capture: true
capture_blocker: login required
---

## What it is
A new empty repository shows a "Quick setup" box with the clone URL (HTTPS/SSH toggle + copy
button), then several titled sections — "create a new repository on the command line", "push an
existing repository" — each with a code block and a copy button.

## Key techniques
- Branches by user situation (starting fresh vs. bringing existing work).
- Copy buttons on every command; values (URL, names) pre-filled with the user's own data.
- Calm visual weight: bordered panels, monospace blocks, no illustration needed.

## Accessibility
Copy buttons need labels ("Copy clone URL") and a polite announcement when copied.

## Weaknesses
Text-heavy for non-technical audiences — for consumer apps pair with a single primary action.

> Base-pack entry written from knowledge of the site; re-capture with **ux-add** to attach real screenshots.

> Recapture attempted 2026-10-17: this pattern is only visible when signed in, so it can't be captured automatically. Send a screenshot (or a screen recording) from your own account and run `ux-add` to replace the base-pack description.
