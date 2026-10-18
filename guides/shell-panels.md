# App shell, panels and dashboards

`ux-find` reads this for the frame of a desktop app (sidebar, top bar, workspace switcher, breadcrumbs, URL state), the
workspace inside it (split panes, dockable tabs, tiles) and dashboards. **§1** is the shell, **§2** picks the workspace
model and library (benchmark in `benchpanels/`, same tasks for every library), **§3** is dashboards. All defaults are
starting points: depart when the situation calls for it and say why.

Research behind this guide, with sources: `research/B1-B3-C2-shell-panels.md`. Patterns: `navigation` (shells) and
`panels` (split, dock, tiles) in `catalog.json`; `dashboard/*` for dashboards. Chart choice and stat tiles:
`guides/charts.md`. Tables inside panels: `guides/tables.md`.

## 1. App shell (B1)
| Default | Why | When to depart |
|---|---|---|
| **Sidebar** when there are more than 5 sections or users switch often; a **48 px top bar** holds global tools (search/⌘K, notifications, help, account). Top bar alone for ≤ 5 sections | Carbon: left panel above five items or frequent switching | Workbenches (editor, terminal): menu in the top bar, an activity bar on the left edge |
| Sidebar **240 px** expanded (200–400 if resizable), **48 px icon rail** collapsed; main area min **320 px** | shadcn 256/48, Primer min 256, Atlassian 240–320 | Deep trees (files, channels): 280–320 px and resizable |
| Collapse to a rail is an option, not the default; the rail keeps the active state and **tooltips on the right**; toggle by a visible button **and** ⌘/Ctrl+B; collapse state in a **cookie read on the server** (no flash) | NN/g: don't hide navigation behind icons. shadcn writes the cookie, but your layout must read it | In rich-text panes ⌘B is bold: use Ctrl+[ or ⌘\ |
| Resizable sidebar off by default; when on, drag + keyboard (±10 px, Shift ±50, Home/End, **Esc cancels**, double-click resets), below ~120 px collapses to the rail | Mantine `useAppShellResize` | Tree-heavy products where names truncate |
| Three levels **workspace › project › object**; the **switcher at the top of the sidebar** (avatar, name, chevron) with search, recent, Create and a shortcut; switching keeps the same section if it exists | Linear, Vercel, Slack; Carbon: no third tier in the left panel, use page tabs | Single workspace: no switcher, account menu bottom-left |
| Breadcrumbs show **hierarchy, not history**; the last item is the current page (`aria-current="page"`, not a link); segments double as switchers (Project ▾); collapse the middle to "…" | NN/g; GOV.UK | Flat apps: a page title only |
| In-page tabs for **sibling views of one object**, ≤ 7, selected tab in the URL. Tabs that change the path are links with `aria-current`, not `role=tab` | NN/g in-page vs navigation tabs | – |
| **URL holds** filters, sort, time range, tab, selected id, query, page (`nuqs`: `replace` for typing and sliders, `push` for navigation). **Preferences don't**: panel sizes, collapse, density, theme | Links share the view; preferences are per user | Sensitive values never go in the URL |
| Density: **Comfortable** default (32 px rows), **Compact** 24–28 px, saved per user; never below 24 px targets | WCAG 2.5.8 | Trading and ops: Compact by default |
| Skip links first ("Skip to main content"; workbenches: "Skip to: Top bar · Sidebar · Main"); landmarks `header`, labelled `nav`, `main`, labelled `aside`; **F6 / Shift+F6** cycle regions and restore the last focus in each | WCAG 2.4.1; APG splitter; VS Code | Browsers where F6 hits the address bar: also ⌘K "Focus sidebar/main" |
| Narrowing: **≥ 1440** everything inline; **1280** the inspector collapses; **≤ 1024** side panels become overlays and the sidebar a rail; **< 768** sidebar is a sheet | Atlassian; shadcn breakpoint 768 | Pro tools with a declared minimum width |

## 2. Workspace: split panes, docking or tiles (B3)
Pick one model per surface; they don't substitute for each other.

| Model | Fits | Use | Not for |
|---|---|---|---|
| **Split panes** (fixed regions, user resizes and collapses) | Agent workspace (chat · artefact · inspector), list-detail-inspector, video editor | **react-resizable-panels** (shadcn `Resizable`) | Users opening N copies of a view or rearranging regions |
| **Dockable tabs** (move, group, float, pop out) | Trading terminal, IDE, monitoring workbenches across monitors | **Dockview** (free core) or **FlexLayout**, see the table below | Simple apps: docking costs learning and state |
| **Dashboard tiles** (snap grid, reorder, resize) | User-customised dashboards (Grafana, Datadog) | **react-grid-layout**; rrp `Grid` when tiles are fixed and only resized | Curated dashboards: plain CSS Grid |

PANELS_STACK

| Default | Why | When to depart |
|---|---|---|
| Handle: **1 px visible line, ≥ 10 px hit area** (≥ 20–24 px coarse pointers), highlight on hover (~150 ms) and focus, `col-resize`/`row-resize` cursor | rrp's minimum; Atlassian 17 px around 3 px. Dockview and VS Code sashes are 4 px: don't copy | Touch-first tablets: a grip |
| Handle is `role="separator"`, focusable, `aria-valuenow/min/max`, **`aria-controls` and `aria-label` = the primary pane**; arrows ±10 px (Shift ±50), Home/End min/max, **Enter collapses and restores**, Esc cancels a drag; **double-click resets** | APG window splitter. rrp renders no `aria-label` by default: add one | – |
| Main/editor min **320–400 px**; side panels **200–240 px** min, ~50 % max; collapsible panes snap shut below about half their min | Atlassian; rrp `collapsedThreshold` | Timelines and terminals: height min 120–160 px |
| Every non-main pane collapses (header button, Enter on its separator, a shortcut) and leaves a **visible edge tab or rail** to reopen it | VS Code: users minimise panels, so don't put must-see views there | – |
| Sizes and collapse: **per user per device** (localStorage, or a **cookie when SSR must render the right size**); named layouts: **server-side per user**; store a **schema version** and fall back to the default with "Layout reset after update"; always a **Reset layout** | rrp `useDefaultLayout`; Dockview `fromJSON` resets on error | Kiosks and shared screens: no persistence |
| Pop-outs only in dockable workspaces: same-origin page, one state store, dock back on close, no maximise; on reload offer "Restore 2 windows" (popup blockers) | Dockview pop-out docs | – |
| Each pane is a **labelled region**; F6 cycles panes; closing a tab focuses its neighbour; collapsing a pane that holds focus moves focus to its toggle; floating groups are **non-modal dialogs** | Dockview core regions; its F6 keymap is paid, so bind F6 to `activateNext()` yourself | – |
| Drag to dock shows a **tinted drop overlay** (centre = tab, edges = split) and **Esc cancels**; every tab has a menu: Split right · Move to group… · Float · Pop out | WCAG 2.5.7 needs a non-drag alternative | – |
| Resize CSS live; **re-layout charts, canvas and video at drag end** (rrp `onLayoutChanged`, not `onLayoutChange`) | Keeps dragging smooth | – |

## 3. Dashboards (C2)
| Default | Why | When to depart |
|---|---|---|
| Decide **presentation** (status at a glance) or **exploration** (filter, drill, compare) first; don't build one screen that tries to be both | Carbon; NN/g operational vs analytical | – |
| An **answer line** under the title, generated from data ("Revenue $1.2M, up 8% vs last 30 days; refunds normal"), then **≤ 5 KPI tiles**, the primary largest and top-left | Grafana: tell a story or answer a question; Few: one screen | Wallboards: KPIs only |
| KPI tile: label, value (`tabular-nums`), delta vs a **named period**, sparkline, definition behind ⓘ | `dashboard/stripe-home-kpi-overview` | – |
| **12-column CSS Grid**, equal-height rows, 16–24 px gutters; presentation dashboards fit 1440×900; bento (mixed spans) only for ≤ 7 tiles | Few; Carbon: limit metrics | User-customisable → react-grid-layout |
| **One global time picker** (top right) and filter bar, in the URL; a tile that overrides it shows a **badge** ("Last 7d") | Grafana relative-time override | – |
| Clicking a mark **cross-filters** the other tiles and adds a chip with ✕ and Clear all; highlight, don't hide, in the source tile | Carbon linked charts | Presentation dashboards: no cross-filter |
| Drill-down to a **page or side panel with the same filters in the URL**, breadcrumbs back; not a modal | Grafana hierarchical dashboards | – |
| **Per-tile** states: skeleton sized to the tile; empty says why; error keeps the title, a plain reason and Retry (an error boundary per tile); stale keeps the value dimmed with "as of 10:42" | Grafana panels fail individually | – |
| "Updated 2 min ago" + Refresh; auto-refresh **no faster than the data changes**; **pause when the tab is hidden**; ≥ 1 Hz tiles get a Live dot | Grafana refresh guidance | Trading: live by default |
| User-customisable only when roles need different tiles weekly: curated default, explicit **Edit layout** mode, Reset, and a keyboard alternative (move up/down, size S/M/L menu) | react-grid-layout has no keyboard move or resize | – |
| One **parameterised** dashboard (service, region, customer variables), not copies | Grafana: prevent sprawl | – |

## References
Bench: `benchpanels/`. Profiles: `sources/{react-resizable-panels,dockview,flexlayout-react,allotment,react-grid-layout}`.
Live references: `pattern: panels` and `navigation` entries in `catalog.json`. Logged-in screens to capture (Linear,
Vercel, Figma, Notion, Stripe, Datadog, TradingView, Grafana Cloud): `research/B1-B3-C2-shell-panels.md` §6.
