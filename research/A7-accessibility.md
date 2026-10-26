# A7 Accessibility: research for the guide

Research for `guides/accessibility.md` (written since; where this note and the guide differ, the guide wins), for **desktop web apps on React/Next + Tailwind, no shadcn**.
Researched 2026-10-17. Legend: **[v]** verified today (npm, curl, package source or page text); **[r]** reasoned
from experience or secondary sources, so confirm before relying on it; **[u]** unverified.
npm figures come from `npm view <pkg> version license time.modified`. Weekly downloads come from
`api.npmjs.org/downloads/point/last-week` (2026-10-06 to 10-12).

## 0. Headline findings
- **Our target is WCAG 2.2 AA.** It has been ISO/IEC 40500:2025 since Oct 2025 [v]
  (https://www.w3.org/WAI/news/2025-10-21/wcag22-iso). **EN 301 549 v4.1.1**, which aligns the EU standard
  to WCAG 2.2 AA, was published 2 Sep 2026. It is not yet cited in the EU Official Journal, so it does not
  yet give presumption of conformity [v]
  (https://www.deque.com/blog/en-301-549-v4-1-1-is-final-what-changed-what-it-means-and-what-you-should-do/).
- **No one headless library covers a desktop app.** `react-aria-components` 1.22.1 is the only candidate
  with date/time pickers, tree, table/grid and keyboard drag-and-drop. Its Toast is still exported as
  `UNSTABLE_Toast` [v, from the package's exports].
- **Base UI shipped 1.0.0 on 2025-12-11 and is now `@base-ui/react` 1.9.0.** The old
  `@base-ui-components/react` is deprecated with the message "Package was renamed to @base-ui/react" [v].
  The new package already has more weekly downloads than the unified `radix-ui` package
  (17.4M vs 17.1M) [v].
- **Reach UI is dead.** Its README says "Reach-UI is currently not maintained!". The last release was
  0.18.0 in Oct 2022, its peer range is React `^16.8 || 17.x`, and the reach.tech docs returned HTTP 526 [v].
- **axe-core does not check WCAG 2.2 target size by default.** `target-size` is the only `wcag22aa` rule
  and it ships `enabled: false`. It runs only if you pass `withTags([... 'wcag22aa'])` [v, tested
  against axe-core 4.14.0].
- **`eslint-plugin-jsx-a11y` 6.10.2 was last released 2024-10-26.** Its peer range stops at ESLint ^9, but
  ESLint is now 10.13.0, so you get peer warnings [v]. Next 16's `eslint-config-next` still depends on it [v].
- **ARIA still correlates with more errors.** In WebAIM Million 2026, home pages with ARIA averaged
  59.1 errors against 42 without [v] (https://webaim.org/projects/million/).
- **Desktop screen-reader share** (WebAIM SR survey #11, 2026): JAWS 55.0%, NVDA 32.9%, VoiceOver 6.5% [v]
  (https://webaim.org/projects/screenreadersurvey11/). Smoke-test on NVDA+Chrome or JAWS+Chrome first,
  then VoiceOver+Safari.

## 1. Best topics: the questions the guide must answer
1. **Which headless primitives library should I use, and can I mix them?** Cover component coverage,
   maintenance, Tailwind fit, and which components force a second library.
2. **How do I draw focus?** The `:focus-visible` ring spec (width, offset, colour, two-tone) that passes
   1.4.11, 2.4.7 and the AAA 2.4.13, survives forced-colors, and is not hidden under sticky headers
   (2.4.11).
3. **Where does focus go?** Opening and closing dialogs, popovers and menus, deleting the focused item,
   route changes in the Next App Router, and skip links.
4. **What is the keyboard model for composite widgets?** Tab versus arrow keys, roving tabindex versus
   `aria-activedescendant`, typeahead, Home/End, and multi-select with Shift and Ctrl/Cmd.
5. **Which app shortcuts are safe?** Avoid clashes with screen readers and browsers (2.1.4), let users
   remap or disable them, and expose them with `aria-keyshortcuts`.
6. **When should I use ARIA, and when not?** Native first, APG patterns for composites, and the common
   misuses.
7. **How do I announce async and streaming content?** Live regions, toasts, form errors, "saving…"
   states, and LLM token streams (4.1.3).
8. **Which WCAG 2.2 criteria bite in desktop apps?** Target size 2.5.8, focus not obscured 2.4.11,
   dragging alternatives 2.5.7, consistent help 3.2.6, redundant entry 3.3.7 and accessible
   authentication 3.3.8.
9. **How do user preferences work?** Reduced motion, contrast and transparency, forced colors (Windows
   High Contrast), zoom to 200–400% and reflow, and which Tailwind variants map to each.
10. **What does "accessible" mean for data-dense UI?** Grids and tables, trees, charts (see
    `guides/charts.md`), and virtualised lists with `aria-rowcount` / `aria-setsize`.
11. **How do I test it?** Lint, unit (role queries), axe in Playwright (with the right tags), ARIA snapshots,
    a manual keyboard pass, and screen-reader smoke tests. What automation cannot catch.
12. **Do we have legal exposure?** The European Accessibility Act (applies from 28 Jun 2025), EN 301 549
    status, scope (B2C versus B2B), the microenterprise exemption, and the accessibility statement.

## 2. Recommended defaults
| Topic | Default | Why | When to depart |
|---|---|---|---|
| Primitives | **`react-aria-components`** for app UI. Style it with Tailwind through its `data-*` state attributes (`data-focus-visible:`, `data-pressed:`, `data-selected:`). The `tailwindcss-react-aria-components` plugin is optional. | Widest coverage: only it has DatePicker, Calendar, TimeField, Tree, Table, GridList and keyboard DnD [v]. Adobe tests across screen readers and documents its reasoning (https://react-spectrum.adobe.com/blog/building-a-combobox.html, https://react-spectrum.adobe.com/blog/date-and-time-pickers-for-all.html). | Small, overlay-heavy app with no date or tree needs: use **Base UI** (smaller API, active, Radix-like). Already on Radix: stay, and add RAC only for combobox and date. |
| Mixing libraries | Pick **one** library for overlays (dialog, popover, menu). You may add a second only for leaf widgets it lacks. | Nested overlays from different libraries each run their own focus scope, outside-click and `aria-hidden`/`inert` logic and can fight over focus [r] | None in practice |
| Focus ring | `:focus-visible` with **`outline: 2px solid` + `outline-offset: 2px`**. The colour must be ≥3:1 against the adjacent background. In Tailwind: `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[--focus]`. On mixed or photo backgrounds, use a **two-tone** ring (outline plus a contrasting inner `box-shadow`). | 1.4.11 needs 3:1. 2.4.13 (AAA) asks for an area of at least a 2px perimeter and a 3:1 change (https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html). For two-tone rings and dashed-outline maths, see https://www.sarasoueidan.com/blog/focus-indicators/. GOV.UK uses yellow plus black to pass on any background (https://design-system.service.gov.uk/get-started/focus-states/). | Inputs inside a bordered field can thicken or recolour the border instead, if the change is ≥3:1 |
| Ring in forced colors | Use `outline`, not `ring-*`, as the indicator. If you must hide the default outline, use **`outline-hidden`**, never `outline-none`. | `ring-*` is a box-shadow, and box-shadow is forced to `none` in forced-colors mode [v] (https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors). Tailwind v4 `outline-hidden` keeps a transparent 2px outline that becomes visible in forced colors [v] (https://tailwindcss.com/docs/outline-style). | A `forced-colors:` variant that restores `outline` explicitly |
| Focus not obscured | Set `html { scroll-padding-top: <sticky header height>; scroll-padding-bottom: <sticky footer height> }`. Non-modal panels and toasts must not cover the focused element. | 2.4.11 AA; sufficient technique C43 is CSS scroll-padding [v] (https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) | Content the user opened themselves (for example a non-modal side panel) can be dismissed with Esc instead |
| Dialog focus | Use the library dialog, or native `<dialog>.showModal()`. On open, focus the **first field or the dialog heading** (`tabindex=-1`) when content is long; never focus the close button first in destructive confirms. On close, **return focus to the trigger**, or to a logical successor if the trigger is gone. The background is `inert`. | APG dialog pattern (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). `inert` is in Chrome 102, Firefox 112 and Safari 15.5 [v]. | Alert dialogs focus the least destructive action |
| Route changes (Next App Router) | Keep Next's built-in **route announcer**, which reads `document.title`, then `<h1>`, then the pathname [v] (https://nextjs.org/docs/architecture/accessibility), and give every route a unique `metadata.title`. For full-view changes, move focus to the page `<h1 tabindex="-1">`. For in-place master/detail updates, leave focus where it is. | User testing found that announcing plus focusing a heading or wrapper works best (https://www.gatsbyjs.com/blog/2019-07-11-user-testing-accessible-client-routing/) | Filters and tabs that update the URL are not navigations, so don't move focus |
| Skip link | First focusable element: "Skip to main content" → `<main id="main" tabindex="-1">`. In app shells, also add "Skip to navigation" or landmark-level jumps. | GOV.UK pattern (https://design-system.service.gov.uk/components/skip-link/) | Apps with F6-style pane cycling can offer that as well, not instead |
| Composite keyboard model | Tab enters and leaves a composite. Arrow keys move inside it, Home/End jump to the ends, and a single tab stop is kept with **roving tabindex**. Use `aria-activedescendant` only when DOM focus must stay in a text input (combobox). | APG keyboard interface (https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/) | Data grids: arrow keys move between cells, Enter/F2 edits a cell, Esc restores grid navigation (https://www.w3.org/WAI/ARIA/apg/patterns/grid/) |
| Typeahead | Printable keys in listbox, menu and tree jump to a matching item. The buffer resets after **1000 ms**. | Both React Aria (`TYPEAHEAD_DEBOUNCE_WAIT_MS = 1000`) and Radix Select (`setTimeout(…, 1e3)`) use this value [v, package source] | None |
| App shortcuts | Use **modifier-based** shortcuts (Ctrl/Cmd+K, Ctrl/Cmd+Enter). If you add single-character shortcuts (`j`, `k`, `?`), provide a setting to turn them off or remap them, or make them active only when the component has focus. Expose them with `aria-keyshortcuts` and in a `?` help sheet. Never bind Insert, Caps Lock or Ctrl+Option combos. | 2.1.4 Character Key Shortcuts (https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html). NVDA/JAWS use Insert or Caps Lock as their modifier and VoiceOver uses Ctrl+Option [r]. | None |
| ARIA use | Native elements first: `<button>`, `<a href>`, `<input>`, `<select>` for simple choices, `<dialog>`, `<details>`. Add ARIA only through an APG pattern, and prefer the library's implementation over hand-rolling. Never put `role` on an element without its required keyboard support. | APG "No ARIA is better than bad ARIA" (https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/). WebAIM Million 2026: 59.1 versus 42 errors [v]. | None |
| Live regions | Keep one polite `role="status"` region and one `role="alert"` region **mounted at app root, empty at load**, and write messages into them. Use toasts for non-critical updates only: they must not auto-dismiss under ~5s and must not hold the only path to an action. For form submit errors, use a GOV.UK-style **error summary** that takes focus, plus inline messages tied with `aria-describedby`. | 4.1.3 Status Messages (https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html). Regions inserted together with their content are often not announced [r]. GOV.UK error summary (https://design-system.service.gov.uk/components/error-summary/). | Critical, time-sensitive errors use `role="alert"` |
| Streaming / LLM output | Don't make the streaming body a live region. Announce "Generating…" and then "Response ready" (or a one-sentence summary) through the polite status region. Render the finished answer as a normal `<article>` with a heading, so it can be reached in browse mode. Offer a "Stop" button that stays reachable. | No standard covers this; 4.1.3 is the closest. Token-by-token updates get fragmented or re-read [r]. The `aria-busy` suppression technique is inconsistently supported [u]. | Short single-line results (for example "3 rows updated") can go to the status region verbatim |
| Target size | Pointer targets at least **24×24 CSS px**, or a 24px circle of clearance. Our icon buttons default to **32×32** in dense toolbars and **40×40** elsewhere. | 2.5.8 AA (https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). axe's `target-size` rule only runs with `wcag22aa` tags [v]. | Inline text links, and native unstyled controls, are exempt |
| Dragging | Every drag action (reorder, resize, move between columns, range-select) needs a **single-pointer alternative**: move buttons or menu items ("Move up", "Move to…"), resize handles that respond to arrow keys, or React Aria `useDragAndDrop`, which adds keyboard and screen-reader DnD. | 2.5.7 AA (https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html). React Aria's DnD write-up: https://react-spectrum.adobe.com/blog/drag-and-drop.html. | Freehand drawing, where the path is essential |
| Consistent help / redundant entry | Keep Help (docs link, chat, contact) in the **same relative place** in the shell on every page. Prefill or offer "same as before" for data the user already entered in a flow. | 3.2.6 A (https://www.w3.org/WAI/WCAG22/Understanding/consistent-help.html). 3.3.7 A (https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html). | Re-entry for security (password confirm) is allowed |
| Authentication | Allow paste and password managers: `autocomplete="username"` / `"current-password"` / `"one-time-code"`. Prefer **passkeys** or magic links. No puzzle CAPTCHA without a non-cognitive alternative. | 3.3.8 AA (https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html) | Object-recognition CAPTCHAs are allowed at AA, but avoid them |
| Contrast | Text ≥4.5:1, or ≥3:1 for large text (≥24px, or ≥18.66px bold). UI component boundaries, icons and focus indicators ≥3:1. Disabled controls are exempt, but keep them legible. | 1.4.3 and 1.4.11 (https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). APCA is not normative. | None at AA; coordinate tokens with A1 |
| Reduced motion | Animate under `motion-safe:` and swap to fades or instant changes under `motion-reduce:`. No parallax or large zoom when reduced motion is set. Autoplaying motion longer than 5s needs a pause. | 2.3.3 AAA (https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) and 2.2.2 AA. Supported in all engines [v]. | Spinners and progress indicators may keep moving (essential) |
| Contrast and transparency preferences | `contrast-more:` makes borders solid and removes tinted backgrounds. For glass or blurred materials, also make them opaque under a **custom `reduced-transparency` variant** and under `contrast-more:`. Don't rely on the transparency query alone. | `prefers-reduced-transparency` is in Chrome 118+, behind a flag in Firefox, and **not in Safari** [v, MDN BCD 8.1.6] | None |
| Forced colors | Test in Windows High Contrast (DevTools: emulate `forced-colors: active`). Use system colours (`CanvasText`, `Highlight`, `ButtonText`) for custom checkboxes, selected rows and focus. Add `forced-color-adjust: none` only on swatches and charts. | Box-shadow, background images and custom colours are overridden [v, MDN] | None |
| Testing stack | 1. `eslint-plugin-jsx-a11y` (comes with `eslint-config-next`). 2. Testing Library `getByRole` queries. 3. `@axe-core/playwright` per route and per open overlay, using `withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'])`. 4. Playwright `toMatchAriaSnapshot` for key widgets. 5. Manual keyboard pass. 6. NVDA+Chrome smoke test per release. 7. Guidepup to automate the hot paths if they are stable. | Automated tools found ~57% of issues by volume (https://www.deque.com/blog/automated-testing-study-identifies-57-percent-of-digital-accessibility-issues/). Playwright guidance: https://playwright.dev/docs/accessibility-testing and https://playwright.dev/docs/aria-snapshots. | Teams without Windows: VoiceOver+Safari smoke test, but JAWS and NVDA are ~88% of primary desktop use [v] |
| Legal (EAA) | Treat **WCAG 2.2 AA plus an accessibility statement** as the bar for anything sold to EU consumers. | EAA (Directive 2019/882, https://eur-lex.europa.eu/eli/dir/2019/882/oj) applies from **28 Jun 2025** to consumer-facing services such as e-commerce, banking, e-books, transport ticketing and electronic communications [r]. Microenterprise service providers (<10 staff and ≤€2M turnover) are exempt [r]. The standard route is EN 301 549, and v4.1.1 (WCAG 2.2 based) is pending OJEU citation [v]. Not legal advice. | Pure B2B internal tools are usually outside EAA scope, but public-sector buyers (Web Accessibility Directive, Section 508) still demand conformance reports (VPAT/ACR) [r] |

## 3. Tools
### 3a. Headless primitive libraries
| Package | Version · licence · `time.modified` [v] | Weekly dl [v] | Best at | React/Next/Tailwind fit | Maintenance signal [v] | Known gaps |
|---|---|---|---|---|---|---|
| `react-aria-components` (+ `react-aria` hooks 3.53.1) | 1.22.1 · Apache-2.0 · 2026-10-09T20:23:50Z | 4.87M (hooks 9.89M) | Most complete app widget set: ComboBox, DatePicker/DateRangePicker/Calendar, TimeField, Table, GridList, **Tree**, TagGroup, ColorPicker, **keyboard and screen-reader DnD**, i18n (RTL, calendars, number formats), `usePress` normalisation | Client components (`"use client"`). Unstyled with `data-*` states, so Tailwind v4 data variants work directly; `tailwindcss-react-aria-components` 2.2.0 adds shorthands (579k/wk). Starter kits exist. | 11 stable releases in 2026; Adobe-owned and used in Spectrum | Toast is still `UNSTABLE_Toast` [v]. Larger bundle than Radix or Base UI [r, see parallel benchmark]. Render-prop and collection API has a learning curve. No Menubar or NavigationMenu export [v]. |
| `radix-ui` (unified) / `@radix-ui/react-*` | 1.8.1 · MIT · 2026-10-14T13:29:49Z (react-dialog 1.3.1, same day) | 17.05M unified; react-dialog 73.5M | Overlays (Dialog, AlertDialog, Popover, DropdownMenu, ContextMenu, HoverCard, Tooltip), NavigationMenu, Menubar, Toast, Toolbar, Slider, OTP and password-toggle fields | `asChild` composition; `data-state` attributes for Tailwind. Mature in Next. | 12 stable releases in 2026; WorkOS-owned [v npm]. Secondary sources describe slower feature work [r]. | **No Combobox, DatePicker, Tree, Table or NumberField** [v, from the dependency list of `radix-ui`]. Select is custom, not native. |
| `@base-ui/react` (Base UI, MUI team) | 1.9.0 · MIT · 2026-10-09T08:52:44Z. **1.0.0 on 2025-12-11**. Old name `@base-ui-components/react` 1.0.0-rc.0 is deprecated (still 434k/wk). | **17.38M** | Radix-style API with an active roadmap: **Combobox, Autocomplete**, Menu, Menubar, NavigationMenu, Select, **Toast**, Drawer, NumberField, OTPField, Meter, Slider, ContextMenu, PreviewCard | `render` prop composition and `data-*` attributes; works well with Tailwind. Optional `date-fns` peer [v], which suggests date work in progress [u]. | 10 stable releases in 2026. Changelogs repeatedly list "accessibility, focus … fixes". 1.6.0 aligned the Accordion keyboard model with APG [v, releases page]. | **No DatePicker, Calendar, Tree or Table** [v, docs nav]. Younger than the others, so fewer screen-reader regression reports exist [r]. |
| `@ariakit/react` | 0.4.42 · MIT · 2026-10-14T08:59:44Z | 1.41M | Low-level, strictly APG composites: Combobox (incl. multi-select), Composite/roving focus, Menu, Menubar, Select, Tab, Toolbar, Dialog, Hovercard, Tooltip | Hooks and components with a store API; Tailwind-friendly. Good for building *custom* composites. | 22 releases in 2026, mainly a single core maintainer [r]; still **0.x after years**, so API churn is possible | **No DatePicker, Toast, Tree, Table or Slider** [v, from package exports] |
| `@headlessui/react` | 2.2.10 · MIT · 2026-04-13T16:13:37Z (insiders build). 2.2.10 itself was 2026-04-07. | 7.40M | Tailwind Labs' small set: Combobox (with `virtual` prop), Listbox, Menu, Dialog, Popover, Tabs, Disclosure, RadioGroup, Switch, Field/Fieldset | Designed for Tailwind; Tailwind Plus templates use it | **1 stable release in 2026** [v] | ~10 components. No Toast, DatePicker, Tree, Table, Slider or public Tooltip [v, dist exports]. |
| `@reach/*` | dialog / combobox 0.18.0 · MIT · 2025-09-09 metadata touch. Real release 2022-10-13. | 159k / 69k | n/a | Peer `react ^16.8 \|\| 17.x`, so it does not support React 18 or 19 [v] | **Unmaintained** (README) [v] | Do not use; migrate to RAC or Base UI |

**Coverage matrix** (component names from each package's exports or docs nav, verified 2026-10-17):

| Need | RAC | Radix | Base UI | Ariakit | Headless UI |
|---|---|---|---|---|---|
| Dialog / Popover / Menu | ✓ | ✓ | ✓ | ✓ | ✓ |
| Combobox / Autocomplete | ✓ / ✓ | ✗ / ✗ | ✓ / ✓ | ✓ / ✓ | ✓ / ✗ |
| Date & time pickers, Calendar | ✓ | ✗ | ✗ | ✗ | ✗ |
| Toast | unstable | ✓ | ✓ | ✗ | ✗ |
| Tree | ✓ | ✗ | ✗ | ✗ | ✗ |
| Table / grid | ✓ (Table, GridList) | ✗ | ✗ | ✗ (Composite to build one) | ✗ |
| Keyboard drag and drop | ✓ | ✗ | ✗ | ✗ | ✗ |
| Menubar / NavigationMenu | ✗ / ✗ | ✓ / ✓ | ✓ / ✓ | ✓ / ✗ | ✗ / ✗ |
| Slider / NumberField | ✓ / ✓ | ✓ / ✗ | ✓ / ✓ | ✗ / ✗ | ✗ / ✗ |

**Recommendation by situation**
- **Default for a desktop web app:** `react-aria-components`. It's the only library that covers date/time, tree,
  table and accessible DnD, all of which desktop apps hit sooner or later. Pair it with **Sonner** (A6) for toasts
  until RAC's Toast is stable, and check Sonner's live-region behaviour in the A6 work.
- **Light app, mostly overlays and menus, and you want a Radix-shaped API:** `@base-ui/react`. It's the most
  actively developed and has Combobox, Toast and Drawer. Add RAC `DatePicker` only if you need dates (as a leaf
  widget, inside Base UI overlays).
- **Already on Radix:** keep it. Add RAC (or Ariakit) for Combobox and add RAC for dates and trees; don't migrate
  just for its own sake.
- **Building a bespoke composite** (custom grid, multi-select chips, command menu): Ariakit's `Composite` and
  `Combobox` primitives are the cleanest base.
- **Avoid for new work:** Headless UI (thin set, slow cadence) and Reach UI (unmaintained).

### 3b. Testing and linting
| Package | Version · licence · `time.modified` [v] | Weekly dl [v] | Best at | Fit | Known gaps |
|---|---|---|---|---|---|
| `axe-core` | 4.14.0 · MPL-2.0 · 2026-10-15T14:15:57Z | 79.7M | Rules engine with 105 rules [v]; rules are tagged `EN-301-549v4` / `EN-9.x` for EAA mapping [v] | Used by every runner below | Only one `wcag22aa` rule (`target-size`), which is **disabled unless you select its tag** [v]. Covers ~57% of issues by volume (Deque). Can't judge focus order, meaningful names or announcements. |
| `@axe-core/playwright` | 4.14.0 · MPL-2.0 · 2026-10-15T16:39:05Z | 14.3M | `new AxeBuilder({ page }).withTags([...]).include(sel).analyze()` in E2E. Run it **after opening each overlay**, because axe only sees what's rendered. | Playwright 1.64.1 [v]; works against `next start` | Same limits as axe-core. Flaky on animations, so disable motion in the test context (`reducedMotion: 'reduce'`). |
| `eslint-plugin-jsx-a11y` | 6.10.2 · MIT · 2024-10-26T04:45:18Z | 50.2M | Static JSX checks (alt text, ARIA props and roles, interactive handlers on non-interactive elements) | `eslint-config-next` 16.4.2 depends on `^6.10.0` [v]. Turn on `plugin:jsx-a11y/strict` for more than Next's five default rules. | No release for ~2 years. Peer range ESLint ≤9 while ESLint is 10.13.0 [v]. Blind to components whose role comes from a library (e.g. `<Button>` from RAC). |
| `@guidepup/playwright` / `@guidepup/guidepup` | 0.20.0 / 0.36.4 · MIT · 2026-10-14 / 2026-10-17 | 44k | Drives **real** VoiceOver (macOS) and NVDA (Windows) from tests | Needs macOS or Windows CI runners | Pre-1.0; slow and brittle, so use it for a few critical flows only [r] |
| `jest-axe` / `vitest-axe` | 11.0.0 (2026-07-26) / 0.1.0 (2025-01-22) · MIT | 2.70M / 1.67M | Component-level axe in jsdom | Quick feedback in unit tests | jsdom has no layout, so contrast and target-size results are meaningless (confirmed: axe needs canvas and layout) [v]. `vitest-axe` is stale. |

## 4. Public reference pages (all load without login)
| # | URL | HTTP [v] | Best-in-class moment | Suggested capture |
|---|---|---|---|---|
| 1 | https://design-system.service.gov.uk/components/error-summary/default/index.html | 200 | **Error summary**: `data-module="govuk-error-summary"` [v] focuses the summary on load. Each link jumps to its field and scrolls so the *label* is visible. This is the reference for form-error focus management. | Selector `.govuk-error-summary`. Load the page and screenshot (the summary has focus). Then press Tab once and screenshot the first error link's focus style (yellow background, black underline). |
| 2 | https://design-system.service.gov.uk/get-started/focus-states/ | 200 | **Two-tone focus**: yellow with a black bottom border "to meet … 1.4.11 … on any background colour" [v]. Strongest public focus spec. | Selector `main`. Tab about 6 times into the body links and buttons, screenshotting each. Also capture the page with DevTools `forced-colors: active`. |
| 3 | https://react-spectrum.adobe.com/react-aria/ComboBox.html | 200 | **ComboBox**: DOM focus stays in the input while `aria-activedescendant` moves. Screen readers get option counts and selection announcements. Works with touch and VoiceOver (see the blog post). | First `[role=combobox]` on the page: Tab to it, type `a`, press ArrowDown twice, and screenshot input plus `[role=listbox]` with the highlighted option [u: exact demo content]. |
| 4 | https://react-spectrum.adobe.com/react-aria/DatePicker.html | 200 | **Segmented date field**: each segment is a spinbutton, ArrowUp/Down changes it, typing auto-advances, and it is locale-aware. Best accessible date entry available in open source. | Tab into the first DatePicker, press ArrowUp on the month segment, then open the calendar (button, or Alt+ArrowDown [u]) and screenshot the grid with the focused day. |
| 5 | https://react-spectrum.adobe.com/react-aria/dnd.html | 200 | **Accessible drag and drop**: keyboard and screen-reader DnD with announced drop targets. The model answer for 2.5.7. | In the first list example, Tab to an item, press Enter to start the drag [u: key], press ArrowDown, and screenshot the drop indicator. |
| 6 | https://www.w3.org/WAI/ARIA/apg/patterns/treeview/examples/treeview-navigation/ | 200 | **Canonical tree keyboard model**: arrow keys expand and collapse, typeahead, `*` expands siblings, with a keyboard-support table on the page | Selector `[role=tree]`. Tab once into the tree, press ArrowDown twice, ArrowRight, and type a letter; screenshot each step. Also capture the "Keyboard Support" table. |
| 7 | https://primer.style/accessibility/focus-management | 200 | **GitHub's documented focus rules**: return focus after deleting items, never lose focus, arrow keys within toolbars [v, page text]. github.com itself returned 400 through this sandbox's proxy, so the live UI focus rings are **unverified here**. | Screenshot the guidance sections. Capture the live github.com focus ring separately with `scripts/capture.mjs` from an unproxied machine. |
| 8 | https://www.sarasoueidan.com/blog/focus-indicators/ | 200 | **Live demos of WCAG 2.4.13 maths**: dashed-outline area, `outline: 9px double` with a `box-shadow` two-tone ring | Tab to the demo buttons in the "double outline" section and screenshot them on light and dark backgrounds |

Not used: `https://spectrum.adobe.com/page/focus-indicator/` and `/page/keyboard-focus/` both returned **404** [v].
The Spectrum home page is 200 but has no specific accessibility moment to capture, so the React Aria docs above are the
better Adobe reference.

## 5. Disagreements with `research/categories.md` row A7
1. **Tools are incomplete and mix two kinds of thing.** The row lists React Aria, Radix, Ariakit and axe-core. Add
   **Base UI** (`@base-ui/react`, stable since Dec 2025 and the highest-downloaded headless library at 17.4M/wk),
   and split the row into *primitives* (RAC, Base UI, Radix, Ariakit) and *testing*
   (`@axe-core/playwright`, `eslint-plugin-jsx-a11y`, Playwright ARIA snapshots, Guidepup). Explicitly
   mark Headless UI as thin and Reach UI as unmaintained, so agents don't pick them.
2. **The "Covers" column is missing the parts that bite most:** WCAG 2.2 criteria (2.5.8, 2.4.11, 2.5.7, 3.3.8,
   3.2.6, 3.3.7), live regions and streaming announcements, forced colors, testing, and the EAA / EN 301 549 legal
   status. Add them.
3. **"Reduced transparency" should not stand alongside motion and contrast.** `prefers-reduced-transparency` has no
   Safari support and is behind a flag in Firefox [v], so the guide should treat it as progressive enhancement
   tied to `contrast-more:`. It overlaps A4 (materials) more than A7.
4. **The references are off.** "Adobe Spectrum" (spectrum.adobe.com) has no capturable accessibility moment (focus
   pages 404). The accessibility reference is **React Aria's docs and blog** (react-spectrum.adobe.com). Add the
   **W3C APG examples** (canonical keyboard models) and **GitHub Primer** (focus management) next to GOV.UK.
5. **Ownership overlaps with B4 Overlays and B5 Forms.** Both list Radix and React Aria. The *primitives
   library choice* is one decision and should live in the A7 guide, with B4 and B5 referring to it, otherwise
   three guides may recommend three libraries. Reduced motion is shared with A5, so A7 should own the rule and A5
   the techniques.
6. **Status ◐ is generous.** No library entry is about accessibility itself. Only five items carry the
   `accessible` tag (two patterns, three chart or 3D source profiles) [v, `catalog.json`]. It's closer to ✗
   for this category's actual scope.
7. **Priority P1: agree.** Every brief touches focus, keyboard and contrast. The EAA (in force since June 2025, with
   the WCAG 2.2-aligned EN 301 549 v4.1.1 published Sep 2026) raises the stakes for anything consumer-facing in
   the EU.

## Sources (all returned HTTP 200 on 2026-10-17 unless noted)
- WCAG 2.2 What's new: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ · ISO adoption: https://www.w3.org/WAI/news/2025-10-21/wcag22-iso
- Understanding docs: target-size-minimum, focus-not-obscured-minimum, dragging-movements, consistent-help,
  accessible-authentication-minimum, redundant-entry, focus-appearance, character-key-shortcuts, status-messages,
  non-text-contrast, animation-from-interactions (all under https://www.w3.org/WAI/WCAG22/Understanding/)
- APG: https://www.w3.org/WAI/ARIA/apg/practices/read-me-first/ · /practices/keyboard-interface/ · /patterns/dialog-modal/ ·
  /patterns/grid/ · /patterns/treeview/ · /patterns/combobox/examples/combobox-autocomplete-list/
- GOV.UK: https://design-system.service.gov.uk/get-started/focus-states/ · /components/error-summary/ · /components/skip-link/
- React Aria blog: https://react-spectrum.adobe.com/blog/building-a-combobox.html · /blog/drag-and-drop.html ·
  /blog/date-and-time-pickers-for-all.html · /blog/building-a-button-part-1.html
- Library docs: https://base-ui.com/react/overview/accessibility · https://base-ui.com/react/overview/releases ·
  https://www.radix-ui.com/primitives/docs/overview/accessibility · https://ariakit.org/components/combobox · https://headlessui.com/
- Focus: https://www.sarasoueidan.com/blog/focus-indicators/ · https://primer.style/accessibility/focus-management
- CSS: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors · …/prefers-reduced-transparency ·
  https://tailwindcss.com/docs/outline-style · https://tailwindcss.com/docs/hover-focus-and-other-states
- Next: https://nextjs.org/docs/architecture/accessibility · Routing study: https://www.gatsbyjs.com/blog/2019-07-11-user-testing-accessible-client-routing/
- Testing: https://playwright.dev/docs/accessibility-testing · https://playwright.dev/docs/aria-snapshots · https://www.guidepup.dev/ ·
  https://www.deque.com/blog/automated-testing-study-identifies-57-percent-of-digital-accessibility-issues/
- Data: https://webaim.org/projects/million/ · https://webaim.org/projects/screenreadersurvey11/
- EU: https://eur-lex.europa.eu/eli/dir/2019/882/oj (HTTP 202) ·
  https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/union-equality-strategy-rights-persons-disabilities-2021-2030/european-accessibility-act_en ·
  https://www.deque.com/blog/en-301-549-v4-1-1-is-final-what-changed-what-it-means-and-what-you-should-do/
- Reach UI status: https://raw.githubusercontent.com/reach/reach-ui/dev/README.md (reach.tech returned 526)
