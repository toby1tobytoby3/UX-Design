---
name: ux-add
description: Add a UX reference to the team's UX library from a URL or a screenshot pasted in chat. Captures it, analyses the patterns, writes catalog entries and pushes them. Use when the user shares a website or screenshot as a design reference, says "add this to the UX library", "save this pattern", or "capture this design".
---

# ux-add

Turn a URL or screenshot into one or more entries in the UX library repo
(`toby1tobytoby3/UX-Design`), then commit and push to `main`.

## 1. Find the library clone
Use the first that exists: `$UX_LIBRARY_DIR`, the current repo if it contains
`taxonomy.md` and `entries/`, `../ux-design`, `../UX-Design`, `~/ux-design`.
If none exist, `git clone https://github.com/toby1tobytoby3/UX-Design ~/ux-design`.
Run `git pull` first. Run `npm install` if `node_modules/` is missing.

## 2. Check for duplicates
Search `catalog.json` for the same `source_url` + `pattern`. If one exists, update
that entry instead of creating a new one, and tell the user.

## 3. Capture
- **URL:** `node scripts/capture.mjs <url> <tmp-dir>` for desktop + mobile screenshots.
  Look at them, decide which patterns are worth keeping, then capture each one
  focused: `node scripts/capture.mjs <url> <entry-dir> --selector "<css>"`.
  This also saves `source.html` and `styles.json` for that element.
  If the site blocks capture or the network denies it, tell the user and ask for
  a screenshot instead. Never invent screenshots.
- **Name only ("apache charts", "the Stripe pricing page"):** web-search to resolve the
  canonical URL first, then treat it as a URL.
- **Open-source library or component kit** (charts, UI kits, animation libs): the code
  is the reference and is licensed for reuse, so don't just screenshot its docs site.
  Install the exact version from npm into a scratch dir, write a small `option.js`/demo
  per pattern worth keeping, add a `preview.html` that loads the library from cdnjs
  (pinned version) and the demo, then render it locally with Playwright (route the CDN
  URL to the local copy if the CDN is blocked). Set `input: library-render`, record the
  version and licence, and add the `open-source` tag. These renders are real captures,
  so no `needs_capture`. Check the library's default colours with the dataviz palette
  validator when relevant.
  **Also create or update its source profile** at `sources/<slug>/source.md`
  (`kind: source`, `pattern` = the category, `score`, `licence`, `version`, `avoid_when`,
  `alternatives`), scored with `guides/source-rubric.md`, including a coverage table and
  links to its pattern entries. Add a row to the category guide (e.g. `guides/charts.md`).
  Use `sources/echarts/source.md` as the model. For a chart library, first add
  `bench/libs/<slug>.js(x)` drawing the same four charts from `bench/data.js` and run
  `cd bench && node run.mjs <slug>`: that renders `sources/<slug>/bench.jpg` and records
  bundle size, chart support and accessibility probes in `bench/results.json`, which the
  catalog attaches to the profile. For a 3D library, do the same in `bench3d/` (same model, same four
  tasks in `bench3d/scene.js`). Score from that evidence; `npm run catalog` computes the total.
- **Screenshot:** save the image into the entry folder as `desktop.jpg` (or
  `mobile.jpg` if it is a phone screenshot). Ask for the source URL if not given;
  use `source_url: unknown` if they don't have it.

## 4. Decide the entries
**One entry per pattern, not per page.** A pricing page may give a `pricing-table`
entry and a `faq` entry. Only keep patterns that are genuinely strong (rating 3+).
Use `pattern` and `page_type` values from `taxonomy.md`.

Folder: `entries/<pattern>/<site>-<short-slug>/` e.g. `entries/pricing-table/linear-annual-toggle/`.

## 5. Write `entry.md`
Frontmatter must stay flat: `key: value` lines and inline `[a, b]` lists only.

```markdown
---
title: Annual/monthly toggle with savings badge
pattern: pricing-table
page_type: pricing
tags: [saas, b2b, minimal, animated]
source_url: https://example.com/pricing
source_site: example.com
captured_at: 2026-10-17
captured_by: <git user.name>
input: url
rating: 4
why_it_works: One sentence on the core reason this is good.
use_when: One sentence on when to reach for it.
has_example: false
---

## What it is
Short description of the pattern and its parts.

## Key techniques
- Layout, spacing, type, colour and motion details worth copying.
- Reference values from styles.json where they matter (e.g. `gap: 24px`, `transition: 200ms ease-out`).

## Accessibility
Contrast, focus, keyboard and screen-reader observations.

## Weaknesses
What to avoid copying.
```

Rating: 5 best-in-class · 4 strong · 3 solid reference. Don't add anything below 3.

- `captured_by`: the person who supplied the reference (ask if unknown), not "Claude".
- Add `needs_capture: true` whenever the images are not a live capture of the site
  (a user screenshot, a photo of a screen, a crop from a video). Remove it after a live capture.
- Split one source into several entries, one per pattern, and list the siblings under a
  `## Related entries` heading in each.

## 6. Publish
```bash
npm run catalog            # regenerates catalog.json, CATALOG.md, gallery/data.js
git add -A && git commit -m "Add <pattern>: <title>" && git push origin main
```
If the push is rejected, `git pull --rebase` and retry.

## 7. Update the published gallery (always)
The team browses the library at **https://claude.ai/artifact/NRvM6i9bYjZeVUGWY9wQfL**.
Every add must republish it so it never goes stale:
1. `node scripts/build-gallery-artifact.mjs <out-dir>`. Use your scratchpad directory as
   `<out-dir>` when the library clone is outside your working directory (the Artifact
   tool only publishes files under the working directory or scratchpad); otherwise the
   default `.artifact/` is fine.
2. Publish with the Artifact tool: `url` = the gallery URL above,
   `file_path` = `<out-dir>/ux-library.html`, `root` = `<out-dir>`, and `files` = the
   map in `<out-dir>/files.json`. If this conversation hasn't read the artifact yet,
   do `action: "read"` on the URL first.
3. If the Artifact tool isn't available or the publish is refused, say so plainly in
   the report ("gallery not updated"). Never skip this step silently.

## 8. Report
List each entry added (title, pattern, rating, one-line why) and its path, and confirm
the gallery was republished. Optionally offer to create a rebuilt example with **ux-find**.
