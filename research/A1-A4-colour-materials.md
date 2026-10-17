# A1 Colour and tokens · A4 Materials, depth and elevation: research

Researched 2026-10-17 for a desktop web app on React/Next + Tailwind v4 (no shadcn). Every URL below was
checked with `curl -sL -o /dev/null -w "%{http_code}" -A "Mozilla/5.0"`. Every package was checked with
`npm view <pkg> version license time.modified`, plus `time[<version>]` because `time.modified` also changes
on metadata-only and prerelease publishes. Browser support comes from `@mdn/browser-compat-data` 8.1.6.
Claims marked **(measured)** were computed from shipped CSS or token files fetched today. Claims marked
**unverified** were not confirmed. Contrast numbers use the WCAG 2.x formula.

---

## A1 Colour and tokens

### 1. Topics the guide must answer
1. **Which colour space should we write and generate palettes in?** OKLCH or HSL, and sRGB or P3.
2. **What shape should a scale take?** How many steps, and what each step is for (background, border, solid, text).
3. **What token layers and names do we need, and where do they live?** Primitive → semantic → (rarely) component.
   Do we use Tailwind `@theme` alone, or Style Dictionary/DTCG?
4. **How do we build dark mode without inverting light mode?** Covers the surface ladder, desaturation, system
   preference plus override, and `light-dark()` versus `[data-theme]`.
5. **Which contrast targets apply, and which check is the gate?** WCAG 2.2 AA is the gate. APCA is advisory.
   Also covers non-text contrast and decorative borders.
6. **How do accent and brand colours work in each theme?** The same role needs a different step per theme.
   Also covers foreground colour on solid accents.
7. **How do status colours, colour-vision deficiency and user preferences work?** Status colours never rely on
   colour alone. Covers `prefers-contrast`, `forced-colors`, and high-contrast or colour-blind theme variants.
8. **How do data-viz colours fit in?** The chart palette is its own tier, validated against each theme's
   surfaces. Link to `guides/charts.md`.

Dropped: HCT/Material dynamic colour from a seed. It only matters for user-seeded themes (see tools).

### 2. Recommended defaults
| Topic | Default | Why (evidence) | When to depart |
|---|---|---|---|
| Colour space | Write tokens in **`oklch()`**. Never generate ramps in HSL. Keep a hex/sRGB fallback only if a supported browser lacks OKLCH. | OKLCH is perceptually uniform, so equal L reads as equal lightness across hues, and it can encode P3 ([Evil Martians](https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl)). Tailwind v4 moved its whole palette "from rgb to oklch" to use the wider gamut ([Tailwind v4 post](https://tailwindcss.com/blog/tailwindcss-v4)). `oklch()` support: Chrome 111, Firefox 113, Safari 15.4. Linear rebuilt theme generation on LCH instead of HSL for the same reason ([Linear](https://linear.app/now/how-we-redesigned-the-linear-ui)). | Brand guidelines fixed in hex: store the hex as the primitive and derive the rest. |
| Gamut | Design in sRGB-safe chroma. Add P3 boosts with `@media (color-gamut: p3)` and `@supports (color: oklch(0 0 0))`. | Geist does exactly this in production **(measured: vercel.com CSS)**. At max chroma the brightest step moves around with hue ([Evil Martians, Tailwind OKLCH](https://evilmartians.com/chronicles/better-dynamic-themes-in-tailwind-with-oklch-color-magic)). | Marketing or illustration where vividness matters more than consistency. |
| Scale shape | **12 functional steps per hue**, Radix style: 1–2 app backgrounds, 3–5 component backgrounds (normal, hover, active), 6–8 borders (subtle, default, strong/focus), 9–10 solid (normal, hover), 11–12 text (low, high contrast). Each hue also gets an **alpha twin**. | Radix documents each step's job. Steps 11 and 12 are tuned to Lc 60 and Lc 90 APCA on step 2 ([Radix scale](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)). Geist uses 10 steps with the same roles (1–3 bg, 4–6 border, 7–8 high-contrast bg, 9–10 text) ([Geist colors](https://vercel.com/geist/colors)). | Tailwind's 50–950 is fine for marketing. For app UI, map 50–950 onto roles rather than using raw shades in components. |
| Token layers | **Two layers in CSS.** (a) Primitives in `@theme` (`--color-gray-1…12`, `--color-blue-1…12`). (b) Semantic tokens that components use: `--color-bg`, `--color-bg-subtle`, `--color-surface`, `--color-surface-raised`, `--color-surface-overlay`, `--color-fg`, `--color-fg-muted`, `--color-border`, `--color-border-strong`, `--color-accent`, `--color-accent-fg`, `--color-accent-text`, `--color-{danger,warning,success,info}{,-subtle,-text}`, `--color-focus`. Use `@theme inline` so the utilities point at the semantic variables. | Primer uses the same role grammar (`--bgColor-default`, `--fgColor-muted`, `--borderColor-default`, `--bgColor-danger-emphasis/-muted`) **(measured: @primer/primitives 11.10.0)**. Atlassian uses `elevation.surface.*` and `color.background.*` ([Atlassian](https://atlassian.design/foundations/color-new)). Component tokens multiply maintenance for a single-app team. | Add a component layer only when you ship a component library to other apps. |
| Token source | **Tailwind v4 `@theme` in CSS is the source of truth.** Adopt Style Dictionary v5 with DTCG JSON only when tokens must also reach Figma, iOS/Android or email. | DTCG published its first stable format, 2025.10 ([designtokens.org](https://www.designtokens.org/)). Style Dictionary documents DTCG support ([docs](https://styledictionary.com/info/dtcg/)). | Multi-platform products, or a design team that syncs Figma variables. |
| Dark mode | **Design it, don't invert it.** Background L ≈ 14–17% (not pure black), with each raised surface **+2–3 L**. Lower chroma on large fills. Text at L ≈ 93–98%, not pure white. Follow `prefers-color-scheme` by default and let the user override with `[data-theme]`. In Tailwind: `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`. Set `color-scheme: light dark` so form controls and scrollbars follow. | Apple: dark colours "aren't necessarily inversions", and dark mode uses base and elevated backgrounds ([HIG Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)). Linear's dark levels `#08090a/#0f1011/#141516/#191a1b` are OKLCH L 13.9/17.2/19.5/21.7 **(measured: linear.app CSS)**. Its light levels step only about −1.2 L. | Media or immersive apps can be dark-only (Apple names Stocks as an example). Use `light-dark()` (Baseline: Chrome 123, Firefox 120, Safari 17.5) for one-off pairs, but it can't express a user override on its own. |
| Contrast gate | **WCAG 2.2 AA is the pass/fail gate:** 4.5:1 body text, 3:1 large text (≥24px, or ≥18.66px bold), 3:1 for UI component boundaries, states and focus indicators ([1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)). Aim for **7:1 on primary body text**. Use **APCA as an advisory second check** (Lc ≥ 75 body, Lc ≥ 60 secondary), especially for dark mode, where WCAG 2 overrates light-on-dark pairs. | The WCAG 3 Working Draft of 10 Sept 2026 says the text contrast measure is "@@[to be determined]" and does not name APCA **(measured: w3.org/TR/wcag-3.0)**. APCA therefore has no conformance standing yet. Apple asks for a 4.5:1 minimum and to "strive for 7:1" ([HIG](https://developer.apple.com/design/human-interface-guidelines/dark-mode)). | Decorative separators don't need 3:1. Linear's default dark border is 1.3:1 against the page **(measured)**. An input boundary that people need to find the control does need 3:1. |
| Accent per theme | **The same role maps to different steps in each theme.** Example from Tailwind: white text on `blue-500` is 3.76:1 (fails AA), on `blue-600` it is 5.26:1. Accent *text* on `zinc-950`: `blue-600` 3.78:1 (fails), `blue-400` 7.54:1 **(measured, sRGB-clipped conversion)**. So `--color-accent` = 600 light / 500 dark, and `--color-accent-text` = 600–700 light / 300–400 dark. Pick `--color-accent-fg` per hue: Radix lists Sky, Mint, Lime, Yellow and Amber step 9 as needing dark text ([Radix](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)). | Saturated brand colours vibrate on dark and drop below AA as text. | `contrast-color()` (Chrome 147, Firefox 146, Safari 26) can pick black or white automatically once our browser floor allows it. |
| Status and CVD | Four status hues (danger, warning, success, info), each with `-subtle` bg, `-border` and `-text`. **Always pair with an icon or label.** Use Primer's colour-blind themes as the model for the variant we may add later. | Primer ships **14 themes**: light/dark × default, high-contrast, colorblind and tritanopia, plus dark-dimmed **(measured: dist/css/functional/themes)**. | Use a red/green P&L convention only with +/− signs or labels. |
| User preferences | Support `prefers-contrast: more` (Tailwind's `contrast-more:` variant) by switching to the high-contrast semantic map. Under `forced-colors: active` (Tailwind's `forced-colors:` variant), use system colours (`CanvasText`, `Highlight`) for borders and focus. | Apple: every custom colour needs an increased-contrast variant ([HIG Color](https://developer.apple.com/design/human-interface-guidelines/color)). Linear's generator has a contrast input for exactly this ([Linear](https://linear.app/now/how-we-redesigned-the-linear-ui)). | – |
| Data-viz tier | Keep `--chart-1…5` as a separate tier and validate it **against each theme's surface**. Our current chart order (`guides/charts.md`) passes 3:1 against dark surfaces (4.0–8.7:1). **On white only blue (4.42) and orange (3.2) pass. Green 2.82, amber 2.17 and pink 2.69 fail 3:1 for 1.4.11** **(measured)**. | Graphical objects needed to understand content fall under 1.4.11. | Marks with direct labels or a 1px darker outline, or charts with a table view, can keep lighter fills. Flag this to the charts guide. |

### 3. Tools
| Tool | npm view (version · license · time.modified) | Best at | React/Next/Tailwind fit | Flags |
|---|---|---|---|---|
| **tailwindcss v4** (theme) | `4.3.3` · MIT · 2026-10-16T11:37:30Z (4.3.3 published 2026-07-16) | OKLCH default palette. `@theme` tokens become CSS variables and utilities. `@custom-variant` for themes. Built-in `contrast-more:` and `forced-colors:` variants **(measured: dist/lib.js)**. | Native. This is our stack. | None |
| **@radix-ui/colors** | `3.0.0` · MIT · 2025-12-24T01:25:31Z (3.0.0 published **2023-10-02**) | The best documented 12-step functional scales, with light, dark, alpha and P3 variants. Import the CSS files and map them into `@theme`. | Plain CSS variables, so a good fit. No React dependency. | Version is frozen since 2023. Treat it as a stable dataset, not abandoned code. |
| **culori** | `4.0.2` · MIT · 2026-04-03T05:53:30Z (4.0.2 published 2025-06-27) | Generating and checking ramps in scripts: `oklch`, `toGamut`, `clampChroma`, `wcagContrast` **(measured: src/index.js)**. Tree-shakable. | Node or build scripts. Keep it out of the client bundle. | None |
| **colorjs.io** | `0.7.1` · MIT · 2026-07-24T16:34:21Z | The reference implementation of CSS Color 4/5 (Lea Verou and Chris Lilley). Gamut mapping per spec. **Contrast methods WCAG21, APCA, Lstar, Michelson, Weber and DeltaPhi** **(measured: src/contrast/)**. | The best fit for a token-lint script that checks every semantic pair for WCAG and APCA. 15.8 MB unpacked, so dev-only. | Its APCA implementation is MIT, but Myndex attaches trademark terms to the name "APCA". Label output "APCA-style Lc" if published. |
| **@adobe/leonardo-contrast-colors** | `1.1.0` · Apache-2.0 · 2026-10-01T01:33:46Z (1.1.0 published 2026-02-18) | Generating colours *to a target contrast ratio* against a background. Best for building a high-contrast theme. Web UI at leonardocolor.io. | Build time only. | **Pulls in `apca-w3` (non-OSI, see below) as a dependency.** Fine for internal build tooling, but get a licence review before redistributing. |
| **style-dictionary** | `5.7.0` · Apache-2.0 · 2026-10-16T12:41:17Z | Turning one DTCG JSON source into CSS, iOS, Android and JS outputs. | Only needed when tokens leave the web app. Runner-up is `@terrazzo/cli` `2.9.0` · MIT · 2026-10-14 (DTCG-first). | None |

Assessed and not recommended as defaults:
- **apca-w3** `0.1.9` · "Limited W3 License" · 2022-07-04. Not OSI. The licence restricts use to WCAG
  web-content purposes and says other uses fall under "AGPU v3". It also says "Patent(s) pending" **(measured:
  LICENSE.md)**. Don't depend on it directly.
- **@material/material-color-utilities** `0.4.0` · Apache-2.0 · 2026-01-21. HCT and dynamic schemes from a seed
  colour. Only useful if users pick their own theme colour.
- **@primer/primitives** `11.10.0` · MIT · 2026-10-12. Use it as a reference dataset for role naming and theme
  variants, not as a dependency.

### 4. Public reference pages
| URL | HTTP | Best-in-class moment | Suggested capture |
|---|---|---|---|
| https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale | 200 | Each step's job shown with live examples (bg, hover, border, solid, text) and the APCA guarantee for steps 11–12. The clearest scale doc anywhere. | Full page, light and dark. `prefers-color-scheme` works: `<html>` gets `dark-theme` **(measured)**. Also capture https://www.radix-ui.com/colors (200), the scale grid. |
| https://vercel.com/geist/colors | 200 | Do/Don't panels: "Choose gray or gray-alpha", "Draw each border once", "Keep material shadows translucent". Also the 10-step roles. | Light and dark via `prefers-color-scheme` (bg #fff → #000, **measured**). Capture the "Scales" grid and each Do/Avoid pair. Right-click on a swatch copies the value. |
| https://linear.app/now/how-we-redesigned-the-linear-ui | 200 | Theme generation from **three inputs (base, accent, contrast)** in LCH, replacing 98 hand-set variables. The best write-up of generated light, dark and high-contrast themes. | Article screenshots of the theme generator. The live dark ladder is on https://linear.app (200, dark-only, `#08090a`). |
| https://primer.style/primitives/colors | 200 | Full functional-token reference (`bgColor-*`, `fgColor-*`, `borderColor-*`) across 14 themes, including colour-blind and tritanopia. | Does **not** follow `prefers-color-scheme` (stayed white, **measured**). Click "Switch to dark mode" (selector unverified). Capture the token tables. |
| https://oklch.com | 200 | Evil Martians' picker: L/C/H sliders with sRGB, P3 and Rec2020 gamut boundaries drawn on the charts. The best teaching aid for OKLCH. | Dark via `prefers-color-scheme` (**measured**). 8 canvases. Capture at default, then drag C past the sRGB edge to show the fallback warning (interaction unverified). |
| https://developer.apple.com/design/human-interface-guidelines/dark-mode | 200 | "Not inversions" rule, base and elevated backgrounds, 4.5:1 minimum and 7:1 target, testing with Increase Contrast plus Reduce Transparency. | Light and dark via `prefers-color-scheme` (**measured** on the HIG). Capture the base-vs-elevated figure. |
| https://atlassian.design/foundations/color-new | 200 | Semantic token taxonomy (`color.background.*`, `color.text.*`, `color.border.*`, `elevation.surface.*`) with usage rules. | Follows `prefers-color-scheme` (rgb(31,31,33) dark, **measured** on the elevation page). |
| https://tailwindcss.com/docs/colors | 200 | The full v4 OKLCH palette with values. Shows our stack's starting point. | Dark via `prefers-color-scheme`. Capture a swatch row with hover (the value tooltip is unverified). |

Also verified (200) and useful as citations, not captures: https://stripe.com/blog/accessible-color-systems ·
https://huetone.ardov.me (LCH/APCA palette editor) · https://leonardocolor.io · https://apcacontrast.com.

### 5. Changes to `research/categories.md` row A1
- **Tools.** Keep Radix Colors, Tailwind v4 and Leonardo. Flag Leonardo's transitive `apca-w3` licence.
  Demote Style Dictionary to "only if tokens leave the web app". **Add culori and colorjs.io**: they are what we'd
  actually use to generate ramps and lint contrast.
- **References.** The Linear *homepage* isn't an A1 reference. Its LCH theme-generation post is. Add **Radix's
  scale doc** and **oklch.com**. Primer is right, but name the *primitives/colors* page and its 14 themes. Apple
  HIG is right for dark-mode principles, but its token values are native-only.
- **Covers.** Add "status colours and colour-blind variants", "forced-colors / high contrast" and "chart-colour
  tier". Note in Covers that **WCAG 2.2 is the gate and APCA is advisory** as of the 2026-09 WCAG 3 draft.

---

## A4 Materials, depth and elevation

### 1. Topics the guide must answer
1. **What does the elevation scale look like?** How many levels, and which components live on each.
2. **When do we use shadow, border or surface tint, and how does that change between light and dark?**
3. **How do we construct a shadow?** Layered key plus ambient, translucent, and with a ring.
4. **Should a desktop web app use glass at all, and where?** Navigation and overlay layer only. No glass on glass.
5. **What is the glass recipe and its fallbacks?** Covers `backdrop-filter` values, tint opacity for legibility,
   `@supports`, `prefers-reduced-transparency` (including Safari's lack of support), `prefers-contrast`,
   `forced-colors`, and performance.
6. **What do we copy from Liquid Glass, and what do we skip?**
7. **How do radii and concentric corners work?** Radius tied to elevation and size, inner = outer − padding,
   and `corner-shape` squircles.
8. **How should interaction states and scrims behave?** Hover and press via surface tint rather than lift,
   modal scrims, and scroll-overflow shadows.

### 2. Recommended defaults
| Topic | Default | Why (evidence) | When to depart |
|---|---|---|---|
| Scale | **Four levels plus a scrim.** `sunken` (wells, kanban columns), `base` (page, flat cards with border), `raised` (draggable or emphasised cards, sticky headers), `overlay` (menus, popovers, dialogs, toasts). Tooltip and modal can be sub-steps of `overlay`. Tokens: `--surface-{sunken,base,raised,overlay}` + `--shadow-{raised,overlay}` + `--scrim`. | Atlassian uses exactly sunken, default, raised and overlay, plus "overflow" ([Atlassian Elevation](https://atlassian.design/foundations/elevation)). Geist has 4 surface plus 4 floating materials ([Geist Materials](https://vercel.com/geist/materials)). M3 has 6 levels at 0/1/3/6/8/12 dp, which is more than a web app needs **(measured: material-web `_md-sys-elevation.scss`)**. | Canvas or whiteboard apps with many stacked floating panels may need a fifth level (Geist's `fullscreen`). |
| Light theme depth | **Hairline plus a soft layered shadow.** A 1px ring at about 8% black is the edge. Shadows are 2–3 layers at **4–12% alpha**, and the y-offset grows with level. Example raised: `0 0 0 1px oklch(0 0 0/.08), 0 1px 2px oklch(0 0 0/.06)`. Example overlay: `0 0 0 1px oklch(0 0 0/.08), 0 8px 16px -4px oklch(0 0 0/.08), 0 24px 32px -8px oklch(0 0 0/.10)`. | Geist `--ds-shadow-border-base: 0 0 0 1px #00000014`, with large = `0 2px 2px #0000000a, 0 8px 16px -4px #0000000a`. Primer light `floating-small` uses a ring at about 25%, then 4% and 12% layers **(measured)**. Fluent combines a sharp "key" shadow with a soft "ambient" shadow ([Fluent Elevation](https://fluent2.microsoft.design/elevation)). | Use Tailwind's `shadow-sm/md/lg` (single-hue, 10% alpha) for prototypes. Replace them before shipping. |
| Dark theme depth | **Lighter surface plus a translucent white ring plus a much stronger shadow.** Surfaces step +2–3 L per level. The ring is `oklch(1 0 0 / .08–.15)`. Shadows are **35–80% black**, because they barely show on dark. | Atlassian: "Shadows can be harder to see in dark mode… the higher the elevation, the lighter the surface". Geist dark ring `rgba(255,255,255,.145)`. Primer dark `floating-small: 0 0 0 1px #3d444d, …#01040966…`. Linear dark `--shadow-high: 0 7px 32px #00000059` against light `#0000000f` **(all measured)**. Apple: dark backgrounds switch from base to elevated for popovers and sheets ([HIG](https://developer.apple.com/design/human-interface-guidelines/dark-mode)). | Pure-black (OLED) themes can't lighten the base. Rely on ring and surface tint instead. |
| Shadow colour | **Translucent, never opaque grey.** Optionally tint shadows toward the background hue. | Geist "Keep material shadows translucent… Opaque shadows leave a gray halo" ([Geist colors](https://vercel.com/geist/colors)). [Josh Comeau, Designing Shadows](https://www.joshwcomeau.com/css/designing-shadows/). | – |
| Hover and press | Change **surface tint** (`surface.hovered/.pressed`) instead of raising elevation. Never do both. | Atlassian: "Don't combine elevation transitions and hovered and pressed tokens", and elevation changes "are harder to see than surface color changes" on small UI. Geist: "favor the lowest elevation that still reads". | Draggable cards can lift (raised → overlay) while dragging. |
| Where glass goes | **Solid by default.** Glass is allowed only on the **functional layer above scrolling content**: sticky app header, floating toolbars, command palette, menus over imagery. **No glass on glass. No glass in the content layer.** | Apple: Liquid Glass is "a distinct functional layer for controls and navigation", and "Don't use Liquid Glass in the content layer… Use … sparingly" ([HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials)). "Always avoid glass on glass" ([WWDC25 Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/)). Fluent restricts Acrylic to "transient, light-dismiss surfaces such as popovers and menus" ([Fluent Material](https://fluent2.microsoft.design/material)). NN/g on iOS 26: "anything placed on top of something else becomes harder to see" ([NN/g](https://www.nngroup.com/articles/liquid-glass/)). | Marketing heroes and media viewers can be more decorative. Content-dense tables never get glass. |
| Glass recipe | `background: color-mix(in oklch, var(--surface-overlay) 72%, transparent); backdrop-filter: blur(24px) saturate(1.4);` plus the level's ring and shadow. **The tint must still pass 4.5:1 for its text against the worst plausible backdrop**, which in practice means ≥70% opaque behind text. | Radix Themes translucent panel: `rgba(255,255,255,.7)` with `blur(64px)` **(measured: @radix-ui/themes styles.css)**. Live blurs: Linear header 20px, Raycast window 30px, Raycast nav 5px **(measured)**. For "clear" glass over bright media, Apple adds a **35% dark dimming layer**. `backdrop-filter`: Chrome 76, Firefox 103, Safari 18 unprefixed (`-webkit-` before). | Glass over a known dark media backdrop can go to about 50% tint. |
| Fallbacks | (1) `@supports not (backdrop-filter: blur(1px))` → opaque surface. (2) `@media (prefers-reduced-transparency: reduce)` → opaque, no blur. (3) `@media (prefers-contrast: more)` → opaque plus stronger border. (4) `@media (forced-colors: active)` → `border: 1px solid CanvasText`. Tailwind needs a custom variant: `@custom-variant reduce-transparency (@media (prefers-reduced-transparency: reduce));` (no built-in variant in 4.3.3, **measured**). | **`prefers-reduced-transparency` works only in Chrome/Edge 118+. Firefox has it behind a flag and Safari has no support** **(measured: BCD 8.1.6)**. So Mac users with Reduce Transparency on Safari get glass anyway. That is why the default tint must be legible on its own. Apple: Reduce Transparency "makes Liquid Glass frostier", and Increase Contrast adds "a contrasting border" (WWDC25 219). | – |
| Performance | Keep blur radius ≤ 32px on large or sticky areas. Never animate `backdrop-filter`. Limit to 1–2 blurred layers on screen. | Blur cost grows with radius and area (general compositor behaviour; **unverified** for specific numbers). | – |
| Liquid Glass lessons | **Copy:** the layer split (content vs controls), the scroll-edge fade under bars, the dimming layer, concentric shapes, and system-setting adaptations. **Skip:** refraction and lensing via SVG displacement filters. | Refraction demos (for example [kube.io](https://kube.io/blog/liquid-glass-css-svg/), 200) rely on SVG filters inside `backdrop-filter`, which works only in Chromium (**unverified** for current Safari/Firefox). NN/g documents real legibility costs. | One-off marketing moments, behind `@supports`. |
| Radii | Radius belongs to the **material and size**, not to each component. Small controls 6px, cards, menus and modals 12px, fullscreen sheets 16px (Geist's values). Map onto Tailwind `--radius-md` (6px), `--radius-xl` (12px) and `--radius-2xl` (16px). **Nested: inner radius = outer radius − padding**, floored at about 4px. Capsules only for standout actions on desktop. | Geist materials: base and small 6px, medium, large, menu and modal 12px, fullscreen 16px ([Geist](https://vercel.com/geist/materials)). Apple: "concentric shapes calculate their radius by subtracting padding from the parent's", and capsules in "dense desktop environments… are best used for standout actions"; macOS small controls keep rounded rectangles ([WWDC25 356](https://developer.apple.com/videos/play/wwdc2025/356/)). | `corner-shape: squircle` (Chrome 139+, others in preview, **measured**) as a progressive enhancement only. |
| Scrim and overflow | Modal scrim `oklch(0 0 0 / .4)` light and `/ .6` dark, with no blur by default. Show scroll edges with an overflow shadow or fade, not a border. | Fluent's "Smoke" material dims what's beneath. Atlassian's "overflow" elevation is for scrolled tables. Exact alphas are our proposal (**unverified** against a source). | – |

### 3. Tools
| Tool | npm view (version · license · time.modified) | Best at | React/Next/Tailwind fit | Flags |
|---|---|---|---|---|
| **tailwindcss v4** (shadow, blur and radius tokens) | `4.3.3` · MIT · 2026-10-16T11:37:30Z | `--shadow-*`, `--inset-shadow-*`, `--drop-shadow-*`, `--blur-xs…3xl` (4–64px), `--radius-xs…4xl`, all overridable in `@theme`. Built-in `contrast-more:` and `forced-colors:` variants. | Native. Override the default shadows (single hue at 10% alpha, no ring) with our 4-level tokens. | No reduced-transparency variant, so add a custom one. |
| **@primer/primitives** | `11.10.0` · MIT · 2026-10-12T11:09:47Z | The best open dataset of *resting* and *floating* shadows per theme, including dark with ring and high-contrast. Copy the values and the role names. | CSS files, so they map into `@theme`. Use it as a reference, not a runtime dependency. | None |
| **@radix-ui/themes** | `3.3.0` · MIT · 2026-01-31T01:08:09Z | A 6-step shadow scale built from alpha colours, plus a translucent or solid `panelBackground` switch with `@supports` guards. | It's a full component library. We don't adopt it (no shadcn/Radix Themes stack), but its `styles.css` is a clean value reference. | Don't add as a dependency just for tokens. |
| **Josh Comeau Shadow Palette Generator** (web tool) | n/a (not on npm). https://www.joshwcomeau.com/shadow-palette/ is 200 | Generating layered, hue-tinted shadows with low, medium and high elevation output as CSS variables. | Paste the output into `@theme`. | Free web tool. Check the licence of generated output (**unverified**; it's CSS values). |
| *liquid-glass-react* (assessed) | `1.1.1` · MIT · 2025-06-11T20:12:59Z | Apple-style refraction demo using SVG displacement. | React component. | **Not recommended.** No release since 2025-06. Refraction is Chromium-only. Conflicts with "solid by default". |
| *figma-squircle* (assessed) | `1.1.0` · MIT · 2024-09-19T07:51:01Z | Generating squircle SVG paths that match Figma corner smoothing. | Needs clip-path or SVG. | Stale. Prefer CSS `corner-shape` as progressive enhancement. |

### 4. Public reference pages
| URL | HTTP | Best-in-class moment | Suggested capture |
|---|---|---|---|
| https://vercel.com/geist/materials | 200 | Eight named materials that bundle radius, fill, stroke and shadow per elevation role ("the type encodes the elevation role"), plus the rule "Don't stack two Materials". The closest match to what our token layer should be. | Selector `[class*="material-"]` (8 elements, **measured**). Capture light and dark via `prefers-color-scheme`. Dark shows the 14.5% white ring. |
| https://atlassian.design/foundations/elevation | 200 | sunken/default/raised/overlay with explicit token pairs, plus the dark-mode rule "higher = lighter surface" and hover/press via tint. | Light and dark via `prefers-color-scheme` (**measured**). Capture the "Types of elevations" examples and the interaction-state demo (hover). |
| https://developer.apple.com/design/human-interface-guidelines/materials | 200 | Liquid Glass vs standard materials, regular vs clear variants, and the 35% dimming rule. The authoritative "where glass goes". | Light and dark via `prefers-color-scheme` (**measured**). Capture the regular and clear figures. Pair with https://developer.apple.com/videos/play/wwdc2025/219/ (200) for the accessibility adaptations. |
| https://www.raycast.com | 200 | A desktop-app window mock with real `backdrop-filter: blur(30px)` "material" over a colourful background, plus a blurred nav. The best web glass that stays legible. | Dark-only (bg rgb(7,8,10)). Selector `div[class*="__window"][class*="__material"]` (**measured**). Capture the hero, then scroll so content passes under `[class*="Navbar-module"]`. |
| https://linear.app | 200 | Dark surface ladder (+2–3 L per level), hairline borders at 1.3:1, a `blur(20px)` sticky header, and dark shadows at 35% vs light 6%. Best-in-class *restrained* dark depth. | Dark-only. Selector `header` (blur measured). Scroll 600px to show content under the header. Capture a product-screenshot panel for the border-not-shadow treatment. |
| https://fluent2.microsoft.design/material | 200 | Solid vs Mica vs Acrylic vs Smoke, with when to use each. The clearest "material types" taxonomy outside Apple. Companion page https://fluent2.microsoft.design/elevation (200) has key and ambient shadow formulas. | Light and dark via `prefers-color-scheme` (**measured** on the elevation page). Capture the material cards. |
| https://www.nngroup.com/articles/liquid-glass/ | 200 | The counter-evidence: legibility, tap-target and predictability failures of iOS 26 glass (Raluca Budiu, 2025-10-10). | Cite rather than capture. Screenshot the Messages-on-photo example as a "don't". |
| https://www.joshwcomeau.com/shadow-palette/ | 200 | Interactive layered-shadow generator with an elevation slider. Shows why layered tinted shadows beat a single shadow. | Dark page. Capture before and after dragging the "Oomph" and "Crispy" sliders (labels unverified). |

### 5. Changes to `research/categories.md` row A4
- **Tools.** "CSS backdrop-filter" and "Apple Liquid Glass guidance" are a platform feature and a doc, not tools.
  Replace them with **Tailwind v4 tokens + a custom `reduce-transparency` variant**, **@primer/primitives** (as a
  shadow value reference) and **Josh Comeau's shadow palette generator**. Note "no glass libraries";
  liquid-glass-react was assessed and rejected.
- **References.** **Drop Arc.** Its site (https://arc.net, 200) shows no notable materials work, and Arc is no
  longer The Browser Company's focus (**unverified**). Add **Vercel Geist Materials**, **Atlassian Elevation**,
  **Fluent 2 Material** and **Linear** (dark depth). Keep Apple and Raycast.
- **Covers.** Add "dark-mode depth (surface ladder + ring)", "radii and concentric corners" (**move "concentric
  radii" from A3 to A4**: Geist and Apple both bind radius to the material, not the layout) and "scrims and
  overflow shadows".
- **Priority.** Split it. **Elevation and dark-mode depth is P1** (every overlay and card needs it). **Glass is
  P3** for a desktop data app (solid by default, and Safari can't honour reduced transparency).

---

## Cross-cutting notes for the guide author
- One CSS file can hold both categories: primitives → semantic colour → `--surface-*`/`--shadow-*`/`--radius-*`,
  with themes `light`, `dark`, `light-hc` and `dark-hc` switched by `[data-theme]` and `prefers-*`.
- Ship a **token-lint script** (colorjs.io) that asserts WCAG 2.2 AA for every semantic fg/bg pair in every theme,
  and reports APCA Lc as a warning. It should also check the chart tier against each surface. This makes the
  defaults enforceable rather than aspirational.
- Capture tip for `scripts/capture.mjs`: Playwright 1.56.1 (in repo) emulates `colorScheme`, `contrast` and
  `forcedColors` via context options. `prefers-reduced-transparency` needs CDP `Emulation.setEmulatedMedia` in
  Chromium (protocol types list it; **unverified** end-to-end).
