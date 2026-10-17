---
title: Logo strip plus one-stat customer proof sections
pattern: social-proof
page_type: landing
tags: [saas, devtools, b2b, minimal, animated]
source_url: https://vercel.com
source_site: vercel.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: A monochrome logo strip gives instant credibility, then each product section is anchored by one named customer and one concrete claim, which turns "who uses it" into "what it did for them".
use_when: B2B products with recognisable customers and a few quantified results per use case.
has_example: false
---

## What it is
Under the "Agentic Infrastructure" hero, a single row of monochrome logos (Meta, Blackbox.ai, DoorDash, OpenAI,
SpaceX, The Weather Company, Polymarket). Further down, each section pairs a product UI with one customer
statement: "**Notion powers millions** of agent conversations daily on Vercel", "**Zapier serves over 100
million** monthly website visits on Vercel", "**Mintlify powers documentation for over 20,000** companies on
Vercel", plus a short feature list.

## Key techniques
- **One customer, one number, one sentence** per section, with the name and number set in a darker weight.
- **Logos in one tone** and evenly spaced, as a calm band.
- **Proof sits next to the product UI** it relates to, not in a separate testimonials block.
- **Scroll-linked hero object**: the "Ship SF" container from the hero follows the scroll and overlaps the next section mid-scroll (see `crop-customer-section.jpg`).

## Accessibility
Logos need `alt` text with company names. The floating hero object should stop or simplify under reduced motion.

## Weaknesses
Claims are self-reported; link to the case studies so they can be verified.

> Retargeted on recapture: the base-pack "logo wall with stats cards" no longer matches the site, so this entry now describes what Vercel actually does.
> Recaptured live on 2026-10-17 with `scripts/capture.mjs` (desktop + mobile, interactions where noted). The `preview.html` rebuild from the original base pack is kept as a code starting point; the screenshots are the reference.
