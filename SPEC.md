# UX Reference Library — Spec v0.3

A curated, searchable library of leading UX patterns from real websites. Each entry has
structured metadata, screenshots and code. Claude Code sessions look patterns up during
builds through a skill.

## Decisions
| Topic | Decision |
|---|---|
| Store | This git repo. Markdown entries + JPEG images. No database. |
| Central lookup table | `catalog.json` (machine) + `CATALOG.md` (GitHub view), both generated from entry frontmatter by `npm run catalog`. Entries are the source of truth. |
| Browsing | Static `gallery/` page with search and filters, also published at https://claude.ai/artifact/NRvM6i9bYjZeVUGWY9wQfL. `ux-add` republishes it on every add. |
| Granularity | One entry per **pattern**, not per page. |
| Review | Commit straight to `main`; prune afterwards. |
| Our stack | React/Next + Tailwind, no shadcn/ui. |
| Examples | Built lazily — only when a pattern is used — then committed back. |
| Consumers | Claude Code local + cloud, via the `ux-library` plugin (two skills). |
| Scale | Small team, hundreds of entries. Grep + Claude reranking is enough. |
| Out of scope | MCP server, database, semantic search, CI. |

## Components
| Part | Path | Job |
|---|---|---|
| `ux-add` skill | `skills/ux-add/` | URL or screenshot → capture → analyse → entry → catalog → push |
| `ux-find` skill | `skills/ux-find/` | Search catalog → top 3 with screenshots, techniques, code → rebuild on request |
| Capture script | `scripts/capture.mjs` | Playwright: desktop/mobile screenshots; with `--selector`, element crop + `source.html` + `styles.json` |
| Catalog build | `scripts/build-catalog.mjs` | Frontmatter → `catalog.json`, `CATALOG.md`, `gallery/data.js` |
| Gallery | `gallery/index.html` | Filter by search text, pattern, page type, rating, tags, captured/has-code |
| Gallery bundle | `scripts/build-gallery-artifact.mjs` | Self-contained folder + `files.json` for publishing the gallery as an Artifact |
| Taxonomy | `taxonomy.md` | ~20 pattern terms, page types, preferred tags |
| Our design | `our-design/` | Conventions/tokens rebuilt examples must follow |

## Entry
`entries/<pattern>/<site>-<slug>/`

| File | Meaning |
|---|---|
| `entry.md` | Frontmatter (flat `key: value`, inline `[a, b]` lists) + analysis |
| `desktop.jpg`, `mobile.jpg` | Real captures (or user screenshots) |
| `source.html`, `styles.json` | Captured reference code — never copied verbatim |
| `preview.html` + `preview.jpg` | Our clean-room rebuild as static HTML (base pack) |
| `example.tsx` | Our React + Tailwind rebuild, created on first use |

Required frontmatter: `title, pattern, page_type, tags, source_url, source_site, captured_at,
captured_by, input, rating, why_it_works, use_when, has_example`. Optional: `needs_capture`.

## Base pack
10 entries across hero, feature-grid, command-palette, pricing-table, mega-menu, social-proof,
search, onboarding, dashboard and empty-state. Written from knowledge of well-known sites, with
our own `preview.html` rebuilds. They are flagged `needs_capture: true` (shown as "preview only"
in the gallery) until someone re-captures them from the live site with `ux-add`.

## Known constraints
- Cloud sessions can only capture sites the environment's network policy allows. Locally,
  capture works for any public site. Otherwise use the screenshot path.
- Sites with bot protection or logins: use screenshots.

## Next
1. Add our site's Tailwind config / tokens to `our-design/`.
2. Test `ux-add` with real screenshots; re-capture the base pack locally.
3. After ~2 weeks of use, tune `taxonomy.md` and the `ux-find` output.

## Sources (added v0.4)
Patterns answer "what does a great X look like?". **Source profiles** answer "which library or site is
the best reference for X, and why?".

- `sources/<slug>/source.md`: `kind: source`, `pattern` = category, `score` /10 from
  `guides/source-rubric.md` (8 criteria), licence, version, coverage table, when to pick and avoid,
  alternatives, and links to its pattern entries.
- `guides/<category>.md`: a decision guide `ux-find` reads first for category questions
  (e.g. `guides/charts.md`: data job → chart form → library).
- The catalog, CATALOG.md and gallery (Sources tab) include profiles; `ux-find` recommends one source
  with its score, names a runner-up, then returns patterns.

### Chart libraries: shortlist and method
Goal: a separate, scored profile for each library that is genuinely **best at something** for a
React/Next + Tailwind team, not just the popular defaults.

| Library | Why it's on the list (best at) | Licence | Status |
|---|---|---|---|
| ECharts | Breadth + interactivity + large data, free | Apache-2.0 | ✅ profiled (8/10) |
| Recharts | The React default; composable JSX; base of shadcn charts and Tremor | MIT | planned |
| visx | Low-level React + D3 primitives for bespoke charts | MIT | planned |
| Observable Plot | Best defaults and most concise grammar (from D3's creator); SVG, SSR-friendly | ISC | planned |
| D3 | The reference for fully bespoke/editorial visualisation | ISC | planned |
| Highcharts | Strongest accessibility (keyboard navigation, sonification) and polish | Commercial | planned |
| AG Charts | Enterprise and financial dashboards; free community edition | MIT | planned |
| uPlot | Fastest, smallest time-series charts | MIT | planned |
| Lightweight Charts (TradingView) | Best-in-class financial / price charts | Apache-2.0 | planned |
| Tremor | Best Tailwind dashboard look (built on Recharts) | Apache-2.0 | planned (npm package idle since Jan 2025; check current distribution) |

Considered and not shortlisted: Nivo (releases slowed, last May 2025), Chart.js (solid canvas
all-rounder, best at nothing for us), Victory (React Native parity), MUI X Charts (only if on MUI),
ApexCharts (licence changed; check before use), Plotly and Vega-Lite (scientific and notebook use).

**Same benchmark for every library**, so scores are comparable:
1. The same four charts on the same sample data and validated palette: a time series with zoom,
   a sorted bar, a stacked composition, and a donut. Where a library can't do one, record that.
2. Real renders at desktop and phone widths, saved as patterns where a library does something best-in-class.
3. Measured gzipped bundle size for those charts (esbuild), and its default palette run through the validator.
4. A keyboard and screen-reader check of each library's accessibility features.
5. A score against the rubric, with every number traceable to evidence in the profile.
