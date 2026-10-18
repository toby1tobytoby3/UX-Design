---
name: ux-find
description: Look up leading UX patterns in the team's curated UX library, explore beyond it when coverage is thin, and return references with screenshots, analysis and code — optionally rebuilding one as a React + Tailwind component for our site. Use while designing or building UI ("how should the pricing page look?", "find a good empty state", "show me hero references", "build this like the library's command palette").
---

# ux-find

Search the UX library (`toby1tobytoby3/UX-Design`) and bring the best references
into the current task.

**The library is curated recommendations, not a mandatory list.** It holds references the team has checked
and scored, so start there. But it is incomplete, and the best answer for a task may not be in it. When
coverage is thin or something outside it is clearly better, explore (step 4) and say so. Never bend a weak
library match to fit the task just because it's in the library.

## 1. Find the library clone
Use the first that exists: `$UX_LIBRARY_DIR`, the current repo if it contains
`catalog.json`, `../ux-design`, `../UX-Design`, `~/ux-design`.
If none exist, `git clone --depth 1 https://github.com/toby1tobytoby3/UX-Design ~/ux-design`.
`git pull` if it's a clone you didn't just create.

## 2. Read the map
Read `guides/README.md` first: it explains the layers (guides → sources → patterns → evidence)
and how to answer. For "which library/site?" questions, `SOURCES.md` has the scored comparison per category.

## 3. Search
Start with the search script. It knows the team's vocabulary (`guides/aliases.json`: "snackbar" → toasts,
"frosted" → materials, "order book" → real-time data), matches whole words and phrases, and prints the coverage
line and the categories that aren't in the library yet:
```bash
node <library-clone>/scripts/find.mjs "<the request in the user's words>"   # works from any directory; --json for structured output
```
Use its concepts to pick the guide(s) to read, and its results as the shortlist. Treat the **Weak** list as
false friends unless the entry itself proves relevant. If a request uses a word the script misses, add it to
`guides/aliases.json` (and a case to `scripts/find.test.mjs`) so the next search finds it.

Then read the shortlisted rows in `catalog.json`. Each object has `kind`: `pattern` (one UX pattern) or `source` (a scored
profile of a library or site: `score`/10, `licence`, `version`, `use_when`, `avoid_when`,
`alternatives`, a scorecard and coverage table in `body`). Common fields: `title, pattern,
page_type, tags, source_site, rating, why_it_works, use_when, has_example, path, images, files, body`.

**Category questions come first.** If the request is "I need a chart / a date picker / an
animation library…", or names a kind of component rather than a specific look:
1. Read the category guide in `guides/` if one exists (e.g. `guides/charts.md`): pick the
   form from the data's job.
2. Read every `kind: source` with that `pattern` and compare their scorecards against
   the task's constraints (bundle size, React fit, licence, data size, accessibility).
3. Recommend **one** source with its score and the reason it wins *for this task*, name the
   runner-up and when you'd switch, and flag gaps (e.g. "only 1 of 6 shortlisted libraries
   profiled so far").
4. Then return the matching patterns from that source as below.

For a specific look ("a dark hero", "a pricing toggle"), rank the script's patterns by fit to the task first,
then `rating`, and discard hits that only match a word incidentally.

Then confirm the script's **coverage** judgement against what you read (it counts what exists, you judge fit):
- **Strong**: a guide plus scored sources, or 2+ patterns that fit the task itself (not just the keyword).
- **Partial**: some fitting patterns, but no guide/sources, or key parts of the request uncovered.
- **None**: nothing that fits.

Partial or none → step 4. Strong → you may still explore if you know of something clearly better.

## 4. Explore (beyond the library)
Research the gap yourself, the way a designer would, rather than stopping at "not in the library":
1. **Find candidates.** Web-search for the leading tools and best-in-class products for the job
   (`research/categories.md` lists starting points per category). Prefer open-source; flag anything paid.
2. **Check tools quickly.** For each library: `npm view <pkg> version license time.modified` (licence and
   maintenance), weekly downloads if useful, React/Next fit, and gzip size from bundlephobia or a quick
   esbuild. Score roughly against `guides/source-rubric.md` and mark it **rough**, not benchmarked.
3. **Look at real products.** Capture the best references live with `node scripts/capture.mjs <url> <scratch-dir>`
   (or `capture-motion.mjs` for 3D/motion) and view the images before citing them. Logged-in products you
   can't reach: describe from public docs/videos and say so.
4. **Decide.** Form your own view of the best approach; the library's defaults and your findings are both input.
5. **Label provenance** in the answer: **Curated** (in the library, checked and scored) vs **Explored**
   (found this session, rough check only). Never present explored findings as captured or benchmarked.
6. **Offer to keep it.** End with "Add to the library?" listing the explored tools and references worth
   keeping; on yes, run **ux-add** for each (that benchmarks, profiles and republishes the gallery).

Keep exploring proportionate: a few minutes and 2–4 candidates for a quick question, deeper for a build decision.

## 5. Return the answer
Start with one coverage line, so the user knows how much is curated:
> **Library coverage:** strong / partial / none — <what's in it, what's missing>. <Explored: X, Y.>

For a category question, lead with:
> **Use <source> (<score>/10)** for this, because… For <data job>, use a <form>; ready code: `<pattern path>`.
> Change one thing: … Runner-up: <source>, if …

Then the top patterns.

### Top 3 patterns
For each:
- **Title** — site · pattern · ★ rating
- Why it works / when to use (from the entry)
- 2–4 key techniques from the entry body that apply to *this* task
- Screenshot paths (`images`) — view the first one yourself before recommending it
- Code available: `example.tsx` (our rebuild), `preview.html` (rebuild preview),
  `source.html` / `styles.json` (captured reference only — never paste verbatim into our code)

Mark each pattern or source **Curated** or **Explored**. End with a one-line recommendation of which to use
and why, and, if you explored, the "Add to the library?" offer.

## 6. Rebuild for our site (when asked, or when the task is to build it)
1. If the entry already has `example.tsx`, use it as the starting point.
2. Otherwise write one in the entry folder following `our-design/README.md`:
   React function component, Tailwind classes, no shadcn, accessible, placeholder
   data at the top. Re-implement from the screenshot and analysis — clean-room,
   not copied from `source.html`.
3. Set `has_example: true` in the entry frontmatter, run `npm run catalog`,
   commit and push to `main` so the next session can reuse it.
4. Adapt the example into the current project as the task requires.
