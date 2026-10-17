# Category map for research

The categories the UX library should cover, grouped into six layers. Each one becomes a **guide**
(`guides/<category>.md`), a set of **scored sources** (`sources/`) and **live patterns** (`entries/`), the
same way charts and 3D were built.

- **Status**: ✅ covered (guide + scored sources + patterns) · ◐ partial (patterns only, or thin) · ✗ missing
- **Priority** comes from the ten-brief test (`docs/test-run-10-briefs.html`): **P1** blocks most briefs, **P2** blocks
  one or two, **P3** is nice to have.
- **Tools** are the libraries or products we'd build with; **references** are the best real products or sites to learn from.
  Open-source tools are preferred; anything paid gets flagged (we exclude commercial-only tools as sources).

## A. Foundations (apply to every screen)

| # | Category | Covers | Status | Priority | Example tools to assess | Example references |
|---|---|---|---|---|---|---|
| A1 | Colour and tokens | OKLCH palettes, light/dark themes, semantic tokens, contrast | ✗ | P1 | Radix Colors, Tailwind v4 theme, Style Dictionary, Leonardo | Linear, Vercel (Geist), GitHub Primer, Apple HIG |
| A2 | Typography | Variable fonts, optical sizing, type scales, numerals | ✗ | P2 | Fontsource, Utopia (fluid type), Capsize | Stripe, Vercel, iA Writer |
| A3 | Layout, spacing and density | Grids, spacing scales, density modes, concentric radii | ✗ | P2 | Tailwind, Every Layout, CSS container queries | Linear, Bloomberg-lite tools, Notion |
| A4 | Materials, depth and elevation | Elevation scales, solid vs glass vs tactile, translucency fallbacks | ✗ | P1 | CSS backdrop-filter, Apple Liquid Glass guidance | Apple (Liquid Glass), Arc, Raycast |
| A5 | Motion and animation | Springs, motion tokens, shared-element and scroll-driven transitions, interruptibility, reduced motion | ✗ | P1 | Motion (Framer Motion), React Spring, GSAP, View Transitions API, CSS scroll-driven animations, Rive, Lottie | Linear, Apple, Vercel, Family (wallet) |
| A6 | States and micro-interactions | Hover/press/focus/loading/success/error, optimistic UI, undo toasts, skeletons, number roll-ups | ◐ | P1 | Sonner (toasts), NumberFlow, TanStack Query (optimistic) | Linear, Superhuman, Things |
| A7 | Accessibility | Focus management, keyboard models, ARIA patterns, reduced motion/transparency/contrast | ◐ | P1 | React Aria, Radix Primitives, Ariakit, axe-core | GOV.UK Design System, Adobe Spectrum |
| A8 | Performance and smoothness | Virtualisation, INP, compositor-only animation, layout-shift-free loading | ✗ | P2 | TanStack Virtual, react-window, web-vitals | Linear, Figma |
| A9 | Content and microcopy | Plain-English UI text, errors, empty states, AI disclosure wording | ◐ | P3 | (writing guides rather than tools) | Monzo, GOV.UK, Stripe |
| A10 | Icons and imagery | Icon sets, illustration styles, image formats (AVIF), avatars | ✗ | P3 | Lucide, Phosphor, Heroicons | Linear, Duolingo |

## B. App shell and components

| # | Category | Covers | Status | Priority | Example tools to assess | Example references |
|---|---|---|---|---|---|---|
| B1 | App shell and navigation | Sidebars, workspaces, tabs, breadcrumbs, split views | ◐ | P1 | (patterns) | Linear, Vercel dashboard, Notion, Arc |
| B2 | Command palette and shortcuts | ⌘K, fuzzy search, natural-language commands, shortcut hints | ◐ | P1 | cmdk, kbar, Ninja Keys | Linear, Raycast, Superhuman, VS Code |
| B3 | Panels, docking and split layouts | Dockable tabs, pop-outs, saved layouts, resizable panes | ✗ | P2 | dockview, FlexLayout, Golden Layout, react-resizable-panels | VS Code, TradingView, Figma |
| B4 | Overlays | Modals, sheets, popovers, hover cards, toasts, drawers | ✗ | P1 | Radix, React Aria, Vaul (drawers), Floating UI | Apple sheets, Linear, Stripe |
| B5 | Forms and inputs | Inline editing, validation, date/time pickers, comboboxes, numeric precision input | ✗ | P2 | React Hook Form, React Aria date pickers, Downshift | Stripe Checkout, Linear, Typeform |
| B6 | Tables and data grids | Sorting, grouping, inline edit, virtualised rows, frozen columns | ✗ | P1 | TanStack Table, AG Grid Community, Glide Data Grid, Handsontable (licence) | Airtable, Linear, Retool |
| B7 | Search and filtering | Facets, filter chips, saved views, query builders | ◐ | P2 | Algolia InstantSearch, react-querybuilder | Airbnb, Unsection, Linear views |
| B8 | Empty, loading and error states | First-use, zero data, partial failure, offline | ◐ | P2 | (patterns) | GitHub, Linear, Stripe |
| B9 | Onboarding and first run | Progressive setup, checklists, skippable steps | ◐ | P2 | (patterns) | Duolingo, Notion, Linear |
| B10 | Notifications and activity | Inbox, activity feeds, alert priority, digests | ✗ | P3 | Novu, Knock (paid) | Linear inbox, GitHub, Slack |

## C. Data and visualisation

| # | Category | Covers | Status | Priority | Example tools to assess | Example references |
|---|---|---|---|---|---|---|
| C1 | Charts | Chart types, zoom, tooltips, palettes | ✅ | – | (9 profiled) | Stripe, Vercel, Our World in Data |
| C2 | Dashboards and analytics | KPI hierarchy, bento layouts, cross-filtering, drill-down, NL query | ◐ | P1 | react-grid-layout, Evidence, Observable Framework | Amplitude, Hex, Mixpanel, Stripe |
| C3 | Maps and geospatial | Vector maps, layers, clustering, fly-to, heatmaps, geofences | ✗ | P1 | MapLibre GL, deck.gl, kepler.gl, Leaflet, Mapbox (paid) | Uber/kepler demos, Citymapper, Strava |
| C4 | Network graphs | Force layouts, expand-on-click, path finding, large graphs | ✗ | P2 | sigma.js + graphology, Cytoscape.js, G6, reagraph, React Flow (diagrams) | Neo4j Bloom, Linkurious, Obsidian graph |
| C5 | Timelines and scheduling | Gantt, calendars, scrubbers, event timelines | ✗ | P2 | FullCalendar, vis-timeline, Frappe Gantt | Linear roadmaps, Cron/Notion Calendar |
| C6 | Real-time and streaming data | Tick updates, flash-on-change, order books, live counters | ✗ | P2 | (patterns + charts) | TradingView, Bloomberg, Grafana |

## D. Spatial, media and collaboration

| # | Category | Covers | Status | Priority | Example tools to assess | Example references |
|---|---|---|---|---|---|---|
| D1 | 3D and WebGL | Product viewers, configurators, hero scenes | ✅ | – | (5 profiled) | Apple, Stripe, Igloo |
| D2 | Infinite canvas and whiteboards | Pan/zoom, shapes, connectors, frames, minimap | ✗ | P2 | Excalidraw, tldraw (licence check), React Flow, Konva, Fabric.js | Figma, FigJam, Miro |
| D3 | Real-time collaboration | Presence, cursors, comments, CRDT sync, offline | ✗ | P2 | Yjs, Automerge, Liveblocks (paid), PartyKit | Figma, Notion, Linear |
| D4 | Media editing | Video/audio timelines, waveforms, transcript editing, keyframes | ✗ | P2 | WebCodecs, wavesurfer.js, Remotion (licence), FFmpeg.wasm | Descript, CapCut web, Riverside |
| D5 | Rich text and documents | Editors, comments, suggestions, diffs | ✗ | P2 | Tiptap, Lexical, ProseMirror, BlockNote | Notion, Google Docs, Linear docs |
| D6 | Commerce and configurators | Product pages, variant pickers, configurators, AR handoff, checkout | ◐ | P2 | model-viewer, Shopify Hydrogen | IKEA, Nike By You, Apple Store |

## E. AI and agentic UI

| # | Category | Covers | Status | Priority | Example tools to assess | Example references |
|---|---|---|---|---|---|---|
| E1 | Chat and streaming | Message threads, streaming text, stop/retry, attachments | ✗ | P1 | Vercel AI SDK (UI), assistant-ui | Claude, ChatGPT, Perplexity |
| E2 | Agent workflows | Plans, tool-use logs, parallel tasks, pause/redirect | ✗ | P1 | (patterns) | Claude Code, Cursor, Devin-style tools, Manus |
| E3 | Human review and approvals | Approval prompts, diffs with per-change accept, irreversible-action guards | ✗ | P1 | diff libraries (react-diff-view), Monaco diff | Cursor, GitHub PR review, Claude artifacts |
| E4 | Trust and provenance | Citations, AI labelling, authorship, model/version labels, audit trails | ✗ | P1 | (patterns) | Perplexity, Elicit, Notion AI |
| E5 | Generative UI | Agents returning interactive components (tables, charts, forms) | ✗ | P2 | Vercel AI SDK RSC/UI, CopilotKit | v0, Claude artifacts, ChatGPT canvas |

## F. Marketing and storytelling

| # | Category | Covers | Status | Priority | Example tools to assess | Example references |
|---|---|---|---|---|---|---|
| F1 | Landing page sections | Hero, proof, pricing, FAQ, security/trust, CTA | ◐ (strong) | P3 | (patterns) | Linear, Stripe, Notion, Vercel |
| F2 | Scroll-driven storytelling | Pinned sections, reveals, scroll-linked motion on native scroll | ◐ | P3 | CSS scroll-driven animations, GSAP ScrollTrigger, Lenis (caution: scroll hijack) | Apple, Igloo |
| F3 | Navigation and mega menus | Sticky/condensing nav, mega menus, mobile menus | ◐ | P3 | (patterns) | Stripe, Vercel |

## What to bring back per category

For each category you research, the most useful return is:

1. **3–6 tools** with: licence (open-source or paid), what it's best at, React/Next fit, maintenance signal, and anything you've seen go wrong.
2. **3–6 reference products or pages** (URLs), with the specific screen or moment that makes each one best-in-class.
3. **The key questions the guide must answer** for that category (e.g. maps: "when to cluster", "how to show stale positions").
4. Anything you disagree with in the "example" columns above; they're starting points, not conclusions.

Drop findings into `research/<category-id>.md` (e.g. `research/C3-maps.md`) or paste them in chat; either way they
go through the same pipeline: benchmark or capture, score, guide.
