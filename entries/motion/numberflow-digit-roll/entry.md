---
title: Numbers that roll digit by digit when the value changes
pattern: motion
page_type: docs
tags: [minimal, animated, open-source, accessible, dashboard]
source_url: https://number-flow.barvian.me
source_site: number-flow.barvian.me
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: When a number changes, each digit rolls in the direction of change and characters that appear or disappear slide and fade, so the eye sees what changed (and whether it went up or down) instead of a flash of new text.
use_when: Live counters, KPIs, prices, cart totals and pricing toggles where a value changes in place and the change itself is information.
has_example: false
---

## What it is
The NumberFlow docs home page: a large formatted number ("($3,243.60)") above a Shuffle button. Pressing Shuffle changes
the value and format; the frames show digits mid-roll with outgoing characters fading at the edges, settling on "42".
The `<NumberFlow value={…} />` React component handles everything from the `value` prop.

## Key techniques
- **Formatting via `Intl.NumberFormat`** (`format`, `locales` props), so currency, compact and percent formats animate correctly per locale.
- **`trend`** defaults to `Math.sign(value - oldValue)`: digits roll up for increases and down for decreases.
- Edge **mask** (`--number-flow-mask-height/width`, default `.25em` / `.5em`) fades digits as they leave, which is what makes the roll read as smooth.
- Timings are WAAPI `EffectTiming` objects (spin, transform and opacity timings are separate props), so springs can be supplied as CSS `linear()` easings.
- `<NumberFlowGroup>` keeps several numbers in sync, so adjacent values don't jitter against each other.

## Accessibility
- **`respectMotionPreference` defaults to true**: under reduced motion it swaps instantly (per its props table).
- The docs say it is accessible: the readable value is exposed as text, not as individual animated digits (verify with a screen reader in your app).
- Don't animate numbers that update several times a second; the roll becomes noise. Use it for discrete changes.

## Weaknesses
- It's a custom element under the hood; SSR shows the final value and animation starts after hydration.
- Its "Limitations" section notes constraints on certain formats; check before using with scientific or very long numbers.
- Motion's own `AnimateNumber` is in the paid Motion+ tier, so this is the free option (`research/A5-A6-motion-states.md`).

## Related entries
- `feedback/sonner-stacked-toasts`: state-change feedback with restrained motion
- `motion/nextjs-viewtransition-photo-gallery`: shared-element motion between pages

> Captured live on 2026-10-17 with a Playwright script: four frames around a Shuffle click (0, ~120, ~370 ms and settled)
> in `crop-frames.jpg`. Prop defaults read from the page's props table.
