# Category map for research

The categories the UX library covers, grouped into seven layers. The 20 marked ✅ have a full guide, scored sources and
live patterns (G's evidence is a benchmark of skills, not captured patterns). **The other 24 stop at a quick pick** (`guides/quick-picks.md`: one line each, not benchmarked), which is
enough for a loose lookup. Build one out fully only when a project actually needs it.

- **Status**: ✅ covered (guide + scored sources + patterns) · ◐ quick pick (one-line starting point; `ux-find` explores the rest)
- **Priority** comes from the ten-brief test (`docs/test-run-10-briefs.html`): **P1** blocks most briefs, **P2** blocks
  one or two, **P3** is nice to have.
- **Tools** are the libraries or products we'd build with; **references** are the best real products or sites to learn from.
  Open-source tools are preferred; anything paid gets flagged (we exclude commercial-only tools as sources).
- For categories not built yet, the tools column is the shortlist from the team's catalogue (`research/catalogue/`,
  18 Oct 2026, licence and six-month maintenance checked); 3 verified reference moments per category are in
  `research/catalogue/references.csv`. Built categories (✅) show what our benchmarks chose. Excluded tools: `guides/README.md`, "Avoid".

## A. Foundations (apply to every screen)

| # | Category | Covers | Status | Priority | Example tools to assess | Example references |
|---|---|---|---|---|---|---|
| A1 | Colour and tokens | OKLCH palettes, light/dark themes, semantic tokens, contrast (WCAG gate, APCA advisory), status and colour-blind variants, forced colors, chart-colour tier | ✅ `guides/foundations.md` | P1 | Tailwind v4 `@theme`, Radix Colors, culori / colorjs.io (scripts); Style Dictionary only if tokens leave the web app | Radix scale docs, Vercel Geist colours, Primer primitives, oklch.com, Linear's LCH theme post |
| A2 | Typography | Variable fonts, optical sizing, type scales, numerals | ◐ quick pick (`guides/quick-picks.md`) | P2 | Fontsource; Tailwind CSS; Style Dictionary; Open Props *(catalogue)* | Stripe, Vercel, iA Writer |
| A3 | Layout, spacing and density | Grids, spacing scales, density modes, concentric radii | ◐ quick pick (`guides/quick-picks.md`) | P2 | Tailwind CSS; Style Dictionary; Open Props; react-resizable-panels *(catalogue)* | Linear, Bloomberg-lite tools, Notion |
| A4 | Materials, depth and elevation | Elevation scale, dark-mode depth (surface ladder + ring), glass and fallbacks, radii and concentric corners, scrims | ✅ `guides/foundations.md` | P1 elevation · P3 glass | Tailwind v4 tokens + custom reduce-transparency variant, Primer primitives (values), Josh Comeau shadow generator | Geist Materials, Atlassian Elevation, Fluent 2, Apple HIG Materials, Raycast, Linear |
| A5 | Motion and animation | Duration/easing tokens, when not to animate, springs, interruptibility, shared-element and scroll-driven transitions, reduced motion | ✅ `guides/motion.md` (6 benchmarked) | P1 | CSS + React `<ViewTransition>`, Motion, AutoAnimate, GSAP (storytelling), anime.js, React Spring | Emil Kowalski demos, Chrome View Transition demos, Next `<ViewTransition>` demo, scroll-driven-animations.style |
| A6 | States and micro-interactions | State matrix, latency bands, show-delay and minimum time, button loading, optimistic UI, undo vs confirm, toasts, number transitions, hover intent | ✅ `guides/motion.md` §4 | P1 | Sonner, NumberFlow, React `useOptimistic`, TanStack Query | Vercel Geist (Button, Toast, Skeleton), Sonner, NumberFlow, Linear's invisible-details post |
| A7 | Accessibility | Primitives-library choice, focus, keyboard models, live regions and streaming, WCAG 2.2 criteria, forced colors, testing, EAA | ✅ `guides/accessibility.md` (5 benchmarked) | P1 | React Aria, Base UI, Radix, Ariakit; `@axe-core/playwright` (with `wcag22aa`), Playwright ARIA snapshots | GOV.UK (error summary, focus), React Aria docs, W3C APG examples, Primer focus management |
| A8 | Performance and smoothness | Virtualisation, INP, compositor-only animation, layout-shift-free loading | ◐ quick pick (`guides/quick-picks.md`) | P2 | TanStack Virtual; AG Grid Community; Fontsource; PixiJS *(catalogue)* | Linear, Figma |
| A9 | Content and microcopy | Plain-English UI text, errors, empty states (AI disclosure wording moved to E4) | ◐ quick pick (`guides/quick-picks.md`) | P3 | (writing guides rather than tools) | Monzo, GOV.UK, Stripe |
| A10 | Icons and imagery | Icon sets, illustration styles, image formats (AVIF), avatars | ◐ quick pick (`guides/quick-picks.md`) | P3 | Lucide; shadcn/ui; Base UI *(catalogue)* | Linear, Duolingo |

## B. App shell and components

| # | Category | Covers | Status | Priority | Example tools to assess | Example references |
|---|---|---|---|---|---|---|
| B1 | App shell and navigation | Sidebars, workspaces, tabs, breadcrumbs, split views | ✅ `guides/shell-panels.md` §1 | P1 | shadcn/ui; Mantine; Dockview; react-resizable-panels; Radix Primitives; nuqs *(catalogue)* | Linear, Vercel dashboard, Notion, Arc |
| B2 | Command palette and shortcuts | ⌘K, fuzzy search, natural-language commands, shortcut hints | ◐ quick pick (`guides/quick-picks.md`) | P1 | Mantine; React Aria Components; Base UI *(catalogue)* | Linear, Raycast, Superhuman, VS Code |
| B3 | Panels, docking and split layouts | Dockable tabs, pop-outs, saved layouts, resizable panes | ✅ `guides/shell-panels.md` §2 (benchmarked in `benchpanels/`) | P1 split panes · P2 docking | react-resizable-panels; FlexLayout; Dockview (free core); React Grid Layout; Allotment (benchmarked) | VS Code, TradingView, Figma |
| B4 | Overlays | Modals, sheets, popovers, hover cards, toasts, drawers | ◐ quick pick (`guides/quick-picks.md`) | P1 | Base UI; React Aria Components; Radix Primitives; Sonner; Ark UI *(catalogue)* | Apple sheets, Linear, Stripe |
| B5 | Forms and inputs | Inline editing, validation, date/time pickers, comboboxes, numeric precision input | ◐ quick pick (`guides/quick-picks.md`) | P2 | React Hook Form; React Aria Components; Base UI; Mantine; Ark UI *(catalogue)* | Stripe Checkout, Linear, Typeform |
| B6 | Tables and data grids | Sorting, grouping, inline edit, virtualised rows, frozen columns | ✅ `guides/tables.md` (benchmarked in `benchtable/`) | P1 | TanStack Table; react-data-grid; AG Grid Community; React Aria Components; MUI X; VisActor VTable (benchmarked) | Airtable, Linear, Retool |
| B7 | Search and filtering | Facets, filter chips, saved views, query builders | ◐ quick pick (`guides/quick-picks.md`) | P2 | React Query Builder; nuqs; TanStack Table; React Aria Components; Base UI; Mantine *(catalogue)* | Airbnb, Unsection, Linear views |
| B8 | Empty, loading and error states | First-use, zero data, partial failure, offline | ◐ quick pick (`guides/quick-picks.md`) | P2 | shadcn/ui; TanStack Query; React Hook Form; Sonner; Rive Web runtime *(catalogue)* | GitHub, Linear, Stripe |
| B9 | Onboarding and first run | Progressive setup, checklists, skippable steps | ◐ quick pick (`guides/quick-picks.md`) | P2 | Driver.js; Mantine; React Hook Form; Ark UI; Rive Web runtime *(catalogue)* | Duolingo, Notion, Linear |
| B10 | Notifications and activity | Inbox, activity feeds, alert priority, digests | ◐ quick pick (`guides/quick-picks.md`) | P3 | Sonner; Base UI; Mantine; TanStack Query; Novu open-core Inbox *(catalogue)* | Linear inbox, GitHub, Slack |

## C. Data and visualisation

| # | Category | Covers | Status | Priority | Example tools to assess | Example references |
|---|---|---|---|---|---|---|
| C1 | Charts | Chart types, zoom, tooltips, palettes | ✅ | – | (9 profiled) | Stripe, Vercel, Our World in Data |
| C2 | Dashboards and analytics | KPI hierarchy, bento layouts, cross-filtering, drill-down, NL query | ✅ `guides/shell-panels.md` §3 + `guides/charts.md` | P1 | React Grid Layout; Recharts; Apache ECharts; TanStack Table; TanStack Virtual; nuqs *(catalogue)* | Amplitude, Hex, Mixpanel, Stripe |
| C3 | Maps and geospatial | Vector maps, layers, clustering, fly-to, heatmaps, geofences, live positions, tiles and geocoding | ✅ `guides/maps.md` (benchmarked in `benchmap/`) | P1 | MapLibre GL JS; deck.gl; OpenLayers; Leaflet (benchmarked); kepler.gl; Protomaps PMTiles / OpenFreeMap for tiles | geOps tracker, MBTA, Protomaps, MapLibre clusters (captured); Samsara, Onfleet (logged in) |
| C4 | Network graphs | Force layouts, expand-on-click, path finding, large graphs | ◐ quick pick (`guides/quick-picks.md`) | P2 | Sigma.js + Graphology; React Flow; Apache ECharts; AntV G6 *(catalogue)* | Neo4j Bloom, Linkurious, Obsidian graph |
| C5 | Timelines and scheduling | Gantt, calendars, scrubbers, event timelines | ◐ quick pick (`guides/quick-picks.md`) | P2 | OpenReel Video (watch); FullCalendar Standard; Schedule-X core; wavesurfer.js; Konva; VisActor VTable *(catalogue)* | Linear roadmaps, Cron/Notion Calendar |
| C6 | Real-time and streaming data | Tick updates, flash-on-change, order books, live counters | ◐ quick pick (`guides/quick-picks.md`) | P2 | Lightweight Charts; Apache ECharts; MapLibre GL JS; deck.gl *(catalogue)* | TradingView, Bloomberg, Grafana |

## D. Spatial, media and collaboration

| # | Category | Covers | Status | Priority | Example tools to assess | Example references |
|---|---|---|---|---|---|---|
| D1 | 3D and WebGL | Product viewers, configurators, hero scenes | ✅ | – | (5 profiled) | Apple, Stripe, Igloo |
| D2 | Infinite canvas and whiteboards | Pan/zoom, shapes, connectors, frames, minimap | ◐ quick pick (`guides/quick-picks.md`) | P2 | Excalidraw; React Flow; Konva; PixiJS; AntV G6 *(catalogue)* | Figma, FigJam, Miro |
| D3 | Real-time collaboration | Presence, cursors, comments, CRDT sync, offline | ◐ quick pick (`guides/quick-picks.md`) | P2 | Yjs; Excalidraw; Tiptap OSS Editor; Lexical; Automerge; Loro *(catalogue)* | Figma, Notion, Linear |
| D4 | Media editing | Video/audio timelines, waveforms, transcript editing, keyframes | ◐ quick pick (`guides/quick-picks.md`) | P2 | OpenReel Video (watch); wavesurfer.js; Konva; Lexical; Kokonut UI; PixiJS *(catalogue)* | Descript, CapCut web, Riverside |
| D5 | Rich text and documents | Editors, comments, suggestions, diffs | ◐ quick pick (`guides/quick-picks.md`) | P2 | Tiptap OSS Editor; Lexical; Yjs; Automerge; Loro *(catalogue)* | Notion, Google Docs, Linear docs |
| D6 | Commerce and configurators | Product pages, variant pickers, configurators, AR handoff, checkout | ◐ quick pick (`guides/quick-picks.md`) | P2 | model-viewer; React Three Fiber; Konva; PixiJS *(catalogue)* | IKEA, Nike By You, Apple Store |

## E. AI and agentic UI

| # | Category | Covers | Status | Priority | Example tools to assess | Example references |
|---|---|---|---|---|---|---|
| E1 | Chat and streaming | Streaming markdown, scroll model (anchor vs follow), stop/retry/edit/branch, composer, attachments, accessible streaming | ✅ `guides/agentic-ui.md` (benchmarked in `benchai/`) | P1 | AI SDK UI, assistant-ui primitives, Streamdown / remend, MessageScroller or use-stick-to-bottom | Claude, ChatGPT, Perplexity (logged in); AI SDK chatbot demo, assistant-ui examples, Streamdown playground |
| E2 | Agent workflows | Plans, step and tool logs, progress, stop vs steer, parallel and background runs, takeover, final report | ✅ `guides/agentic-ui.md` | P1 | AI SDK tool-part states, assistant-ui ChainOfThought/Queue, shadcn AI patterns (read, don't adopt) | Claude Code, Cursor, Codex, ChatGPT agent, Gemini Deep Research (logged in) |
| E3 | Human review and approvals | Approval prompts, permission modes, always-ask floor, per-hunk diff review, irreversible guards, checkpoints | ✅ `guides/agentic-ui.md` | P1 | jsdiff (engine) + `@pierre/diffs` or `@git-diff-view/react`; Monaco only if already shipping an editor | Cursor review, Claude Code `/rewind` and permission prompts, GitHub PR review, diffs.com |
| E4 | Trust and provenance | Citations, AI disclosure (EU AI Act Art. 50), AI labels in mixed content, confidence without percentages, model labels, audit trails, C2PA | ✅ `guides/agentic-ui.md` | P1 | (patterns); C2PA Content Credentials | Perplexity, Elicit, Google AI Mode, NotebookLM, IBM Carbon for AI label |
| E5 | Generative UI | Agents returning interactive components (tables, charts, forms) | ◐ quick pick (`guides/quick-picks.md`) | P2 | assistant-ui; CopilotKit (MIT SDKs and TypeScript runtime); AI SDK (Core + UI); json-render; OpenUI (Thesys open-source framework) *(catalogue)* | v0, Claude artifacts, ChatGPT canvas |
| E6 | Inline AI assist | Ghost text, rewrite in place with Accept/Discard/Try again, AI form fill, AI command menus, inline summaries, suggested replies; IME, screen-reader and mobile rules | ✅ `guides/agentic-ui.md` §7 (benchmarked in `benchinline/`) | P1 plain fields · P2 rich editors (with D5) | AI SDK `useCompletion`/`useObject` + `rich-textarea` (our build), Plate AI (MIT); Tiptap AI paid, BlockNote AI GPL/commercial | platejs.org demos, Tiptap template, Cursor Tab, VS Code Copilot, Apple Writing Tools, Linear triage, Gmail |

## F. Marketing and storytelling

| # | Category | Covers | Status | Priority | Example tools to assess | Example references |
|---|---|---|---|---|---|---|
| F1 | Landing page sections | Hero, proof, pricing, FAQ, security/trust, CTA | ◐ quick pick (`guides/quick-picks.md`) | P3 | Magic UI; shadcn/ui; Motion; Kokonut UI; Rive Web runtime *(catalogue)* | Linear, Stripe, Notion, Vercel |
| F2 | Scroll-driven storytelling | Pinned sections, reveals, scroll-linked motion on native scroll | ◐ quick pick (`guides/quick-picks.md`) | P3 | Motion; Anime.js; Lenis; PixiJS *(catalogue)* | Apple, Igloo |
| F3 | Navigation and mega menus | Sticky/condensing nav, mega menus, mobile menus | ◐ quick pick (`guides/quick-picks.md`) | P3 | Radix Primitives; React Aria Components; shadcn/ui *(catalogue)* | Stripe, Vercel |

## G. Build tooling (agent skills)

| # | Category | Covers | Status | Priority | Example tools to assess | Example references |
|---|---|---|---|---|---|---|
| G1 | Design-direction skills (builders) | Skills that make an agent build pages and screens that don't look generated: art direction, themes, floors of rules, look-and-fix loops | ✅ `guides/design-skills.md` (benchmarked in `benchskills/`) | P2 | Hallmark; Taste Skill; UI UX Pro Max; Anthropic frontend-design *(skill repos, vetted)* | Awwwards, One Page Love |
| G2 | Interface review skills | Skills that audit or polish an existing screen: accessibility, layout, typography, colour, copy, UI polish, branch/PR review | ✅ `guides/design-skills.md` (benchmarked in `benchskills/`) | P2 | Interface Skills (`better-*`); Hallmark audit *(skill repos, vetted)* | GOV.UK, Apple HIG |
| G3 | Diagram skills | Skills that draw architecture, flow, journey and chart diagrams as HTML/SVG | ✅ `guides/design-skills.md` (benchmarked in `benchskills/`) | P3 | Diagram Design; Archify *(skill repos, vetted)* | Stripe docs, Our World in Data |

## What to bring back per category

For each category you research, the most useful return is:

1. **3–6 tools** with: licence (open-source or paid), what it's best at, React/Next fit, maintenance signal, and anything you've seen go wrong.
2. **3–6 reference products or pages** (URLs), with the specific screen or moment that makes each one best-in-class.
3. **The key questions the guide must answer** for that category (e.g. maps: "when to cluster", "how to show stale positions").
4. Anything you disagree with in the "example" columns above; they're starting points, not conclusions.

Drop findings into `research/<category-id>.md` (e.g. `research/C3-maps.md`) or paste them in chat; either way they
go through the same pipeline: benchmark or capture, score, guide.
