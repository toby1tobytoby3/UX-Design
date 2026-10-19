# Quick picks

One line per category that doesn't have its own guide: what it is, what to reach for, what to avoid, and one tip.
These are **starting points from the team catalogue** (`research/catalogue/`, licence and maintenance checked), **not
benchmarked**. When a project really leans on one of these, `ux-find` explores it properly and `ux-add` keeps what's
worth keeping. The library doesn't need to be complete to be useful.

The full guides cover the rest: `guides/README.md` lists them.

## 1. Everyday building blocks
Most of these come from the component library you already picked (`guides/accessibility.md`: Base UI or React Aria,
used through shadcn/ui copy-in components).

| Category | What it is | Use | Avoid | One tip |
|---|---|---|---|---|
| Command palette (B2) | The ⌘K box: type to jump anywhere or run any action (Linear, VS Code) | A combobox inside a dialog from Base UI or React Aria; Mantine Spotlight if you're on Mantine | cmdk, and shadcn's Command built on it (unmaintained) | Show each action's shortcut beside it, recent items first; Esc closes and returns focus. See `command-palette/linear-cmdk-menu` |
| Overlays (B4) | Things floating above the page: dialogs, side drawers, popovers, tooltips, toasts | Base UI Dialog, Drawer, Popover, Tooltip; Sonner for toasts | Vaul (unmaintained) | Use a modal only when the user must decide before carrying on; otherwise a side panel. Never hide essential info in a tooltip. See `feedback/sonner-stacked-toasts` |
| Forms and inputs (B5) | Fields, validation, date pickers, searchable dropdowns | React Hook Form + Zod with Base UI or React Aria fields; React Aria for date pickers | Hand-rolled date pickers | Label above the field; validate when the user leaves a field; on submit, an error summary at the top that links to each field. See `accessibility/govuk-error-summary` |
| Search and filtering (B7) | Filter chips, saved views, search over lists | Filter chips + `nuqs` (filters in the URL); React Query Builder for AND/OR queries | Filters that reset on reload | Show the result count and a Clear all. More in `guides/tables.md` §3 |
| Empty, loading, error states (B8) | What a screen shows with no data, while loading, or when it fails | shadcn Skeleton; TanStack Query for loading and error state; Sonner | Spinners that replace the whole page | Empty says why and what to do next; skeletons match the final layout; errors inline with Retry. See `empty-state/github-empty-repo-quick-setup` |
| Onboarding (B9) | First-run setup and checklists | A setup checklist inside the product; Driver.js only for a short optional tour | Long forced tours | One question per screen, skippable, progress kept. See `onboarding/duolingo-one-question-flow` |
| Notifications (B10) | An inbox or activity feed | Sonner for passing messages; an inbox list on TanStack Query; Novu open-core Inbox if you need a backend | Toasts for anything the user must act on | Separate "needs action" from FYI; group repeats; mark as read |
| Navigation and menus (F3) | Top bars, big dropdown menus | Base UI or Radix Navigation Menu | Hover-only menus | Open on click or hover intent, reachable by keyboard, a sheet on mobile. See `mega-menu/stripe-products-menu` |

## 2. Specialist: only if the system needs it

| Category | What it is | Use | Avoid | One tip |
|---|---|---|---|---|
| Real-time data (C6) | Live-updating numbers: tickers, counters, order books | Lightweight Charts for price series (`sources/lightweight-charts`); AG Grid or react-data-grid for blotters (`guides/tables.md`); TanStack Query or a WebSocket for the feed | Digit-rolling animations on live data | Batch updates (≤ 4–10 per second per cell), a brief flash on change, a "Live · updated 14:02" pill and a Pause button. Maps: `guides/maps.md` |
| Network graphs (C4) | Dots joined by lines: relationships, dependencies, fraud rings | Sigma.js + Graphology for thousands of nodes; React Flow for editable diagrams; ECharts graph for small ones | Showing the whole graph at once | Start from one node and expand on click; offer a list of the same connections |
| Timelines and scheduling (C5) | Calendars, booking grids, Gantt charts | FullCalendar Standard or Schedule-X core | FullCalendar Premium (paid) unless budgeted | Drag to move plus a form to edit (non-drag alternative); show the time zone and a "now" line |
| Canvas and whiteboards (D2) | A Miro-style infinite board | Excalidraw (embed); React Flow for node-based tools; Konva or PixiJS to build your own | tldraw SDK (needs a paid licence key) | Zoom to fit, a minimap, arrow keys nudge the selection |
| Real-time collaboration (D3) | Live cursors, presence, several people editing | Yjs; Loro or Automerge as alternatives | Building your own sync | Avatars of who's here, named cursors, a clear offline / reconnecting state |
| Media editing (D4) | Video and audio timelines | wavesurfer.js for waveforms + Konva for tracks; WebCodecs for decoding | Remotion (licence limits), ffmpeg.wasm (unmaintained) | J/K/L to play, snapping, waveforms computed ahead of time |
| Rich text (D5) | A Notion- or Docs-style editor | Tiptap (open-source editor) or Lexical; Yjs for co-editing | Tiptap AI (paid), BlockNote AI (GPL or paid) | Slash menu and markdown shortcuts. Inline AI in editors: `guides/agentic-ui.md` §7 |
| Commerce and configurators (D6) | Product pages, variant pickers, checkout | model-viewer for 3D and AR (`guides/3d.md`); React Three Fiber for custom scenes | Heavy 3D where photos would do | The price updates with each choice; unavailable options shown disabled with the reason |
| Generative UI (E5) | AI replies containing interactive charts or forms | AI SDK tool calls that render your own components (`guides/agentic-ui.md`) | Rendering model-written HTML | Let the model pick from a fixed set of your components and fill their props |

## 3. Foundations and marketing pages

| Category | What it is | Use | One tip |
|---|---|---|---|
| Typography (A2) | Fonts and type sizes | One variable sans, self-hosted with Fontsource; Tailwind's type scale | 14–16 px body in apps; `tabular-nums` for numbers in tables and KPIs |
| Layout and density (A3) | Spacing, grids, compact vs comfortable | Tailwind's 4 px spacing scale; a 12-column grid for dashboards | Two densities at most, saved per user (`guides/shell-panels.md` §1) |
| Performance (A8) | Keeping it fast and smooth | TanStack Virtual for long lists | Interactions under 200 ms; animate only transform and opacity; reserve space so nothing jumps while loading |
| Content and microcopy (A9) | The words in the UI | GOV.UK style: plain words | Buttons name the action ("Save changes", not "OK"); errors say what happened and how to fix it |
| Icons and imagery (A10) | Icon sets, images, generated backgrounds | Lucide (shadcn's default); Haikei (haikei.app, free web app) for SVG waves, blobs and gradients, exported as files | Pair icons with a label or an `aria-label`; serve AVIF or WebP |
| Landing page sections (F1) | Hero, proof, pricing, FAQ | shadcn blocks; Magic UI free components | See `hero/*`, `pricing-table/*` and `social-proof/*` in the gallery. Paid template shops (GetLayers, Magic UI Pro) aren't sources |
| Animated component kits (F1, A5) | Copy-in animated React components (text effects, buttons, cards, dialogs, backgrounds) installed with the shadcn CLI | All MIT and maintained (checked 19 Oct 2026 by opening their demos with the keyboard and reading their source). **Smooth UI** (smoothui.dev) first for app UI: 191 of 229 components handle reduced motion and its country picker gets focus exactly right (`accessibility/smoothui-country-picker-search-recent`). **Motion Primitives** for subtle motion: correct modal, but fix focus return and its "Open dialog _r_7_" names (6 of 33 handle reduced motion). **Magic UI** for landing effects only: its video dialog has no dialog role and Escape doesn't close it (5 of 79). **Watermelon UI** for breadth (600+): good quick-look docs, but focus doesn't move into dialogs (2 of 131 animated). **Unlumen UI**: ⌘K menu works, but its trigger can't be tabbed to (1 of 106; Pro is paid) | Whatever the kit, copy one component and test it: Tab to it, Enter, Escape (focus back on the trigger), and reduced motion on. See `guides/motion.md` |
| Scroll storytelling (F2) | Pinned sections and reveals as you scroll | Native CSS scroll-driven animation first, Motion for React (`guides/motion.md`) | Respect reduced motion; never hijack the scroll speed |
