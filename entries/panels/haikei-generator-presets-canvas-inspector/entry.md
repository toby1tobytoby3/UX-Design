---
title: Generator tool layout with presets on the left, a canvas with one Randomise button, settings on the right and export pinned at the bottom
pattern: panels
page_type: app
tags: [dark, minimal, interactive, b2c]
source_url: https://app.haikei.app
source_site: haikei.app
captured_at: 2026-10-19
captured_by: toby
input: url
rating: 4
why_it_works: Everything a generator needs is visible at once in three fixed columns, and the main action (a big dice button under the canvas) gives a new result in one click, so exploring is fast and the settings are only for fine-tuning.
use_when: Any configure-and-export tool: background or asset generators, chart or theme builders, product configurators, report builders.
has_example: false
---

## What it is
Haikei's free web app (no sign-up). Three columns:
- **Left**: generator presets as large visual tiles (Blob, Wave, Blurry Gradient, Circle Scatter, Blob Scene, Layered Waves…), the
  active one outlined.
- **Centre**: the canvas, with a round **Randomise (dice)** button docked to its bottom edge.
- **Right**: settings in collapsible groups (Canvas size 3:2 900×600, Variants: Solid/Outline, Interpolation: Wave/Peak/Step,
  Direction, Colour with hex fields, Shape), and **Download: SVG · PNG** pinned at the bottom.

## Key techniques
- **Presets shown as their own output**, so choosing is visual.
- **One dominant action** (randomise) on the canvas itself; settings refine rather than create.
- **Segmented controls with icons and labels** for small choice sets; hex input next to each swatch.
- **Export always visible**, never behind a menu.

## Accessibility
Measured: of the first 30 buttons, 13 have no accessible name (icon-only: the account button, direction arrows, colour and
visibility buttons). The preset tiles and labelled segments are named. Label every icon button.

## Weaknesses
- No undo for Randomise, so a result you liked is easy to lose; keep a short history.
- Fixed three columns don't adapt to small screens.

## Related entries
- `panels/vscode-workbench-parts` (a heavier workspace layout)

> Captured live on 19 Oct 2026 with Playwright (screenshots plus keyboard probes). Supplied as an Instagram reel screenshot; the live site replaced it.
