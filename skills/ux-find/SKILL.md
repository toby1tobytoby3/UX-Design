---
name: ux-find
description: Look up leading UX patterns in the team's UX library and return references with screenshots, analysis and code — optionally rebuilding one as a React + Tailwind component for our site. Use while designing or building UI ("how should the pricing page look?", "find a good empty state", "show me hero references", "build this like the library's command palette").
---

# ux-find

Search the UX library (`toby1tobytoby3/UX-Design`) and bring the best references
into the current task.

## 1. Find the library clone
Use the first that exists: `$UX_LIBRARY_DIR`, the current repo if it contains
`catalog.json`, `../ux-design`, `../UX-Design`, `~/ux-design`.
If none exist, `git clone --depth 1 https://github.com/toby1tobytoby3/UX-Design ~/ux-design`.
`git pull` if it's a clone you didn't just create.

## 2. Read the map
Read `guides/README.md` first: it explains the layers (guides → sources → patterns → evidence)
and how to answer. For "which library/site?" questions, `SOURCES.md` has the scored comparison per category.

## 3. Search
Read `catalog.json`. Each object has `kind`: `pattern` (one UX pattern) or `source` (a scored
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

For a specific look ("a dark hero", "a pricing toggle"), search patterns directly:
- Map the request to `pattern` / `page_type` values from `taxonomy.md`, then
  match `tags`, `title`, `why_it_works`, `use_when` and `body` text.
- Rank by fit to the task first, then `rating`.
- If nothing fits, say so plainly and suggest the user add a reference with **ux-add**.

## 4. Return the answer
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

End with a one-line recommendation of which to use and why.

## 5. Rebuild for our site (when asked, or when the task is to build it)
1. If the entry already has `example.tsx`, use it as the starting point.
2. Otherwise write one in the entry folder following `our-design/README.md`:
   React function component, Tailwind classes, no shadcn, accessible, placeholder
   data at the top. Re-implement from the screenshot and analysis — clean-room,
   not copied from `source.html`.
3. Set `has_example: true` in the entry frontmatter, run `npm run catalog`,
   commit and push to `main` so the next session can reuse it.
4. Adapt the example into the current project as the task requires.
