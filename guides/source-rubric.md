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
- **Tables and data grids** (`pattern: data-table`). Bundle: 5 ≤ 25 KB, 4 ≤ 60, 3 ≤ 120, 2 ≤ 250, 1 above (library only,
  React subtracted). *Default look*: a finished grid out of the box; headless libraries score on styling ergonomics and
  can't exceed 3. *Interactivity*: sort, filter, resize, pin, reorder, select and edit without custom code. *Coverage*:
  the free edition's features only (grouping, tree data, pivot, export, master/detail); paid-only features don't count.
  *Accessibility*: grid or table semantics, keyboard model (arrow keys between cells, Enter/F2 to edit, Esc), row and
  column counts announced when virtualised, measured in `benchtable/`. *Performance*: 10,000-row sort, filter and scroll
  timings and DOM size.
- **Panels, docking and split layouts** (`pattern: navigation` for shells, sources use `pattern: panels`). Bundle: 5 ≤ 10 KB,
  4 ≤ 30, 3 ≤ 60, 2 ≤ 120, 1 above (library only, React subtracted). *Default look*: handles, tabs and drop overlays out
  of the box. *Interactivity*: resize, collapse, double-click reset, persist/restore; for docking libraries also drag to
  dock, float and pop out. *Coverage*: which of the three workspace models it serves (split panes, dockable tabs, tiles).
  *Accessibility*: APG window splitter (focusable `separator` with values, arrows, Home/End, Enter collapses), a non-drag
  alternative for docking (WCAG 2.5.7), labelled regions, measured in `benchpanels/`. *Performance*: frame timing while
  dragging a sash, layout shift on reload with a saved layout. Paid-only features (e.g. dockview-enterprise) don't count.
- **Maps and geospatial** (`pattern: map`). Bundle: 5 ≤ 60 KB, 4 ≤ 150, 3 ≤ 300, 2 ≤ 600, 1 above (library only, React
  subtracted; tiles and styles not counted). *Default look*: a clean basemap style and controls out of the box.
  *Interactivity*: pan, zoom, pick, cluster expand, fly-to and live updates without custom code. *Coverage*: markers,
  clusters, heatmaps, lines, polygons, large-data layers, drawing. *Accessibility*: keyboard pan/zoom, a labelled
  container, `flyTo` honouring reduced motion, attribution visible, measured in `benchmap/`. *Performance*: first render
  and frame time under 1 Hz updates of 5,000 vehicles (SwiftShader timings are relative only). The tile source is scored
  separately: free hosted tiles that forbid commercial use don't count.
- **Agent design skills** (skills and toolkits that build, review or diagram UI, `pattern: design-skills`). Every skill is
  given the same brief for the kind of work it does, then checked the same way (`benchskills/`): *builders* make a
  pricing page, *reviewers* audit a page seeded with 31 known defects, *diagram makers* draw the library's own pipeline;
  each kind also runs without any skill as the control. *Default look*, *Coverage* and *Accessibility* are scored
  against it, kept between 1 and 5, so a skill that does no better than the unaided model gets 3: Default look is
  3 + the rounded difference between the skill's jury mean and the control's; Coverage and Accessibility are
  3 + (the skill's band minus the control's band) on the scales below. Score from the track(s) the skill ran in. *Default look*: blind-jury mean (1-5, two judges
  who see only the screenshots) of the page or diagram; for reviewers, how usable the report is out of the box (located, ranked, fix written in the
  project's styling system). *Interactivity*: a measured loop built in (browser inspector, validator, look-and-fix
  rounds): 5; checklist only: 3; prose only: 1. *Coverage*: share of the track's scripted checks passed, or recall of
  the seeded defects (5 ≥ 85%, 4 ≥ 70, 3 ≥ 55, 2 ≥ 40). *Accessibility*: axe violations plus the scripted keyboard,
  focus, reduced-motion and target-size checks (builders, diagrams); recall on the accessibility defects (reviewers).
  *Performance*: run cost against the control (tokens and minutes: 5 ≤ 1.5×, 4 ≤ 2×, 3 ≤ 3×, 2 ≤ 5×, 1 above) and
  steps that failed. *React/Next fit*: writes into the project's own stack and tokens (Tailwind, React) or can be told
  to: 5; HTML only with stack notes: 3; locked to another tool: 1. *Bundle size* is the static footprint an agent
  loads: 5 ≤ 150 lines of core `SKILL.md` and ≤ 1 MB, 4 ≤ 300 and ≤ 5 MB, 3 ≤ 600 and ≤ 25 MB, 2 ≤ 1,000 and ≤ 60 MB,
  1 above. *Licence & health* adds the vetting result (`scripts/vet-skill-repo.mjs`): undisclosed data egress,
  install-time code or config writes cap it at 2; disclosed, opt-out egress caps it at 4; paid services the skill
  depends on are named in `avoid_when`. n = 1 run per skill per track, so differences under about one rubric point are
  noise; the profile says so.
