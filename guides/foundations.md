# Foundations: colour, tokens and materials

`ux-find` reads this for colour, theming, dark mode, contrast, surfaces, shadows, glass and radius questions, and before
proposing tokens for `our-design/`. Motion and state feedback are in `guides/motion.md`; focus and keyboard in
`guides/accessibility.md`. Everything here is a default with a reason: depart from it when the reason doesn't apply, and say why.

Research behind this guide, with every source and measurement: `research/A1-A4-colour-materials.md`.

## 1. Colour and tokens
| Default | Why | When to depart |
|---|---|---|
| Write tokens in **`oklch()`**; never generate ramps in HSL | Perceptually even: equal L reads as equal lightness across hues. Tailwind v4's palette is OKLCH; Linear rebuilt its themes on LCH for the same reason | Brand colours fixed in hex: keep the hex as the primitive, derive the rest |
| Design in sRGB-safe chroma; add P3 boosts in `@media (color-gamut: p3)` | Vercel's Geist does this in production | Marketing and illustration, where vividness wins |
| **12 steps per hue, each with a job** (Radix model): 1–2 app backgrounds, 3–5 component backgrounds (rest, hover, active), 6–8 borders (subtle, default, strong), 9–10 solid fills (rest, hover), 11–12 text (muted, default) | Components pick by role, not by shade; Radix tunes 11–12 for text contrast on step 2. But **step 9 is not automatically safe under white text**: white on blue-9 is 3.26:1 (checked, see `design-tokens/radix-12-step-colour-scale`) | Marketing pages can use Tailwind's 50–950 directly; app UI maps them onto roles |
| **Two token layers**: primitives in `@theme` (`--color-gray-1…12`), then semantic tokens components use (below), wired with `@theme inline` | GitHub Primer and Atlassian use the same grammar; a component layer multiplies upkeep for one app | Add component tokens only when shipping a library to other apps |
| Tailwind v4 `@theme` CSS is the source of truth; Style Dictionary/DTCG only if tokens must reach Figma, native apps or email | One app, one stack | Multi-platform products |
| **Design dark mode; don't invert.** Page L ≈ 14–17% (not black), each raised surface +2–3 L, lower chroma on big fills, text L ≈ 93–98%. Follow `prefers-color-scheme`, allow a `[data-theme]` override, set `color-scheme: light dark` | Apple: dark colours "aren't necessarily inversions"; Linear's measured dark ladder is L 13.9 / 17.2 / 19.5 / 21.7 | Dark-only media apps |
| **WCAG 2.2 AA is the gate**: text 4.5:1 (3:1 at ≥ 24px or ≥ 18.66px bold); component boundaries, icons and focus 3:1. Aim for 7:1 on body text. APCA only as an advisory second check | The September 2026 WCAG 3 draft still leaves the contrast method "to be determined"; APCA has no conformance standing | Decorative separators needn't hit 3:1; input boundaries people must find do |
| **One role, different steps per theme.** Checked: white on Tailwind `blue-500` is 3.76:1 (fails), on `blue-600` 5.26:1. Accent text on `zinc-950`: `blue-600` 3.78:1 (fails), `blue-400` 7.54:1. So `--color-accent` = 600 light / 500 dark, `--color-accent-text` = 600–700 light / 300–400 dark | Saturated accents drop below AA as text on dark | `contrast-color()` once our browser floor allows it |
| Status colours (danger, warning, success, info) each with `-subtle`, `-border` and `-text`, **always paired with an icon or label** | Colour alone fails colour-blind users | Red/green P&L only with +/− signs |
| Support `contrast-more:` (switch to a high-contrast semantic map) and `forced-colors:` (system colours for borders and focus) | Apple asks for an increased-contrast variant of every custom colour | – |
| Chart colours are their own tier, validated against each theme's surface (see `guides/charts.md`). On white, green, amber and pink are below 3:1 (checked: 2.82, 2.17, 2.69); all five pass on dark | WCAG 1.4.11 covers chart marks | Direct labels, a darker 1px outline or a table view relieve it |

Starter semantic tokens (names, not final values: values come from the brand when `our-design/` is filled):

```css
@theme inline {
  --color-bg: var(--gray-1);            --color-bg-subtle: var(--gray-2);
  --color-surface: var(--gray-1);       --color-surface-raised: var(--gray-2);   --color-surface-overlay: var(--gray-1);
  --color-fg: var(--gray-12);           --color-fg-muted: var(--gray-11);
  --color-border: var(--gray-6);        --color-border-strong: var(--gray-8);
  /* Check every fg/bg pair: white on Radix blue-9 is only 3.26:1 (fails); indigo-9 gives 5.21:1, blue-11 4.77:1 */
  --color-accent: var(--indigo-9);      --color-accent-fg: white;                --color-accent-text: var(--indigo-11);
  --color-danger: var(--red-9);         --color-danger-subtle: var(--red-3);     --color-danger-text: var(--red-11);
  --color-focus: var(--blue-8);
}
```

## 2. Materials, depth and elevation
| Default | Why | When to depart |
|---|---|---|
| **Four levels plus a scrim**: `sunken` (wells, kanban columns), `base` (page, flat bordered cards), `raised` (sticky headers, draggable or emphasised cards), `overlay` (menus, popovers, dialogs, toasts). Tokens `--surface-*`, `--shadow-raised`, `--shadow-overlay`, `--scrim` | Atlassian uses exactly these; Geist has 4 surface + 4 floating materials; Material's 6 levels are more than a web app needs | Canvas apps with stacked floating panels may need a fifth |
| **Light**: a 1px ring at ~8% black is the edge, plus 2–3 soft shadow layers at 4–12% alpha, offset growing with level. Overlay e.g. `0 0 0 1px oklch(0 0 0/.08), 0 8px 16px -4px oklch(0 0 0/.08), 0 24px 32px -8px oklch(0 0 0/.10)` | Geist, Primer and Fluent all combine a ring with layered key and ambient shadows | Tailwind's `shadow-*` for prototypes only |
| **Dark**: lighter surface (+2–3 L per level) plus a translucent white ring (`oklch(1 0 0 / .08–.15)`) plus much stronger shadows (35–80% black) | Shadows barely show on dark; Atlassian: "the higher the elevation, the lighter the surface". Linear's dark shadow is 35% vs 6% in light | Pure-black OLED themes rely on ring and tint |
| Shadows are translucent, never opaque grey | Geist: opaque shadows "leave a gray halo" | – |
| Hover and press change **surface tint**, not elevation; never both | Atlassian: elevation changes are hard to see on small UI | Dragged cards may lift while dragging |
| **Solid by default.** Glass only on the functional layer above scrolling content (sticky header, floating toolbar, command palette, menus over imagery). **No glass on glass, no glass in content** | Apple's Liquid Glass guidance; Fluent limits Acrylic to transient surfaces; NN/g documents legibility costs | Marketing heroes and media viewers |
| Glass recipe: `background: color-mix(in oklch, var(--surface-overlay) 72%, transparent); backdrop-filter: blur(24px) saturate(1.4);` plus the level's ring and shadow. Text on glass must pass 4.5:1 against the worst plausible backdrop (in practice ≥ 70% opaque) | Radix Themes uses 70% white + blur; measured blurs: Linear header 20px, Raycast 30px | Known dark media backdrop: ~50% tint |
| Glass fallbacks: opaque under `@supports not (backdrop-filter: blur(1px))`, `prefers-reduced-transparency: reduce` (custom Tailwind variant), `contrast-more:`, and `forced-colors` (`border: 1px solid CanvasText`) | **Safari doesn't support `prefers-reduced-transparency`**, so the default tint must already be legible | – |
| Blur ≤ 32px on large or sticky areas; at most 1–2 blurred layers on screen; never animate `backdrop-filter` | Blur cost grows with radius and area | – |
| Radius belongs to the material and size: controls 6px, cards, menus and dialogs 12px, full-screen sheets 16px. Nested: **inner radius = outer radius − padding** (minimum ~4px). Capsules only for standout actions | Geist's material radii; Apple's concentric-corner rule | `corner-shape: squircle` as an enhancement (Chrome only) |
| Modal scrim `oklch(0 0 0 / .4)` light, `/ .6` dark, no blur; show scroll overflow with a shadow or fade, not a border | Fluent "Smoke"; Atlassian "overflow" | Exact alphas are our proposal |

## 3. Enforce it
Defaults that aren't checked drift. When `our-design/` gets real tokens, add a token-lint script (colorjs.io, MIT, dev-only)
that asserts WCAG AA for every semantic foreground/background pair in every theme, reports APCA as a warning, and checks
the chart tier against each surface. Avoid depending on `apca-w3` directly: its licence is not open source.

## References
Live references (patterns): search `catalog.json` for `pattern: design-tokens`. Tools: Tailwind v4 (`@theme`), Radix Colors
(scales), culori or colorjs.io (scripts), Primer primitives (shadow values to copy), Josh Comeau's shadow palette generator.
