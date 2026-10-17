---
title: Twelve-step colour scales where each step has a job
pattern: design-tokens
page_type: docs
tags: [minimal, open-source, accessible, dark]
source_url: https://www.radix-ui.com/colors
source_site: radix-ui.com
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: Every scale has the same 12 steps with fixed roles (1–2 backgrounds, 3–5 component states, 6–8 borders, 9–10 solid fills, 11–12 text), and a matching dark scale with the same roles, so components pick a step by job and theming is a variable swap.
use_when: Building the colour token layer for a React/Tailwind app that needs light and dark themes and consistent hover/active/border states across many hues.
has_example: false
---

## What it is
The Radix Colors overview: 30 hue scales plus overlays (Black/White alpha), each with 12 steps grouped under column headers
"Backgrounds", "Interactive components", "Borders and separators", "Solid colors" and "Accessible text". The page follows
`prefers-color-scheme`, so the dark capture shows the dark scales, which are designed separately rather than inverted.

## Key techniques
- **Step roles** (from the column headers): 1 app background, 2 subtle background, 3 / 4 / 5 component background default / hover / pressed,
  6 / 7 / 8 subtle border / border / strong border and focus ring, 9 / 10 solid fill and its hover, 11 low-contrast text, 12 high-contrast text.
- Hover and press are **adjacent steps** of the same hue (3→4→5, 9→10), so state changes are small and consistent everywhere.
- **Contrast we computed from `@radix-ui/colors` 3.0.0** (WCAG 2.x):
  | Pair | Blue | Gray | Green | Red |
  |---|---|---|---|---|
  | step 11 on step 2 (light) | 4.53 | 5.62 | 4.49 | 4.94 |
  | step 12 on step 2 (light) | 12.0 | 15.5 | 11.7 | 11.8 |
  | white on step 9 (light) | 3.26 | 3.32 | 3.16 | 3.91 |
  | step 11 on step 2 (dark) | 8.38 | 8.48 | 9.37 | 8.56 |
  Step 12 is safe text everywhere; step 11 sits right at the 4.5:1 line in light mode (green just under).
- Alpha variants of every scale (`blueA`) for overlays on unknown backgrounds.

## Accessibility
Radix designs steps 11–12 against APCA targets (per its docs; see `research/A1-A4-colour-materials.md`). Under WCAG 2.2,
which is still the legal benchmark, **white text on step 9 fails 4.5:1** for every hue we checked (3.2–3.9:1), so use step 9
for large text or icons, or put step 12 text on step 9 for the bright hues (amber, yellow, lime, mint, sky) as Radix itself recommends.

## Weaknesses
- Hex/P3 values, not OKLCH: generating a brand hue that matches requires their custom-palette tool.
- 30 hues is more than an app needs; pick one neutral plus accent and four status hues.

## Related entries
- `design-tokens/geist-colour-scales`: 10-step scales with gray-alpha rules
- `design-tokens/geist-materials-elevation`: surfaces and elevation on top of a scale

> Captured live on 2026-10-17 (light via `scripts/capture.mjs`, dark via Playwright `colorScheme: 'dark'`). Contrast ratios
> computed from the published `@radix-ui/colors` 3.0.0 values.
