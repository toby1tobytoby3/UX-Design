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

## 6. Publish
```bash
npm run catalog            # regenerates catalog.json, CATALOG.md, gallery/data.js
git add -A && git commit -m "Add <pattern>: <title>" && git push origin main
```
If the push is rejected, `git pull --rebase` and retry.

## 7. Report
List each entry added (title, pattern, rating, one-line why) and its path.
Optionally offer to create a rebuilt example with **ux-find**.
