# UX-Design repo

The UX reference library. See SPEC.md for the design; our skills in `skills/` (shipped by the plugin) and
vendored third-party ones in `vendor/skills/` (`npm run skills:link` exposes both via `.claude/skills`) define the workflows.

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
  `benchpanels/` (about 8 minutes), maps in `benchmap/` (offline basemap, SwiftShader), agent design skills in `benchskills/`
  (builders, reviewers and diagram makers against a no-skill control; `node fetch.mjs`, then follow its README: agents generate, scripts measure). Each writes `results.json`, which the catalog build attaches to the profile.
- Agent skills and toolkits are third-party code: vet them with `scripts/vet-skill-repo.mjs` before reading, vendoring or
  scoring; vendored copies go in `vendor/skills/`, never `skills/` (the plugin ships that).
- Agents answering with this library start at `guides/README.md`.
- Commit straight to `main`.

## Working style

Adapted from [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) (MIT).
Bias toward caution over speed; use judgment on trivial tasks.

- **Think before coding.** State assumptions; if unsure, ask. Present multiple interpretations
  rather than picking silently. Say so if a simpler approach exists.
- **Simplicity first.** Minimum code that solves the problem: no unrequested features, no
  abstractions for single-use code, no error handling for impossible cases.
- **Surgical changes.** Every changed line traces to the request. Match existing style, don't
  tidy adjacent code, mention unrelated dead code instead of deleting it. Remove only what your
  own change orphaned.
- **Goal-driven.** Turn the task into a verifiable goal (reproducing test, `npm run catalog`
  passes) and loop until it holds. For multi-step work, state a short plan with a check per step.
