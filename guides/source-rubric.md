# Source rubric

Every source profile (`sources/<slug>/source.md`) is scored on the same eight criteria, 1–5 each,
so `ux-find` can compare sources fairly. Put each criterion in the profile's frontmatter as `s_look, s_interact,
s_coverage, s_a11y, s_perf, s_react, s_bundle, s_licence` (1–5). `npm run catalog` computes `score` (mean × 2) and
refuses to build if any is missing, so never type a score by hand. For libraries, add a `bench/libs/<slug>` run so
the profile's numbers come from the shared benchmark.
Score only what you have checked (installed, rendered, measured or read in official docs). Mark anything
else as unverified in the profile.

| Criterion | 5 means |
|---|---|
| **Default look** | Looks finished out of the box; default palette passes our validator |
| **Interactivity** | Rich tooltips, zoom/brush, legend toggling, animated updates without custom code |
| **Coverage** | Every chart type we'd plausibly need, including specialist ones (sankey, heatmap, candlestick…) |
| **Accessibility** | Keyboard navigation of data points, screen-reader descriptions, non-colour encodings |
| **Performance** | Smooth with 100k+ points or real-time streaming |
| **React/Next fit** | Idiomatic React components, SSR/RSC-safe, typed, works with Tailwind tokens |
| **Bundle size** | Small or tree-shakable to a small core (< 50 KB gz for a typical chart) |
| **Licence & health** | Permissive licence for commercial use; active releases and maintainers |

A licence that requires payment for commercial use caps **Licence & health** at 2 and must be named in `verdict`.

## Category notes
- **Bundle size** is relative to the category. Charts: 5 ≤ 50 KB, 4 ≤ 100, 3 ≤ 150, 2 ≤ 250, 1 above.
  3D: 5 ≤ 50 KB, 4 ≤ 175, 3 ≤ 300, 2 ≤ 400, 1 above (an engine can't be as small as a chart).
- **3D Coverage** means what you can build: scene graph, instancing, loaders, post-processing, physics, XR.
- **3D Default look** means quality with minimal setup: PBR, tone mapping, environment lighting, soft shadows.
- **3D Performance** timings come from a software GPU (SwiftShader) and are only compared relative to each other.
