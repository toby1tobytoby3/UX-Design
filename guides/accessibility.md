# Accessibility

`ux-find` reads this for any accessibility question and **before choosing a component library** (dialogs, menus,
comboboxes, date pickers, toasts, tables). **Step 1** picks the primitives library from the benchmark in `benchui/`.
**Step 2** lists defaults for focus, keyboard, announcements and WCAG 2.2. **Step 3** is how to test.

Our target is **WCAG 2.2 AA** (ISO/IEC 40500 since October 2025). Research behind this guide, with sources:
`research/A7-accessibility.md`. Colour contrast lives in `guides/foundations.md`; reduced motion techniques in `guides/motion.md`.

## 1. Primitives: which library?
This is one decision for the whole app: overlays and menus from two libraries fight over focus. Add a second library
only for leaf widgets the first lacks. Scores in `SOURCES.md` (ui-primitives section).

| If the app… | Use | Score | Why (evidence) | Runner-up |
|---|---|---|---|---|
| Is a desktop app with forms, data, dates or trees (our default) | **React Aria Components** | 9.0 | 29/29 scripted keyboard and ARIA checks, 0 axe; the only library with date pickers, tree, table and keyboard drag and drop; state as `data-*` attributes for Tailwind | Base UI |
| Is light and overlay-heavy (menus, popovers, dialogs, toasts), no dates or trees | **Base UI** | 7.8 | Radix-shaped API, actively developed, has Combobox and Toast; one bench failure (combobox loses its name while open) | Radix |
| Already uses Radix | **Radix** (stay) | 8.3 | 23/23 checks, 0 axe; **no combobox, date picker, tree or table**, so add React Aria for those | – |
| Needs a bespoke composite (custom grid, chip multi-select, command menu) | **Ariakit** primitives | 7.0 | 29/29 checks; cleanest low-level `Composite`/`Combobox`; still 0.x | React Aria hooks |

**Using shadcn/ui** (allowed as copy-in code, `our-design/README.md`): its components are built on Base UI or Radix, so
choosing shadcn means choosing that primitives layer. Take the **Base UI** flavour, keep React Aria for date pickers, trees,
tables and drag and drop, and avoid shadcn's Command (built on the unmaintained cmdk).

Avoid for new work: **Headless UI** (6.8: about ten components, one release in 2026, combobox loses its accessible name
while open) and **Reach UI** (unmaintained, React 17 only). Toasts: React Aria's is still `UNSTABLE_Toast`, so pair it with
**Sonner** (`guides/motion.md`).

## 2. Defaults (guidance, not rules)
| Default | Why | When to depart |
|---|---|---|
| Focus ring: `:focus-visible` with `outline: 2px solid var(--color-focus)` and `outline-offset: 2px`, ≥ 3:1 against the adjacent background. Tailwind: `focus-visible:outline-2 focus-visible:outline-offset-2` | WCAG 1.4.11 and 2.4.7; meets most of 2.4.13 (AAA) | On mixed or photo backgrounds use a two-tone ring (outline + contrasting inner shadow), as GOV.UK does |
| Use `outline`, not `ring-*`, for focus; to hide a default outline use `outline-hidden`, never `outline-none` | Box-shadow rings vanish in forced-colors (Windows High Contrast) | – |
| `html { scroll-padding-top: <sticky header height> }` and keep toasts and non-modal panels off the focused element | WCAG 2.4.11 Focus not obscured (AA) | Panels the user opened can be dismissed with Esc instead |
| Dialogs: library dialog or native `<dialog>.showModal()`; focus the first field (or the heading, `tabindex=-1`, for long content); background `inert`; on close return focus to the trigger or a logical successor | APG dialog pattern | Alert dialogs focus the least destructive action |
| Route changes: keep Next's route announcer and give every route a unique `metadata.title`; for full-view changes move focus to the `<h1 tabindex="-1">`; leave focus alone for in-place master/detail and URL-synced filters | Next reads the title to screen readers; user testing favours announce + focus heading | – |
| Skip link first: "Skip to main content" → `<main id="main" tabindex="-1">` | GOV.UK pattern | Apps with F6 pane cycling offer that too, not instead |
| Composite widgets: Tab in and out, arrow keys inside, Home/End, one tab stop (roving tabindex); `aria-activedescendant` only when focus must stay in a text input (combobox). Typeahead buffer resets after 1 s | APG keyboard interface; React Aria and Radix both use 1,000 ms | Data grids: arrows between cells, Enter/F2 to edit, Esc back to navigation |
| App shortcuts use modifiers (Cmd/Ctrl+K). Single-letter shortcuts (`j`, `k`, `?`) must be switchable off or remappable, or only active when the component has focus. Expose them with `aria-keyshortcuts` and a `?` help sheet | WCAG 2.1.4; avoids clashing with screen-reader keys | – |
| Native elements first (`button`, `a href`, `input`, `select`, `dialog`, `details`); ARIA only through an APG pattern, preferably the library's | WebAIM Million 2026: pages with ARIA averaged 59 errors vs 42 without | – |
| One polite `role="status"` and one `role="alert"` region mounted empty at the app root; write messages into them | Regions inserted with their content often aren't announced (WCAG 4.1.3) | – |
| Form submit errors: a GOV.UK-style error summary that takes focus and links to each field, plus inline messages tied with `aria-describedby` | The reference pattern for form-error focus | Single-field forms: inline message only |
| Streaming AI output is **not** a live region: announce "Generating…" then "Response ready" through the status region; render the finished answer as a normal `<article>`; keep Stop reachable | Token-by-token announcements are fragmented and repetitive | Short one-line results can be announced verbatim |
| Pointer targets ≥ 24×24 px (our icon buttons: 32×32 in dense toolbars, 40×40 elsewhere) | WCAG 2.5.8 (AA) | Inline text links are exempt |
| Every drag action has a single-pointer alternative (Move up/down or Move to… menu items, arrow-key resize), or React Aria `useDragAndDrop` | WCAG 2.5.7 (AA) | Freehand drawing |
| Help stays in the same place in the shell on every page; don't ask for the same data twice in a flow | WCAG 3.2.6 and 3.3.7 | Security re-entry (password confirmation) |
| Sign-in allows paste and password managers (`autocomplete="username"`, `"current-password"`, `"one-time-code"`); prefer passkeys; no puzzle CAPTCHA | WCAG 3.3.8 (AA) | – |
| Forced colors: use system colours (`CanvasText`, `Highlight`) for custom checkboxes, selected rows and focus; `forced-color-adjust: none` only on swatches and charts | Custom colours, shadows and backgrounds are overridden | – |
| `prefers-reduced-transparency` is an extra, not a fix: Safari doesn't support it, so translucent surfaces must be legible on their own and go opaque under `contrast-more:` too | Browser support (MDN data) | – |

## 3. Testing
| Layer | Tool | Note |
|---|---|---|
| Lint | `eslint-plugin-jsx-a11y` (via `eslint-config-next`), `strict` config | Last released 2024; blind to roles that come from a library component |
| Unit | Testing Library `getByRole` queries | If you can't query it by role and name, a screen reader can't find it either |
| End to end | `@axe-core/playwright` per route **and per open overlay**, with `withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa'])` | **Without the `wcag22aa` tag axe skips target size**, its only WCAG 2.2 rule. Run with `reducedMotion: 'reduce'` to avoid animation flakes |
| Structure | Playwright `toMatchAriaSnapshot` for key widgets | Catches lost names and roles (the bench's combobox failures would show here) |
| Manual | Keyboard-only pass of each flow; NVDA + Chrome smoke test per release | Automated tools catch about 57% of issues (Deque); JAWS + NVDA are ~88% of desktop screen-reader use |

**Legal context** (not legal advice): the European Accessibility Act has applied since 28 June 2025 to consumer-facing
services sold in the EU; the WCAG 2.2-based EN 301 549 v4.1.1 was published in September 2026. Treat WCAG 2.2 AA plus
an accessibility statement as the bar for anything EU consumers use.

## References
Bench: `benchui/` (`npm install && node run.mjs [lib]`). Profiles: `sources/{react-aria,radix-ui,base-ui,ariakit,headless-ui}`.
Live references (patterns): search `catalog.json` for `pattern: accessibility`.
