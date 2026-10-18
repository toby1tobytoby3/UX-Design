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
**Six-month maintenance gate:** no meaningful release or code/docs commit in the last six months also caps **Licence & health**
at 2 (star counts, bot commits, badge edits and `pushed_at` don't count). Record the date of the evidence in the profile.

## Category notes
- **Bundle size** is relative to the category. Charts: 5 ≤ 50 KB, 4 ≤ 100, 3 ≤ 150, 2 ≤ 250, 1 above.
  3D: 5 ≤ 50 KB, 4 ≤ 175, 3 ≤ 300, 2 ≤ 400, 1 above (an engine can't be as small as a chart).
- **3D Coverage** means what you can build: scene graph, instancing, loaders, post-processing, physics, XR.
- **3D Default look** means quality with minimal setup: PBR, tone mapping, environment lighting, soft shadows.
- **3D Performance** timings come from a software GPU (SwiftShader) and are only compared relative to each other.
- **Motion** (animation libraries, `pattern: motion`). Bundle: 5 ≤ 10 KB, 4 ≤ 20, 3 ≤ 35, 2 ≤ 50, 1 above (library only,
  React subtracted). *Default look*: quality of the default easing/springs with no tuning. *Interactivity*: interruptible
  animations that keep velocity, gestures and drag. *Coverage*: layout/shared-element, enter/exit, scroll-linked, SVG and
  timelines. *Accessibility*: reduced-motion support (built in and on by default scores highest). *Performance*: runs on the
  compositor (WAAPI/CSS) rather than per-frame JavaScript, measured in `benchmotion/`.
- **UI primitives** (headless accessible components, `pattern: ui-primitives`). Bundle for the four bench components:
  5 ≤ 20 KB, 4 ≤ 35, 3 ≤ 50, 2 ≤ 70, 1 above. *Default look* is styling ergonomics instead (unstyled is the point): state
  exposed as data attributes or render props that Tailwind can target. *Interactivity*: positioning, typeahead, animation
  hooks for exit. *Coverage*: the hard components (combobox, date picker, toast, tree, table, drag and drop). *Accessibility*:
  share of the scripted keyboard and ARIA checks passed plus axe violations, measured in `benchui/`.
- **AI chat UI** (chat and agent interface kits, `pattern: ai-chat`). Bundle: 5 ≤ 30 KB, 4 ≤ 60, 3 ≤ 100, 2 ≤ 150, 1 above.
  *Default look*: finished chat UI out of the box (or none, for hook-only kits: score 2). *Interactivity*: stop, retry,
  edit, branch, attachments without custom code. *Coverage*: native support for the four bench tasks (streaming markdown,
  tool/step display, approvals, citations). *Accessibility*: streaming announced politely, labelled composer, keyboard send
  and stop. *Performance*: stable layout and low main-thread time while streaming a long answer, measured in `benchai/`.
- **Inline AI assist** (editors and field helpers with AI, `pattern: ai-assist`). Bundle: 5 ≤ 30 KB, 4 ≤ 80, 3 ≤ 150,
  2 ≤ 250, 1 above (library only, React subtracted). *Default look*: the suggestion, rewrite and menu UI out of the box.
  *Interactivity*: accept, dismiss, partial accept, retry and undo without custom code. *Coverage*: native support for the
  four bench tasks (ghost text, rewrite with diff, AI fill, AI command menu). *Accessibility*: ghost text hidden from
  screen readers with one polite announcement, keyboard model (Tab only while a suggestion shows, Esc), IME-safe.
  *Performance*: debounce and cancellation, main-thread cost while streaming, measured in `benchinline/`. A GPL or
  paid-only licence caps *Licence & health* at 2.
