---
title: Named materials that bundle radius, fill, ring and shadow per elevation role
pattern: design-tokens
page_type: docs
tags: [minimal, dark, saas, devtools, accessible]
source_url: https://vercel.com/geist/materials
source_site: vercel.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: Elevation is one decision, not four. Each named material (base, small, medium, large, tooltip, menu, modal, fullscreen) sets radius, fill, hairline ring and a layered translucent shadow together, so surfaces stay consistent and dark mode gets its own ring instead of a darker shadow.
use_when: Setting up the surface and elevation tokens for an app: cards, popovers, menus, dialogs and full-screen takeovers in light and dark themes.
has_example: false
---

## What it is
Vercel's Geist design system page for **Materials**: eight presets in two groups. *Surface* (on the page): `material-base`,
`material-small`, `material-medium`, `material-large`. *Floating* (above the page): `material-tooltip`, `material-menu`,
`material-modal`, `material-fullscreen`. The page ends with written rules: pick the type from where the element sits,
"Don't stack two Materials on the same element", align the material with the element's z-index band, and "Favor the lowest
elevation that still reads as elevated".

## Key techniques
Values read from the live page's computed styles (light / dark):
- **Radius rises with elevation:** 6px (base, small, tooltip) → 12px (medium, large, menu, modal) → 16px (fullscreen).
- **A hairline ring instead of a border**, drawn as the first box-shadow: `0 0 0 1px rgba(0,0,0,.08)` in light,
  `0 0 0 1px rgba(255,255,255,.145)` in dark. Dark mode relies on the ring for separation because shadows barely show on black.
- **Layered, translucent shadows.** Menu (light): `0 1px 1px rgba(0,0,0,.02), 0 4px 8px -4px rgba(0,0,0,.04), 0 16px 24px -8px rgba(0,0,0,.06)`.
  Modal steps the offsets up to `0 8px 16px -4px` and `0 24px 32px -8px`. Negative spread keeps the shadow under the surface rather than a halo around it.
- **Dark shadows are stronger, not just inverted:** medium goes from `rgba(0,0,0,.04) 0 2px 2px` (light) to `rgba(0,0,0,.32) 0 2px 2px` (dark).
- Same fill for every material in each theme (`#fff` light, `rgb(10,10,10)` dark): elevation comes from ring + shadow, not from tinting the fill.
  (Research note: Atlassian, Primer and Linear lighten raised dark surfaces by about 2–3 OKLCH L points instead; see `research/A1-A4-colour-materials.md`.)

## Accessibility
The page states that materials are decorative chrome: semantics live on the wrapper (`role="dialog"`, `role="tooltip"`),
and elevation must not be conveyed by shadow alone. Focusable children still need their own focus-visible ring.
The 1px ring at 8% black is about 1.2:1 against white, which is fine for decoration but not a boundary for interactive controls (WCAG 1.4.11).

## Weaknesses
- Eight named types is more than most apps need; collapse to base / raised / overlay / modal if your app has fewer layers.
- Uniform dark fill makes stacked dark surfaces hard to tell apart without the ring; consider the lighter-surface approach for dense apps.
- Shadow values are Vercel's; the structure is the reference, not the exact numbers.

## Related entries
- `design-tokens/geist-colour-scales`: the colour scales these materials sit on
- `design-tokens/radix-12-step-colour-scale`: an alternative scale with step roles

> Captured live on 2026-10-17 with `scripts/capture.mjs` (light) and a Playwright run with `colorScheme: 'dark'` (dark);
> shadow and radius values come from computed styles on the page.
