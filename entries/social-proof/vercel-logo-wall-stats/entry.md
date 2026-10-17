---
title: Customer logo wall paired with outcome stats
pattern: social-proof
page_type: landing
tags: [saas, devtools, b2b, minimal, dark]
source_url: https://vercel.com
source_site: vercel.com
captured_at: 2026-10-17
captured_by: base-pack
input: base-pack
rating: 4
why_it_works: Monochrome logos read as one calm band rather than a noisy collage, and pairing a recognisable customer with a concrete metric turns "who uses it" into "what it did for them".
use_when: B2B products with recognisable customers and at least a few quantified results.
has_example: false
needs_capture: true
---

## What it is
A grid of customer logos rendered in a single neutral tone, separated by hairline borders, followed
by a row of case-study cards each showing a logo, a large metric (e.g. "−95% build time") and a link
to the story.

## Key techniques
- All logos forced to one colour (`filter: grayscale(1) brightness(…)` or mono SVGs), equal optical height.
- Grid with 1px borders between cells instead of gaps — feels like a spec sheet.
- Metric typography much larger than the supporting copy.
- Logo hover reveals "Read story →".

## Accessibility
Logos need `alt` text with the company name; metric cards should be links with descriptive text, not "Read more".

## Weaknesses
Unverifiable or vague metrics undermine trust — use real numbers only.

> Base-pack entry written from knowledge of the site; re-capture with **ux-add** to attach real screenshots.
