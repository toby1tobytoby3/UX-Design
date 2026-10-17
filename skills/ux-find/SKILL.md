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

## 2. Search
Read `catalog.json` (one object per entry: `title, pattern, page_type, tags,
source_site, rating, why_it_works, use_when, has_example, path, images, files, body`).
- Map the request to `pattern` / `page_type` values from `taxonomy.md`, then
  match `tags`, `title`, `why_it_works`, `use_when` and `body` text.
- Rank by fit to the task first, then `rating`.
- If nothing fits, say so plainly and suggest the user add a reference with **ux-add**.

## 3. Return the top 3
For each:
- **Title** — site · pattern · ★ rating
- Why it works / when to use (from the entry)
- 2–4 key techniques from the entry body that apply to *this* task
- Screenshot paths (`images`) — view the first one yourself before recommending it
- Code available: `example.tsx` (our rebuild), `preview.html` (rebuild preview),
  `source.html` / `styles.json` (captured reference only — never paste verbatim into our code)

End with a one-line recommendation of which to use and why.

## 4. Rebuild for our site (when asked, or when the task is to build it)
1. If the entry already has `example.tsx`, use it as the starting point.
2. Otherwise write one in the entry folder following `our-design/README.md`:
   React function component, Tailwind classes, no shadcn, accessible, placeholder
   data at the top. Re-implement from the screenshot and analysis — clean-room,
   not copied from `source.html`.
3. Set `has_example: true` in the entry frontmatter, run `npm run catalog`,
   commit and push to `main` so the next session can reuse it.
4. Adapt the example into the current project as the task requires.
