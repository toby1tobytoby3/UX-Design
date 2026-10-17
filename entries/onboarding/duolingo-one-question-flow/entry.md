---
title: One-question-per-screen onboarding with mascot and progress bar
pattern: onboarding
page_type: onboarding
tags: [b2c, consumer-app, playful, illustrative, progressive-disclosure]
source_url: https://www.duolingo.com
source_site: duolingo.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: Each screen asks one easy question, spoken by the mascot, with big icon options and a progress bar, so a long setup feels like a short conversation and users invest before they're asked to sign up.
use_when: Consumer products that need several preferences before first value, especially before account creation.
has_example: false
---

## What it is
"Get started" leads to "I want to learn…": a grid of large tiles with flags and learner counts (Spanish 41.9M,
French 22.6M, Chess, English, Japanese, German, Math, Hindi…). After picking one, the mascot introduces itself
("Hi there! I'm Duo!", "Let's get this party started!"), then asks questions one at a time. The first,
"How did you hear about Duolingo?", offers eight icon options in a 2×4 grid (News/article/blog, Friends/family,
Facebook/Instagram, TV, YouTube, Google Search, TikTok, Other). A thin green progress bar runs along the top, and
**Continue** stays disabled until an option is chosen. Selecting one tints it blue. No account is needed for any of this.

## Key techniques
- **Choose what you want before anything else**: the subject grid comes first, with learner counts as social proof.
- **Mascot speech bubble** turns form questions into dialogue.
- **Disabled Continue until answered**, then it turns solid green (step captured in `crop-answer-selected.jpg`).
- **Single-column options on mobile**, two columns on desktop.
- **Signup deferred**: no account requested in the steps we captured.

## Accessibility
The options should be a radio group, and the progress bar should expose its value. Explain why Continue is disabled.

## Weaknesses
The playful style doesn't suit every brand, and long flows still lose people, so measure each step.

> Recaptured live on 2026-10-17 with `scripts/capture.mjs` (desktop + mobile, interactions where noted). The `preview.html` rebuild from the original base pack is kept as a code starting point; the screenshots are the reference.
