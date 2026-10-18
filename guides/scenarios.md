# Scenarios: starting stacks for whole briefs

`ux-find` reads this when a request is a **whole product or screen** ("a trading terminal", "an AI agent workspace")
rather than one component. Each scenario gives a starting stack, the thing that must be right, what to test before
shipping, what the library already holds and where it is thin. Then go to the category guides for detail.

Sources: the team catalogue's ten scenario recipes (`research/catalogue/scenarios.csv`) merged with our benchmarks. Where
they disagree, the measured result is used and noted. The ten scenarios match the ten test briefs in
`docs/test-run-10-briefs.html` (brief 1, a budgeting app, maps onto "simple charts"). Every stack is a starting point:
depart from it when the brief calls for it.

**Every scenario also gets the foundations:** tokens, dark mode and elevation (`guides/foundations.md`), motion and
state timing (`guides/motion.md`), the component library and focus rules (`guides/accessibility.md`; shadcn/ui copy-in
allowed, Base UI flavour, see `our-design/README.md`).

## 1. Simple charts in a consumer app (Pocketwise, budgeting)
- **Start with:** Recharts (7.5) with our validated palette; NumberFlow for balances that change after user actions; the
  one-question onboarding pattern.
- **Must get right:** readable axes, units and zero baselines; an accessible summary; consistent series colours; **direct
  labels or a table on light backgrounds** (three palette colours are below 3:1 on white).
- **Test:** keyboard focus on chart points, tooltip overflow at narrow widths, empty and one-point data, reduced motion.
- **In the library:** `guides/charts.md`, `sources/recharts`, `onboarding/duolingo-one-question-flow`, `motion/numberflow-digit-roll`, `design-tokens/*`.
- **Thin:** empty and error states (B8), forms (B5): explore from the catalogue shortlist.

## 2. KPI dashboards (Northstar, revenue operations)
- **Start with:** Recharts for everyday charts, ECharts (7.8) where you need zoom, drill-down or 10k+ points; TanStack
  Table + Virtual for the tables; nuqs to keep date range and filters in the URL; react-grid-layout **only** if users
  rearrange their own dashboard.
- **Must get right:** one answer line, then KPI hierarchy; a shared time range; saved filters; partial-failure states per tile.
- **Test:** realistic row counts and cross-filtering; input latency; fixed headers while scrolling.
- **In the library:** `guides/charts.md`, `guides/tables.md` (TanStack 7.8, react-data-grid 8.3 for editable grids), `guides/shell-panels.md` §3 (dashboards), `dashboard/stripe-home-kpi-overview` (needs capture), `dashboard/grafana-per-panel-failure-time-range`, `chart/echarts-datazoom-time-series`, `data-table/*`.
- **Thin:** logged-in dashboard screens (Stripe, Datadog, Amplitude) need user screenshots.

## 3. Real-time trading terminal (Meridian Pro)
- **Start with:** Lightweight Charts (6.5) for price charts (uPlot 5.5 or ECharts canvas for telemetry-style series);
  AG Grid Community for the order blotter; Dockview core for dockable panes; tabular numerals everywhere.
- **Must get right:** stable pan and zoom; **batched tick updates**; decimal precision; reconnect and stale-feed
  indicators; no motion on data except a brief tick flash (`guides/motion.md`: no digit rolls on live data).
- **Test:** replay the expected tick rate and bursts; measure dropped frames and memory; keyboard order entry.
- **In the library:** `guides/charts.md` (financial row), `sources/lightweight-charts`, `sources/uplot`, `command-palette/linear-cmdk-menu`.
- **Thin:** panels and docking (B3), real-time data (C6), order entry (B5). AG Grid **Enterprise** and dockview-enterprise are paid: check features against the free edition.

## 4. Live maps and control rooms (Relay, fleet logistics)
- **Start with:** MapLibre GL JS for the basemap + deck.gl for large data layers (icons, paths, heatmaps); kepler.gl only
  for exploratory analysis. Not Mapbox GL (proprietary).
- **Must get right:** basemap separate from data layers; clustering below a zoom threshold; **stale positions shown as
  stale**; an exceptions queue ranked by severity × time to impact.
- **Test:** visible-layer density, picking accuracy, fly-to cancellation, GPU memory, lost WebGL context recovery,
  reduced motion for camera moves (`guides/3d.md` defaults apply).
- **In the library:** nothing map-specific yet.
- **Thin:** maps (C3, P1) are next to be built. Tiles, styles and geocoding have their own licences and costs.

## 5. Landing pages (Lumen, AI product)
- **Start with:** our captured patterns (hero, pricing, proof, mega menu) built in Tailwind; native CSS and
  `<ViewTransition>` first, Motion where you need springs or orchestration (`guides/motion.md`, measured). Magic UI's
  **free** components are a source of section ideas (not Pro, not React Bits).
- **Must get right:** a strong hero, credible proof, clear pricing, keyboard-operable navigation.
- **Test:** layout shift while loading, reduced motion, dark and light contrast, narrow desktop widths.
- **In the library:** `hero/linear-dark-product-hero`, `pricing-table/notion-billing-toggle`, `social-proof/vercel-logo-wall-stats`,
  `mega-menu/stripe-products-menu`, `feature-grid/apple-highlights-media-gallery`, `3d/apple-airpods-scroll-story`.
- **Thin:** little; this is the library's strongest area.

## 6. 3D product configurators (Forma Studio)
- **Start with:** React Three Fiber (8.5) for custom or multipart scenes; model-viewer (7.5) for one product with
  hotspots and AR.
- **Must get right:** responsive variant changes, honest materials, camera controls, live price and lead-time feedback,
  a poster before the scene loads, and a DOM alternative.
- **Test:** asset budgets, texture memory, device pixel ratio, WebGL context loss, reduced motion (no auto-rotate).
- **In the library:** `guides/3d.md`, `sources/react-three-fiber`, `sources/model-viewer`, `3d/modelviewer-hotspot-annotations`.
- **Thin:** a real configurator capture (D6); pricing rules and checkout are separate integrations.

## 7. Multiplayer whiteboards (Tandem)
- **Start with:** Excalidraw for ready sketching **or** Konva for a custom canvas, with Yjs **or** Automerge for sync
  (alternatives, not a tested combined stack). Not tldraw (production needs a paid licence key).
- **Must get right:** presence (cursors, avatars) kept separate from persisted content; local undo; honest reconnect states.
- **Test:** concurrent edits, offline merge, long sessions, late join. Embedding Excalidraw doesn't include hosted multiplayer.
- **In the library:** nothing yet.
- **Thin:** canvas (D2) and collaboration (D3), both P2. Use the catalogue shortlist.

## 8. Video editing timelines (Cutline)
- **Start with:** a custom timeline from wavesurfer.js (waveforms) + Konva (tracks), Dockview or react-resizable-panels
  for the four-pane layout, WebCodecs for decode. OpenReel is a **watch** reference only (alpha; codec licences need
  review). Not Remotion (licence limits companies over three people).
- **Must get right:** frame-accurate tracks, snapping, trimming, precomputed waveform peaks, J/K/L transport.
- **Test:** decode and seek latency, long assets, A/V sync, export, undo.
- **In the library:** nothing yet.
- **Thin:** media editing (D4) and panels (B3).

## 9. Network graphs (Sentinel, fraud investigation)
- **Start with:** Sigma.js + Graphology (WebGL) for exploring large networks; React Flow for editable node diagrams with
  ports; ECharts' graph module only for small static graphs.
- **Must get right:** incremental layout (existing nodes keep their place on expand); shape for entity type, colour for
  risk only; focus + context; an accessible list or table alternative.
- **Test:** layout in a worker, search, neighbourhood isolation, label collisions, keyboard alternatives.
- **In the library:** `sources/echarts` (small graphs only).
- **Thin:** network graphs (C4, P2).

## 10. AI agent interfaces (Atlas, agent workspace)
- **Start with (measured, `benchai/` and `benchinline/`):** AI SDK `useChat` for state and approvals; **Streamdown** for
  message text; **assistant-ui primitives** for stop, retry-as-branch and edit (its shadcn-styled layer is now allowed as
  copy-in); **@pierre/diffs + jsdiff** for change review; our AI SDK inline build for ghost text and rewrite in fields.
  The catalogue suggests CopilotKit and Monaco; our benchmark measured CopilotKit at 5.5 (two critical accessibility
  failures, 681 KB) and Monaco is only worth it if an editor already ships.
- **Must get right:** streaming without flicker, stop and retry, a live plan, tool outcomes, source anchors, scoped
  human approval before side effects, and an announcement for screen readers (no kit ships one).
- **Test:** interrupted streams, rejected approvals, stale plans, replay, tool errors, citation targets.
- **In the library:** `guides/agentic-ui.md`, `ai-chat/*`, `agent-activity/*`, `ai-review/*`, `ai-provenance/*`, `ai-assist/*`.
- **Thin:** logged-in product screens (Claude, ChatGPT agent, Cursor): need user screenshots; the app shell (B1).
