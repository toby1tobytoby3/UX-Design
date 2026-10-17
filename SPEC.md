# UX Reference Library — Spec v0.3

A curated, searchable library of leading UX patterns from real websites. Each entry has
structured metadata, screenshots and code. Claude Code sessions look patterns up during
builds through a skill.

## Decisions
| Topic | Decision |
|---|---|
| Store | This git repo. Markdown entries + JPEG images. No database. |
| Central lookup table | `catalog.json` (machine) + `CATALOG.md` (GitHub view), both generated from entry frontmatter by `npm run catalog`. Entries are the source of truth. |
| Browsing | Static `gallery/` page with search and filters. No server, no build step. |
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
