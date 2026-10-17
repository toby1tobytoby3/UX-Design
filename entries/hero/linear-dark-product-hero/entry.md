---
title: Dark product hero with a live-looking app screenshot
pattern: hero
page_type: landing
tags: [saas, devtools, dark, minimal]
source_url: https://linear.app
source_site: linear.app
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: A short, confident headline over a near-black page, then a large, realistic product UI right below the fold line, so the interface itself does the selling and invites the scroll.
use_when: Product-led SaaS where the interface is the selling point.
has_example: false
---

## What it is
Near-black page with a slim nav (Product, Resources, Customers, Pricing, Now, Contact · Log in · Sign up pill). A
large left-aligned two-line headline ("The product development system for teams and agents"), a one-line muted
subhead, and a small "New · Loops →" announcement link on the right. Below, a wide screenshot of the real app
(sidebar, an issue titled "Faster app launch", activity feed and a floating AI chat panel) is cut off by the fold.

## Key techniques
- **Left-aligned headline**, not centred: reads like an editorial statement and lines up with the app's sidebar below.
- **Real content in the screenshot**: a plausible issue, activity log and an AI agent panel ("Thinking…"), which sells the current feature set.
- **Announcement as a quiet text link** ("New · Loops →") rather than a pill above the headline.
- **The fold crops the product**, inviting a scroll. The mobile layout keeps the headline first and the UI below.
- Very low-contrast chrome so the product screenshot is the brightest thing on the page.

## Accessibility
The muted subhead and nav are low contrast on black; check them for 4.5:1. The screenshot is an image of UI, so it needs alt text that says what it shows.

## Weaknesses
It depends on a beautiful product UI. Dark-only can feel cold for consumer audiences.

> Recaptured live on 2026-10-17 with `scripts/capture.mjs` (desktop + mobile, interactions where noted). The `preview.html` rebuild from the original base pack is kept as a code starting point; the screenshots are the reference.
