# Diagram brief: how the UX library works

Draw one diagram that explains how the UX-Design library turns a reference into an answer, using the diagram skill
you were given (read its SKILL.md fully first and follow its workflow as Claude Code would when the skill loads;
if it asks the user questions, answer them yourself from this brief and say so in RUN.md).

**Audience:** a designer joining the team who has never seen the repo.
**Subject (use these facts, add none):**
- A person gives `ux-add` a URL or a screenshot.
- `ux-add` captures it (Playwright script `capture.mjs`: desktop and mobile screenshots, element crops with
  `source.html` and `styles.json`), checks `catalog.json` for duplicates, and writes one `entry.md` per pattern
  (rated 3 to 5, flat frontmatter).
- `npm run catalog` regenerates `catalog.json`, `CATALOG.md`, `SOURCES.md` and `gallery/data.js`.
- The change is committed to `main` and the published gallery is republished.
- Later, a person asks `ux-find` for a pattern. It reads `guides/README.md`, runs `find.mjs` (vocabulary in
  `aliases.json`), reads `catalog.json`, and returns the top three references with screenshots, techniques and code,
  optionally rebuilding one as `example.tsx` (React + Tailwind).
- The library has four layers: guides, source profiles, patterns, and benchmark evidence (`bench*/`).

**Output:** one self-contained `diagram.html` (or `.svg`) in your output folder; inline everything or use Google
Fonts / system fonts. It must read at 1280 px and at 390 px wide and carry a text alternative. No invented
facts, numbers or steps. Work only inside your output folder; do not open any other folder under `benchskills/out/`.
Write `RUN.md` there: the skill steps you followed, any that failed or you skipped, what you changed after viewing it.
