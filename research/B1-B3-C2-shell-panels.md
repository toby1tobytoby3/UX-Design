# B1 App shell, B3 Panels and docking, C2 Dashboards: research notes

Research for rows B1, B3 and C2 of `research/categories.md`: the frame of a desktop web app (sidebar, top bar, workspace
switcher, breadcrumbs, URL state, keyboard regions), the workspace inside it (split panes, dockable tabs, dashboard tiles),
and the dashboards that live in it. Target briefs: trading terminal, video editor, agent workspace, admin dashboards.
Researched 2026-10-18 for our stack (React/Next + Tailwind; shadcn/ui as copy-in code, Base UI flavour).
Builds on `guides/charts.md` (chart choice, stat tiles) and `guides/accessibility.md`. It doesn't repeat them.

Evidence key: **[V]** checked today (npm, curl, package source, or a headless Playwright probe). **[D]** from a vendor's own
docs, fetched today. **[M]** from memory or product observation, not re-verified today.

---

## 0. Headline findings
1. **None of the free docking engines both docks and resizes by keyboard, except FlexLayout** [V probe + source]. Dockview's
   sashes are 4 px `div`s with no `role="separator"`, and they can't be focused. Its keymap (F6 between groups, Ctrl+] tabs) and
   keyboard docking are **Enterprise-only** (*"Keyboard navigation Enterprise"*, licence matrix) [D]. FlexLayout 0.11.1 (MIT,
   2026-09-26) renders focusable `separator`s with `aria-valuenow` and a rebindable `keyMap` [V]. The catalogue says not to
   carry FlexLayout forward without a comparison. It now has to be **in** that comparison.
2. **react-resizable-panels v4 is the split-pane default, and it now does more than split panes** [V]. Separators follow the APG
   window splitter: arrows move 5 %, Home/End, Enter collapses, F6 cycles. Double-click resets. The hit target is at least
   **10 px fine / 20 px coarse** (`resizeTargetMinimumSize`). `useDefaultLayout({storage})` handles persistence, including
   cookies for SSR. A new **2-D `Grid`/`Cell`/`Gridline`** API handles fixed, resizable dashboard grids. shadcn's `Resizable` wraps v4.
3. **The Dockview boundary is narrower than "MIT core vs enterprise" suggests** [D]. Free: floating groups, **pop-out windows**,
   edge groups, save/restore, ARIA tabs and regions, screen-reader announcements. Paid: **keyboard docking, the F6/spatial
   keymap**, layout history (undo), pinned and multi-row tabs, auto-hide edges, the DnD compass and smart guides.
4. **Mantine 9 AppShell has the best-documented resize keyboard model** [D, V probe]: arrows ±10 px, Shift+arrow ±50 px,
   Home/End for min/max, **Esc cancels a drag**, double-click resets, plus `collapseThreshold`. Primer uses 3 px steps
   (`role="slider"`), and Atlassian uses a 17 px hit area around a 3 px line [V source].
5. **Shell sizes converge on 240–320 px expanded and 48 px rail** [V]. shadcn sidebar: 16rem (256) / 3rem (48), cookie
   `sidebar_state` (7 days), ⌘/Ctrl+B. Primer panes: 256 / 296 / 320, min 256. Atlassian side nav: default 320, min 240,
   max 50vw, main min 320, toggle Ctrl+[. vscode.dev measured: sidebar 300, activity bar 44, sashes 4 px.
6. **golden-layout fails the six-month gate**: its last release, 2.6.0, came out on **2022-09-26** [V]. Exclude it.
   react-grid-layout's catalogued demo URL (`0-showcase.html`) now **404s**; the live one is `00-showcase.html` [V].
7. **Dashboards: every authority says "one question, one screen, most important top-left"** [V]. Few: *"consolidated and
   arranged on a single screen so the information can be monitored at a glance"*. Grafana: *"A dashboard should tell a story
   or answer a question"* and don't refresh faster than the data changes. Carbon: separate **presentation** dashboards from
   **exploration** ones, and make linked charts *"mirror chart modifications like filter and zoom"*.

---

## 1. B1 App shell and navigation
### Topics the guide must answer
1. Sidebar: widths, collapsible to an icon rail, resizable or not, and what it remembers.
2. Workspace / project / object levels, and the workspace switcher.
3. Top bar vs sidebar (and both).
4. Breadcrumbs in apps: hierarchy, switchers on segments.
5. Tabs within pages vs navigation tabs.
6. URL state (nuqs): what belongs in the URL, deep links, Back behaviour.
7. Density modes.
8. Keyboard: skip links, landmarks, F6 region cycling, the sidebar toggle shortcut.
9. Responsive narrowing at desktop widths (1024–1920), before the mobile breakpoint.

### Recommended defaults
| Topic | Default | Why (source) | Depart when |
|---|---|---|---|
| Sidebar width | **240 px expanded** (allowed range 200–400 if resizable), **48 px rail**, labels always visible when expanded. Main area min **320 px** | shadcn 256/48 [V]; Primer pane min 256 [V]; Atlassian min 240, default 320, max 50vw, `defaultMainMinWidth = 320` [V source]; vscode.dev 300 [V probe] | Deep trees (files, channels): 280–320 and resizable. Rail at 56 px if icons carry a small label underneath (Teams, Discord style) [M] |
| Collapse to rail | Rail shows icons **with tooltips on the right**, the active state is kept, and the workspace avatar stays at the top. Toggle with a visible button **and** ⌘/Ctrl+B (rebindable). Collapse state is a per-device preference: cookie, read on the server so there's no flash | NN/g: *"Don't hide the navigation behind icons"* [V], so the rail is an option, not the default. Fluent: tooltip *"on the right of the nav node"* [D]. shadcn writes the cookie, but your layout must read it [V source] | ⌘B is "bold" in rich-text panes: use Ctrl+[ (Atlassian [V]) or ⌘\ there |
| Resizable sidebar | Off by default. If on: drag edge plus keyboard (±10 px, Shift ±50, Home/End, Esc cancels, double-click resets). Drag below ~120 px collapses to the rail | Mantine `useAppShellResize` (`collapseThreshold`) [D]; Atlassian splitter [V] | Data-heavy or tree-heavy products where names truncate |
| Levels and switcher | Three levels: **workspace › project › object**. The switcher sits at the **top of the sidebar** (avatar + name + chevron), opens a menu with search, recent, "Create workspace" and settings, and has a shortcut. Switching keeps the same section if it exists in the target | Linear, Vercel, Slack all put it top-left [M]. Carbon: the left panel *"does not support three tiers of navigation… use tabs within the page"* [V] | A single-workspace product: drop the switcher and put the account menu bottom-left |
| Top bar vs sidebar | **Sidebar** for more than 5 sections or frequent switching. A **thin top bar (48 px)** holds global tools: search/⌘K, notifications, help, account. A top bar alone works for ≤ 5 sections | Carbon: *"Use the left panel if there are more than five secondary navigation items, or if you expect a user to switch… frequently"* [V]; Atlassian top nav height 48 [V source]; GOV.UK Service navigation for small services [V] | Workbenches (editor, terminal) put the menu in the top bar and keep the left edge for an activity bar (VS Code) |
| Breadcrumbs | Show **hierarchy, not history**. The last item is the current page (not a link, `aria-current="page"`). In apps, segments double as switchers (project ▾). Collapse the middle to "…" when narrow | NN/g: *"Should Display the Current Location in the Site's Hierarchical Structure, Not the Session History"* [V]; GOV.UK: don't use on flat structures; collapse on mobile [V] | Flat apps (one level): no breadcrumbs, just a page title |
| Tabs within pages | In-page tabs for **sibling views of one object** (Overview / Activity / Settings). The selected tab is in the URL (`?tab=` or a sub-route), so it deep-links. ≤ 7 tabs, one row, overflow to a menu | NN/g in-page vs navigation tabs [V]; Carbon third tier → tabs [V] | Tabs that change the URL path are navigation: render them as links with `aria-current`, not as `role=tab` |
| URL state | **In the URL:** filters, sort, time range, selected tab, selected object id, search query, page. **Not in the URL:** panel sizes, collapse state, density, theme (these are preferences). Use nuqs: `history:'replace'` for typing and sliders, `'push'` for navigational changes (tab, object). On the server, read with `createLoader` / `createSearchParamsCache` | nuqs throttles URL writes to **50 ms** by default; values below 50 are ignored; `limitUrlUpdates: debounce(…)` for search [D]. Server loaders [D] | Sensitive values (emails, tokens): never in the URL (catalogue limitation) |
| Deep links | Every object, tab, filter set and dashboard time range is linkable. "Copy link" copies the **current** URL including state. Opening a deep link **expands the sidebar ancestry** of the object | [M] standard (Linear, GitHub) | – |
| Density | Two modes: **Comfortable** (default; 32 px controls and table rows) and **Compact** (24–28 px rows, 12–13 px text). Stored per user. It changes spacing tokens, never hit areas below 24 px | WCAG 2.5.8: targets *"at least 24 by 24 CSS pixels"* [V]; Primer `padding="condensed"` [V]; Material/Fluent size scales [M] | Trading and ops screens default to Compact |
| Skip links and landmarks | First focusable element: "Skip to main content". In workbenches, offer **several targets** (Atlassian: *"Skip to: Top Bar · Sidebar · Main Content"* [V probe]). Landmarks: `header`, `nav aria-label`, `main`, `aside aria-label` | WCAG 2.4.1 Bypass Blocks [V]; GOV.UK skip link [V]; Atlassian: slot order *"determines the keyboard tab order, screen reader reading order"* [D] | – |
| F6 region cycling | **F6 / Shift+F6** move focus between top-level regions (top bar → sidebar → main → panel → status bar), restoring the last focused element in each | APG splitter: *"F6 (Optional): Cycle through window panes"* [V]; VS Code "Focus Next Part" (F6 probe moved focus status bar → activity bar) [V] | Browser F6 focuses the address bar in some browsers: also provide ⌘K "Focus sidebar/main" commands [M] |
| Narrowing on desktop | **≥ 1440:** everything inline. **1280:** secondary/inspector panel collapses by default. **≤ 1024:** side panels become **overlays**, and the sidebar goes to a rail. **< 768:** the sidebar becomes a sheet | Atlassian: *"On small viewports (1024px and below), the panel becomes an overlay"* [D]; shadcn `MOBILE_BREAKPOINT = 768` [V]; WCAG 1.4.10 reflow at 320 px [M] | Pro tools with a declared minimum (e.g. 1280) may show a "best on a larger screen" note instead of reflowing |

## 2. B3 Panels, docking and split layouts
### Topics the guide must answer
1. Which workspace model: split panes, dockable tabs or dashboard tiles.
2. Resize handles: hit area, look, keyboard, double-click reset, min/max, collapse.
3. Persisting layouts: per user, per device, named layouts, reset, versioning.
4. Pop-out windows (multi-monitor).
5. Focus management across panes.
6. Drag-to-dock affordances and their keyboard alternative.
7. Expensive content during resize (charts, video, canvas).

### Three workspace models (pick one per surface; they don't substitute for each other)
| Model | Fits | Tool | Don't use it for |
|---|---|---|---|
| **Split panes** (fixed set of regions; user resizes and collapses) | Agent workspace (chat · artefact · inspector), admin list-detail-inspector, video editor (preview · inspector over timeline) | react-resizable-panels (shadcn `Resizable`) | Users opening *N* instances of a view, or rearranging regions |
| **Dockable tabs** (user moves, groups, floats and pops out views) | Trading terminal, IDE, monitoring workbenches with many views and multiple monitors | Dockview (free scope) or FlexLayout | Simple apps: docking adds a learning cost and lots of state to persist |
| **Dashboard tiles** (cards on a snapping grid; reorder and resize; reflow) | User-customised dashboards (Grafana, Datadog) | react-grid-layout; rrp `Grid` if tiles are fixed and only resized | Docking or tabbed views; fixed curated dashboards (use CSS Grid) |

### Recommended defaults
| Topic | Default | Why (source) | Depart when |
|---|---|---|---|
| Handle look and hit area | **1 px visible line**, **≥ 10 px invisible hit area** (fine pointer), ≥ 20–24 px on coarse pointers. Highlight on hover (after ~150 ms) and on focus. Cursor `col-resize` / `row-resize`, and `w-resize`/`e-resize` at a limit | rrp default `{fine:10, coarse:20}` [V]; Atlassian 17 px hit, 3 px line [V]; Dockview and VS Code sashes are only 4 px [V probe]: too small, so don't copy | A handle with a grip icon on touch-first tablets |
| Keyboard | Handle is `role="separator"`, focusable, `aria-valuenow/min/max`, **`aria-controls` = primary pane**, `aria-label` = primary pane's name. Arrows ±10 px (Shift ±50); Home/End = min/max; **Enter collapses and restores**; Esc cancels a drag | APG window splitter [V]; Mantine keys [D]; rrp keys [V source]. rrp renders **no `aria-label`** on the basics demo [V probe], so add one | – |
| Double-click | **Reset to default size** | rrp, Mantine, Primer all do it [V] | – |
| Min sizes | Main/editor ≥ **320–400 px**. Side panels min **200–240 px**, max ~50 %. Collapsible panes snap to 0 (or the rail) when dragged below about half their min | Atlassian main min 320, side nav min 240 / max 50vw [V]; rrp `collapsedThreshold` defaults to half the distance between collapsed and min [V] | Timelines and terminals: height min 120–160 px |
| Collapse | Every non-main pane is collapsible: a toggle button in its header, Enter on its separator, and a shortcut (VS Code: ⌘B sidebar, ⌘J panel [M]). Collapsed panes leave a **visible edge tab or rail** to bring them back | VS Code panel: *"Don't use [the Panel] for Views that are meant to be always visible since users often minimize the Panel"* [D] | – |
| Persistence | Sizes and collapse state: **per user per device** (localStorage, or a **cookie when SSR must render the right size**). Named workspace layouts: **server-side per user** (cross-device). Store a **schema version**; on a mismatch or parse error, fall back to the default and say so ("Layout reset after update"). Always offer **"Reset layout"** | rrp `useDefaultLayout({storage, onlySaveAfterUserInteractions})` and server-rendering examples [V]; Dockview `fromJSON` *"will throw an error and reset gracefully"* [D]; Mantine "Reset layout" example [V probe] | Kiosk or shared screens: no persistence |
| Pop-out windows | Allow for dockable workspaces only. Same-origin blank page; one state store; the window docks back on close. **No maximise in pop-outs.** Pop-outs are not restored on reload by default (browsers block `window.open` without a gesture): show "Restore 2 windows" instead | Dockview: requires `/popout.html`, *"Popout groups cannot be maximized"* [D]; popup blocking [M] | – |
| Focus across panes | Each pane is a **labelled `region`**. F6/Shift+F6 cycle panes and remember the last focus in each. Closing a tab focuses the neighbouring tab. Collapsing a pane that holds focus moves focus to its toggle or separator. Floating groups are **non-modal `dialog`s** | Dockview core does regions, non-modal dialog for floats, `activateNext()` API [D]; its F6 keymap is Enterprise [D], so we bind F6 to `activateNext` ourselves | – |
| Drag to dock | While dragging, show a **tinted drop overlay**: the centre adds as a tab, the edge thirds split. Show the tab's ghost. **Esc cancels.** Provide a menu alternative on every tab ("Split right / Move to group… / Float / Pop out") for keyboard and single-pointer users | Dockview demo overlay [V probe, drag moved a tab between groups]; WCAG 2.2 SC 2.5.7 Dragging Movements needs a non-drag alternative [M] | – |
| Expensive content while resizing | Resize CSS live, but **debounce re-layout of charts, canvas and video to the end of the drag** (or rAF-throttle). Use `onLayoutChanged` (end) rather than `onLayoutChange` (every move) for saves | rrp: *"it is recommended to use the `onLayoutChanged` callback"* [V d.ts]; Atlassian debounces resize-end 500 ms [V source] | – |

## 3. C2 Dashboards
### Topics the guide must answer
1. Presentation vs exploration dashboard (decide first).
2. KPI hierarchy and the **answer line**.
3. Tile layout: fixed grid vs bento vs user-customisable.
4. Shared time range and filters; tile overrides.
5. Cross-filtering and drill-down.
6. Empty, loading, stale and partial-failure tiles.
7. Refresh and freshness.
8. User-customisable dashboards: when they're worth it.

### Recommended defaults
| Topic | Default | Why (source) | Depart when |
|---|---|---|---|
| Kind | Decide **presentation** (status at a glance, little interaction) vs **exploration** (filter, drill, compare). Don't build one screen that tries to be both | Carbon dashboards [V]; NN/g operational vs analytical [V] | – |
| Answer line | First line under the title: **one sentence that answers the dashboard's question** with the period ("Revenue $1.2M, up 8% vs last 30 days; refunds normal"). Generated from data, not hand-written. Then 3–5 headline KPIs | Grafana: *"tell a story or answer a question… general to specific"* [V]; Few: *"most important information… monitored at a glance"* [V] | Wallboards: KPIs only, no sentence |
| KPI tile | Label, **value (tabular nums)**, delta vs a **named comparison period**, sparkline, definition behind an ⓘ. Max **5** headline KPIs, the primary one largest and top-left | Carbon: *"most important data should have the highest contrast and occupy the largest area"*, F-pattern [V]; existing entry `dashboard/stripe-home-kpi-overview` | – |
| Layout | **Fixed 12-column CSS Grid**, tiles aligned to rows of equal height, 16–24 px gutters, primary content top-left. "Bento" (mixed spans) only for presentation dashboards with ≤ 7 tiles. Fits one screen at 1440×900 for presentation dashboards | Few: single screen [V]; Carbon: "limit the number of metrics" [V] | User-customisable dashboards → react-grid-layout (below) |
| Time range and filters | **One global time picker** (top right) plus a filter bar, all in the URL (nuqs). Every tile follows it. A tile that overrides it shows a **visible badge** ("Last 7d") | Grafana: global picker; panel "Relative time" *"causes them to be different than… the dashboard time picker"* [D]; play.grafana.org dashboard: picker, refresh and Edit in the toolbar [V probe] | – |
| Cross-filtering | Clicking a mark (bar, slice, row) **filters the other tiles**. The filter appears as a chip in the global bar with ✕ and "Clear all". Highlight, don't hide, the source tile's other marks | Carbon linked charts *"mirror chart modifications like filter and zoom"* [V]; Superset/Looker cross-filter chips [M] | Presentation dashboards: no cross-filter |
| Drill-down | Clicking a KPI or chart title opens a **detail page with the same filters in the URL**, with breadcrumbs back. Prefer a page or a side panel to a modal | Grafana: *"Hierarchical dashboards with drill-downs to the next level"* [V] | – |
| Tile states | **Per-tile** loading skeletons sized to the final tile. **Empty:** say why and what would populate it. **Error:** keep the title, give a plain reason, **Retry**, and keep the rest of the dashboard working (error boundary per tile). **Stale:** keep the last value, dimmed, with "as of 10:42" | Grafana panels fail individually ("An unexpected error happened ▸ Details") [V probe], but at narrow widths the titles truncate to "M…", so don't copy that; keep titles ≥ 1 line | – |
| Freshness | Header: "Updated 2 min ago" plus a manual Refresh. Auto-refresh no faster than the data changes. **Pause when the tab is hidden.** Live tiles (≥ 1 Hz) get a "Live" dot, not a timestamp | Grafana: *"if your data changes every hour, then you don't need to set the dashboard refresh rate to 30 seconds"* [V]; Page Visibility API [M] | Trading: live by default (C6) |
| User-customisable | Only when **different roles need different tiles** and they'll come back weekly. Then: a curated default, an explicit **Edit layout** mode (drag, resize, add from a library), "Reset to default", and a keyboard alternative (move up/down, size S/M/L menu) | Grafana Edit mode [V probe]; RGL has no keyboard move/resize (no key handlers in its dist) [V grep] | – |
| Variables | Use **one parameterised dashboard** (template variables: service, region, customer) rather than copies | Grafana: *"Prevent sprawl by using template variables"* [V] | – |

---

## 4. Tools (npm checked 2026-10-18 [V]; date = current version's publish date)
| Package | Version · licence · date | Best at | React/Next fit; SSR | Flags | Headless bench? |
|---|---|---|---|---|---|
| `react-resizable-panels` | 4.14.5 · MIT · 2026-10-12 | Split panes and a new 2-D `Grid`; APG keyboard; hit-target minimums; collapse; `useDefaultLayout` | Best SSR story: cookie storage, server-rendering and server-components examples [V links]. v4 renamed the API (`Group`/`Panel`/`Separator`; 4.0.0 was 2025-12-16) | No docking, tabs or pop-outs. Add `aria-label` to separators | **Yes** [V]: drag; ArrowRight 50→55; dblclick |
| shadcn `Resizable` | copy-in (registry `base-nova`) | Tailwind skin over rrp v4 | Same as rrp | Visible line `w-px` with a 4 px `after:`; rrp still enforces the 10 px hit target | via rrp |
| shadcn `Sidebar` | copy-in (base-nova deps: `@base-ui/react` merge-props/use-render, `cva`; registry deps button, input, separator, sheet, skeleton, tooltip, use-mobile) | Collapsible sidebar, icon rail, groups, menus, cookie persistence, ⌘B | Writes cookie `sidebar_state` (7 days); **your layout must read it** for SSR. Mobile < 768 → Sheet | The rail is `tabIndex={-1}` (mouse only; keyboard uses the trigger or ⌘B). No drag-resize width | **Yes** [V]: 256 → 48 px with Ctrl+B, cookie set |
| `dockview` (+ `dockview-react`, `-core`) | 8.6.0 · MIT · 2026-10-16 | Dockable tabs, groups, floating, **pop-outs**, edge groups, save/restore, ARIA tabs and regions, live announcements | Client-only DOM engine: render in a client component and load the layout JSON after mount [M] | Sashes **not keyboard-operable**, 4 px [V]. F6 keymap, keyboard docking, layout history, pinned tabs are paid | **Yes** [V]: sash drag +120 px; tab dragged into another group |
| `dockview-enterprise` | 8.6.0 · "SEE LICENSE IN LICENCE.md" (proprietary) · 2026-10-16 | Superset: importing it *"enables all"* enterprise features plus a licence key | Drop-in | **Never install by accident**: a side-effect import turns on licensed features | n/a |
| `flexlayout-react` | 0.11.1 · MIT · 2026-09-26 | Docking with tabsets, borders, pop-outs, pinned tabs, tab groups, **keyboard-resizable splitters**, rebindable `keyMap` advertised via `aria-keyshortcuts` | Peers React 18/19; client-only [M] | 0.x versioning; Caplin-maintained; JSON model API less React-idiomatic | **Yes** [V]: 4 focusable separators with values |
| `react-grid-layout` | 2.3.0 · MIT · 2026-10-05 | Draggable, resizable dashboard tiles; responsive breakpoints; compaction | v2 TS rewrite; `useContainerWidth`; SSR via `measureBeforeMount` [D README] | No keyboard move or resize; demo URL moved to `/examples/00-showcase.html` | **Yes** [V]: 25 items; localStorage example |
| `allotment` | 1.20.6 · MIT · 2026-10-12 | VS Code-derived split view, looks native | *"only works in a browser"*: `dynamic(…, {ssr:false})` [D] | **No keyboard resize, no separator role** [V probe]. Choose rrp instead | Drag only |
| `react-mosaic-component` | 7.2.1 · Apache-2.0 · 2026-09-28 | Tiling window manager (binary or n-ary tree), tabs as nodes | Pulls in **react-dnd** + 4 backends | No keyboard semantics found | **Yes** [V]: demo shows 4 windows |
| `rc-dock` | 4.1.0 · Apache-2.0 · 2026-09-30 | Docking with float/maximise/new window | Depends on rc-component tabs/menu, lodash | Ant-flavoured | not probed |
| `golden-layout` | 2.6.0 · MIT · **2022-09-26** | – | – | **Fails six-month gate: exclude** | – |
| `@mantine/core` AppShell | 9.7.3 · MIT · 2026-10-17 | Complete shell: header/navbar/aside/footer, responsive collapse, **`useAppShellResize`** with full keyboard model | SSR-friendly; restore with `initialSizes` [D] | Brings the whole Mantine system (theme conflicts with Tailwind/shadcn) | **Yes** [V]: 2 focusable separators |
| `nuqs` | 2.10.2 · MIT · 2026-10-08 | Type-safe URL state, throttled/debounced writes, server loaders | Next ≥ 14.2, React Router, TanStack Router adapters | Keep preferences out of the URL | **Yes** (Back/Forward restores state) |
| `@zag-js/splitter` (Ark UI Splitter) | 1.46.0 · MIT · 2026-10-11 | Framework-agnostic splitter state machine with separator semantics [M] | Use only if already on Ark/Zag | – | not probed |
| `@atlaskit/navigation-system` | 11.3.0 · Apache-2.0 · 2026-10-15 | Reference implementation: skip links, resizable side nav and panel, Ctrl+[ | Atlaskit styling and compiled CSS: read, don't adopt | – | reference |

**Keyboard window-splitter semantics:** rrp, FlexLayout, Mantine and `@zag-js/splitter` implement them. There's no standalone
"APG splitter" npm package worth adding.
**Suggested stack:** shadcn `Sidebar` (patched: keyboard rail toggle, configurable shortcut) + rrp for split panes + nuqs.
Dockview free **or** FlexLayout only for dockable workbenches. Decide with the bench below, weighing keyboard access
(FlexLayout) against pop-out and API polish (Dockview). react-grid-layout only for user-customisable dashboards.

**Benchmark harness (future `benchpanels/`; same tasks per library, Playwright at 1440×900):** (a) drag a sash +120 px and
read the new size; (b) keyboard: focus the separator, ArrowRight ×3, Enter (collapse), Enter (restore), Home/End;
(c) double-click reset; (d) save → reload → sizes restored with **no layout shift** (CLS, SSR cookie); (e) docking libs: drag
a tab into another group's centre and edge, float it, pop it out (`context.waitForEvent('page')`); (f) F6 cycling and focus
after closing a tab; (g) axe on separators and tabs; (h) bundle size. Probes already verified (a), (b) and (e) work headless.

## 5. Public reference pages (no login; `curl -sL` status today)
| # | URL | Code | The moment | Suggested capture |
|---|---|---|---|---|
| 1 | https://dockview.dev/demo/ | 200 | **A trading terminal** in Dockview: correlation, FX, order book, blotter, vol surface; edge groups "Explorer" and "Outline"; Shift+click floats a tab | Drag `.dv-tab:has-text("Correlation")` to the centre of the Orders group and screenshot **mid-drag** (drop overlay) [V]. Shift+click a tab for a floating group. Pop-out icon top-right of a group |
| 2 | https://react-resizable-panels.vercel.app/examples/collapsible-panels (+ `/examples/persistent-layout`, `/examples/grid-basics`) | 200 | APG splitter: focus ring, collapse with Enter, persistence, 2-D grid | Focus `[role=separator]`, press ArrowRight ×3, Enter, and screenshot each. (`/examples/persistent-layouts`, plural, is an in-app 404 [V]) |
| 3 | https://mantine.dev/app-shell/?e=ResizableAppShell | 200 | Resizable navbar and header with **Reset layout**, keyboard hint text | Focus the navbar separator, Shift+ArrowRight ×2, screenshot, then "Reset layout" |
| 4 | https://vscode.dev/ | 200 | Activity bar, sidebar, editor groups, panel; F6 part cycling; ⌘B/⌘J | Ctrl+B (sidebar 300 → 0 [V]), Ctrl+J panel, drag the 4 px `.monaco-sash`; split the editor (Ctrl+\\) |
| 5 | https://caplin.github.io/FlexLayout/demos/v0.11/demo/ | 200 | Docking with borders, tab groups, pop-out, **keyboard splitters** | Tab to a `.flexlayout__splitter`, use arrows; open the "Tab Groups" layout from the select |
| 6 | https://ui.shadcn.com/view/new-york-v4/sidebar-07 (+ `/blocks/sidebar`, `/examples/dashboard`) | 200 | Collapse to icon rail (256 → 48), team switcher, nav groups; dashboard-01 KPI cards + chart + table | Screenshot expanded, press Ctrl+B, screenshot collapsed [V]. Hover a rail icon for its tooltip. (Base-style `/view/base-nova/...` 404s; use new-york-v4 for captures) |
| 7 | https://play.grafana.org/d/000000110/business-metrics and `/d/appenv-banking-exec-overview/banking-executive-overview` | 200 | Global time picker, refresh interval, Edit, text intro panel, KPI row. Headless today, **data plugins failed**, so it accidentally shows **per-panel failure tiles** | Capture as is for "partial failure", and in a real browser for normal. Open the time picker (`[data-testid*="TimePicker"]`) |
| 8 | https://react-grid-layout.github.io/react-grid-layout/examples/00-showcase.html (+ `07-localstorage.html`) | 200 | Drag and resize tiles with compaction; localStorage persistence | Drag `.react-grid-item` 2 columns right; drag `.react-resizable-handle`; reload the localStorage example |
| 9 | https://atlassian.design/components/navigation-system/examples | 200 | **Multi-target skip links** ("Skip to: Top Bar · Sidebar · Main Content"), resizable side nav | Press Tab once on load and screenshot the skip menu |
| 10 | https://www.tradingview.com/chart/ | 200 | Full charting workbench without login (AAPL loaded [V]): toolbars, right watchlist panel, layout menu | Screenshot; open the multi-chart layout menu (saving layouts needs login) |
| also | https://nomcopter.github.io/react-mosaic/demo (200, 4 tiled windows), https://allotment.mulberryhousesoftware.com/ (200, VS Code-like split), https://docs.stripe.com/dashboard/basics (200, docs), https://linear.app/docs/favorites (200, docs) | | | |

**Weak:** demo.elastic.co (Kibana) stalls on a cookie banner in headless Chromium [V]; try a real browser. p.datadoghq.com
returns 403 [V]. golden-layout.com loads, but the project is unmaintained.

## 6. Logged-in products: screens to capture
| Product | Exact screens |
|---|---|
| **Linear** | (1) Sidebar expanded: workspace switcher open (search, workspaces, "Create or join"); (2) Favorites with a folder; (3) sidebar collapsed (`[`) and peeking; (4) issue page breadcrumbs (Team › Project › Issue) with the switcher on a segment; (5) density / display options popover |
| **Vercel dashboard** | (1) Team switcher in the top-left breadcrumb (Team ▾ / Project ▾); (2) project tabs in the top bar (Deployments, Analytics, Logs…); (3) Observability with time-range picker and a shared filter bar; (4) Logs with a resizable detail panel |
| **Figma** | (1) Layers/Assets left panel and Design/Prototype right panel at default widths; (2) UI3 collapsed "minimised UI" (Shift+\\); (3) drag-resizing the left panel |
| **Notion** | (1) Sidebar: workspace switcher, Favorites / Teamspaces / Private; (2) hover-to-peek after collapse (⌘\\); (3) drag sidebar width; (4) peek side panel for a page |
| **Stripe dashboard** | (1) Home: KPI row with comparison period selector, "Gross volume" chart, account switcher top-left; (2) the time-range control and "compare to" menu; (3) Reports drill-down from a KPI; (4) sandbox banner |
| **Datadog** | (1) Dashboard with template variables bar and global time picker; (2) a widget in error / no-data state; (3) cross-filter by clicking a series; (4) Edit layout mode (free-form vs grid) |
| **TradingView** | (1) Multi-chart layout picker (1/2/4/8 charts); (2) saved layouts menu; (3) right panel with watchlist/details split; (4) pop-out of a chart |
| **Grafana Cloud** | (1) Dashboard edit mode with panel drag/resize; (2) panel "Relative time" override badge; (3) variables bar; (4) dashboard row collapse |
| **GitHub** | (1) Repo with file tree resizable pane (Primer `PageLayout` resizable, 3 px keyboard steps); (2) Projects board/table with side panel |
| **Bloomberg-style / IBKR TWS web** | Docked monitors, linked symbol groups (colour channels), saved workspaces |

## 7. Disagreements with `research/categories.md` (B1, B3, C2) and the catalogue
1. **B3 is P2, but four of ten scenarios need it now.** `guides/scenarios.md` already flags "Thin: panels and docking (B3)"
   for the trading terminal and video editor, and the agent workspace is a split layout. Raise **split panes to P1** (rrp
   defaults, cheap). Keep **docking at P2**, behind the bench.
2. **The catalogue's FlexLayout/Golden Layout note needs splitting.** Golden Layout: **exclude** (last release 2022-09-26).
   FlexLayout: **add to the shortlist**. It's maintained and is the only free docking engine with keyboard-operable
   splitters and a rebindable keymap [V].
3. **"Dockview (MIT core)" needs an accessibility caveat in `resources.csv`.** The free tier can't resize by keyboard, and F6
   and keyboard docking are paid. Our guide would have to add separators or commands on top. The catalogue's limitation text
   only mentions licensing.
4. **B1 tool list:** remove **Dockview** (a B3 tool, not a shell) and **Radix Primitives** (we're on Base UI; the shadcn
   base-nova sidebar depends on `@base-ui/react`). Add **Mantine AppShell** as the complete-shell alternative (now resizable
   with keyboard), and note that **shadcn Sidebar's cookie needs a server read**. Replace **Arc** as a reference (the
   catalogue already says so) with **VS Code (vscode.dev)** and **Atlassian navigation system**, both public and capturable.
5. **The catalogue's rrp limitation text is out of date:** *"Persistence and minimum-size behaviour need product rules"*.
   v4 ships `useDefaultLayout` (cookie/localStorage, SSR examples) and pixel or percentage min sizes. The product rules
   left are *which* state persists and how reset works. Also note the new **2-D Grid**, which overlaps RGL for fixed,
   resizable tile layouts.
6. **The RGL "best demo" URL is broken** (`examples/0-showcase.html` → 404). Use `examples/00-showcase.html` [V].
7. **C2 "Covers" says "bento layouts"; our default is a fixed 12-column grid.** Bento is a presentation/marketing layout and
   should be the exception (C2 guide question 3 already doubts rearrangement). "NL query" overlaps E5 (generative UI) and
   B7 (query builders). Keep only the dashboard-side contract in C2 (show the generated query, editable filters).
8. **C2 references are all logged-in** (Amplitude, Hex, Mixpanel, Stripe) and kepler.gl is a C3 map. Add **play.grafana.org**
   (public, global time picker, per-panel failures) and the **shadcn dashboard example** for capture; keep Stripe for KPI
   hierarchy (we already hold `dashboard/stripe-home-kpi-overview`).
9. **C2 tool list:** TanStack Virtual is a table concern (B6), not a dashboard one. Add **rrp Grid** (fixed resizable tiles)
   and a note that tile error boundaries and freshness are product code, not a library.
10. **Taxonomy gap:** `taxonomy.md` has `navigation` and `dashboard` but nothing for the shell or workspace. Add patterns
    **`app-shell`** (sidebar, rail, switcher, top bar) and **`workspace-layout`** (split panes, docking, tiles), with tags
    `resizable`, `docking`, `icon-rail`, `workspace-switcher`.

## Sources
- WAI-ARIA APG Window Splitter: https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/ [V]
- WCAG 2.2: Bypass Blocks https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html ; Target Size (Minimum) https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html [V]
- Carbon UI shell left panel https://carbondesignsystem.com/components/UI-shell-left-panel/usage/ ; header https://carbondesignsystem.com/components/UI-shell-header/usage/ ; dashboards https://carbondesignsystem.com/data-visualization/dashboards/ [V]
- Primer PageLayout https://primer.style/product/components/page-layout/ ; SplitPageLayout https://primer.style/product/components/split-page-layout/ ; `@primer/react` 38.42.0 source (pane widths, DragHandle) [V]
- Atlassian navigation system https://atlassian.design/components/navigation-system/layout/usage ; `@atlaskit/navigation-system` 11.3.0 source [V]
- Fluent 2 Nav https://fluent2.microsoft.design/components/web/react/core/nav/usage [D]
- VS Code UX guidelines https://code.visualstudio.com/api/ux-guidelines/overview , /views , /panel , /sidebars , /activity-bar (`.md` variants) [D]; accessibility https://code.visualstudio.com/docs/configure/accessibility/accessibility [D]
- NN/g: vertical nav https://www.nngroup.com/articles/vertical-nav/ ; breadcrumbs https://www.nngroup.com/articles/breadcrumbs/ ; tabs https://www.nngroup.com/articles/tabs-used-right/ ; dashboards https://www.nngroup.com/articles/dashboards-preattentive/ [V]
- Stephen Few, "Dashboard Confusion": https://www.perceptualedge.com/articles/ie/dashboard_confusion.pdf [V]
- GOV.UK Design System: service navigation, breadcrumbs, skip link https://design-system.service.gov.uk/components/ [V]
- Grafana dashboard best practices https://grafana.com/docs/grafana/latest/visualizations/dashboards/build-dashboards/best-practices/ ; panel time overrides https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/query-transform-data/ [V]
- Dockview licensing https://dockview.dev/docs/overview/licence ; accessibility, focus navigation, keyboard https://dockview.dev/docs/advanced/ ; popouts https://dockview.dev/docs/core/groups/popoutGroups ; load state https://dockview.dev/docs/core/state/load [D]
- FlexLayout accessibility https://github.com/caplin/FlexLayout/blob/master/docs/accessibility.md [D]
- Mantine AppShell https://mantine.dev/core/app-shell/ [D]; nuqs options https://nuqs.dev/docs/options , server https://nuqs.dev/docs/server-side [D]
- shadcn registry JSON: https://ui.shadcn.com/r/styles/base-nova/sidebar.json , /resizable.json , /use-mobile.json [V]
