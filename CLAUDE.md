# UX-Design repo

The UX reference library. See SPEC.md for the design; the skills in `skills/` (also exposed
via `.claude/skills`) define the workflows.

- Entries live in `entries/<pattern>/<site>-<slug>/entry.md`. Frontmatter is flat `key: value`
  with inline `[a, b]` lists only — the catalog parser supports nothing else.
- `catalog.json`, `CATALOG.md` and `gallery/data.js` are generated. Never edit them by hand;
  run `npm run catalog` after changing any entry.
- Use `pattern` / `page_type` values from `taxonomy.md`.
- Source profiles live in `sources/<slug>/source.md` (`kind: source`), scored with `guides/source-rubric.md`;
  scores are computed by the catalog build. `SOURCES.md` is generated too.
- Chart libraries are benchmarked in `bench/` (`cd bench && npm install && node run.mjs [lib]`).
- Agents answering with this library start at `guides/README.md`.
- Commit straight to `main`.
