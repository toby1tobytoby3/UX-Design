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
- Libraries are benchmarked per category, same tasks for every library: charts in `bench/`, 3D in `bench3d/`
  (`cd bench3d && npm install && (cd model-viewer && npm install) && node run.mjs [lib]`), animation in
  `benchmotion/` (`node run.mjs [lib] && node chart.mjs`), headless UI primitives in `benchui/`, AI chat kits in
  `benchai/` (about 15 minutes), inline AI in `benchinline/`, tables in `benchtable/` (about 25 minutes), panels in
  `benchpanels/` (about 8 minutes), maps in `benchmap/` (offline basemap, SwiftShader). Each writes `results.json`, which the catalog build attaches to the profile.
- Agents answering with this library start at `guides/README.md`.
- Commit straight to `main`.
