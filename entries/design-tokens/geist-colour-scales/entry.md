---
title: Ten-step colour scales with gray vs gray-alpha and translucent-shadow rules
pattern: design-tokens
page_type: docs
tags: [minimal, dark, saas, devtools, accessible]
source_url: https://vercel.com/geist/colors
source_site: vercel.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: Ten 10-step scales with fixed roles per step, a separate gray-alpha scale for anything that must let the background show through, and small do/avoid panels that show exactly where colour systems go wrong (double alpha borders, opaque shadows).
use_when: Defining the colour tokens for a product UI that ships light and dark themes, especially neutrals, borders and status colours.
has_example: false
---

## What it is
Geist's **Colors** page: two backgrounds plus ten scales (Gray, Gray alpha, Blue, Red, Amber, Green, Teal, Purple, Pink),
each with 10 steps, swapped wholesale between light and dark via `prefers-color-scheme`. P3 values are used on supporting
displays. Below the grid are rules with side-by-side do/avoid demos: "Choose gray or gray-alpha", "Draw each border once",
"Keep material shadows translucent", and a two-backgrounds section (Background 1 default, Background 2 used sparingly).

## Key techniques
- **Tokens are CSS variables per step** (`--ds-gray-100` … `--ds-gray-1000`, `--ds-background-100/200`), redefined per theme rather than inverted.
  Light: background-100 `hsl(0 0% 100%)`, gray-1000 `hsl(0 0% 9%)`. Dark: background-100 `hsl(0 0% 4%)`, gray-1000 `hsl(0 0% 93%)`.
- **Contrast we computed from the live tokens** (WCAG 2.x):
  | Pair | Light | Dark |
  |---|---|---|
  | gray-1000 on background-100 (primary text) | 17.9:1 | 16.9:1 |
  | gray-900 on background-100 (secondary text) | 8.5:1 | 7.6:1 |
  | gray-700 on background-100 | 3.2:1 | 6.1:1 |
  | white on blue-700 (primary button) | 4.4:1 | 4.4:1 |
  | blue-900 as text on background | 5.3:1 | 7.9:1 |
  So gray-700 is not a text colour in light mode, and white-on-blue-700 sits just under 4.5:1 for small text.
- **Gray vs gray-alpha:** solid gray for text, fills and dividers; alpha only for overlays and shadows. Alpha borders that overlap produce darker intersections ("Draw each border once").
- **Translucent shadows** blend into any background; opaque grey shadows leave a halo (shown side by side).

## Accessibility
Text steps (900, 1000) clear AA comfortably in both themes. Watch the mid steps: gray-700 fails as light-mode text, and
the blue primary button with white label is 4.44:1, which fails AA for text under 18.66px bold / 24px regular.

## Weaknesses
- HSL-defined scales: perceptual steps are uneven compared with an OKLCH-generated scale (see `research/A1-A4-colour-materials.md`).
- Step roles are less explicit than Radix's (no published "step 3 = hover background" mapping on this page).

## Related entries
- `design-tokens/geist-materials-elevation`: the surface/elevation layer built on these colours
- `design-tokens/radix-12-step-colour-scale`: 12-step scale with an explicit job per step

> Captured live on 2026-10-17 (light via `scripts/capture.mjs`, dark via Playwright `colorScheme: 'dark'`). Token values
> were read from the page's CSS custom properties; contrast ratios computed from those values.
