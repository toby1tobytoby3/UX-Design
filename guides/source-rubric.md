# Source rubric

Every source profile (`sources/<slug>/source.md`) is scored on the same eight criteria, 1–5 each,
so `ux-find` can compare sources fairly. `score` (out of 10) = mean of the eight × 2, rounded to one decimal.
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
