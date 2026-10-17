---
title: One-question-per-screen onboarding with progress bar
pattern: onboarding
page_type: onboarding
tags: [b2c, consumer-app, playful, illustrative, progressive-disclosure]
source_url: https://www.duolingo.com
source_site: duolingo.com
captured_at: 2026-10-17
captured_by: base-pack
input: base-pack
rating: 5
why_it_works: Asking one easy question per screen, with a mascot speaking it and a progress bar filling up, makes a long setup feel like a short conversation — and users invest in personalisation before being asked to sign up.
use_when: Consumer products that need several preferences before first value, especially pre-signup.
has_example: false
needs_capture: true
---

## What it is
Top: close button and a thick rounded progress bar. Middle: a mascot with a speech bubble asking
the question. Below: large tappable option cards (icon + label), single select. Bottom: full-width
"Continue" button that is disabled until a choice is made. Account creation comes after the user
has answered and seen their personalised plan.

## Key techniques
- Chunky, tactile buttons: thick bottom border as a "3D" shadow that collapses on press.
- Progress bar animates forward with a slight overshoot on each step.
- Option cards have a clear selected state (accent border + tinted fill).
- Signup deferred until after investment ("Create a profile to save your progress").

## Accessibility
Options as a radio group; announce step changes; ensure the disabled Continue state is explained
(e.g. "Choose an option to continue").

## Weaknesses
Playful style doesn't suit all brands; too many steps still cause drop-off — measure each step.

> Base-pack entry written from knowledge of the site; re-capture with **ux-add** to attach real screenshots.
