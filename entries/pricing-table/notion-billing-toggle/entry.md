---
title: Plan cards with a billing toggle and a recommended plan
pattern: pricing-table
page_type: pricing
tags: [saas, b2b, minimal, progressive-disclosure]
source_url: https://www.notion.com/pricing
source_site: notion.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: A monthly/yearly toggle with "Save up to 20%" nudges annual billing, plans are grouped into two audience panels, and one plan is flagged "Recommended", so the default choice is obvious.
use_when: Subscription products with 3–4 tiers and a monthly/annual choice.
has_example: false
---

## What it is
Headline "One tool to run your company." with a customer logo row (OpenAI, Figma, Volvo, Ramp, Cursor). Below,
a segmented **Pay monthly / Pay yearly** toggle with "Save up to 20% with yearly" and "Price in USD" on the
right. The four plans sit in **two grouped panels**: "Essentials for staying organized." (Free $0, Plus $10) and
"The AI workspace for work that matters." (Business $20 with a **Recommended** tag, Enterprise custom pricing).
Each plan has a CTA and an "Everything in X, and:" feature list.

## Key techniques
- **Plans grouped by audience** in two tinted panels, a step beyond four equal cards.
- **"Everything in Plus, and:"** lists avoid repeating features.
- **A single solid-blue CTA** on the recommended plan; others are lighter.
- **Logos above the price** reassure before the cost appears.

## Accessibility
The toggle should be a radio group, and the price change should be announced (`aria-live="polite"`).

## Weaknesses
Per-member pricing needs an example total for larger teams.

> Recaptured live on 2026-10-17 with `scripts/capture.mjs` (desktop + mobile, interactions where noted). The `preview.html` rebuild from the original base pack is kept as a code starting point; the screenshots are the reference.
