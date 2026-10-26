# RUN: UI UX Pro Max, Ledgerly pricing page

Output: `index.html` (single file, inline CSS and JS, Google Fonts link with system fallbacks).
Persisted design system: `design-system/ledgerly/MASTER.md` and `design-system/ledgerly/pages/pricing.md`.

## Skill steps followed
1. Read SKILL.md in full. `CLAUDE_PLUGIN_ROOT` set to `/home/user/UX-Design/benchskills/.cache/ui-ux-pro-max`; python3 used.
2. Step 1 (analyse): product = B2B SaaS (invoice reconciliation), audience = bookkeepers and practice managers on laptop and phone, style keywords = trustworthy, professional, minimal. Stack: nothing detectable (no package.json); the brief says plain HTML, so I did not assume one and used `html-tailwind` only as the nearest plain-HTML stack for a single query (Tailwind itself is not used).
3. Step 2 and 2b: `search.py "SaaS accounting invoice reconciliation pricing professional trustworthy" --design-system --persist -p Ledgerly --page pricing --output-dir <out> --density 4 --motion 3`.
   Result: pattern "Trust & Authority + Conversion", style "Minimalism & Swiss Style", navy/emerald palette, Poppins + Open Sans.
4. Step 3 supplementary searches: `landing` ("pricing table plan comparison", which returned the "Pricing Page + CTA" pattern: cards, comparison table, FAQ, final CTA), and `ux` for toggle semantics, responsive tables, accordion/keyboard, focus visible, reduced motion. One `html-tailwind` stack query (cards/grid; generic, little use).
5. Read `references/quick-reference.md` and `references/pro-rules.md`. pro-rules is explicitly scoped to native/mobile apps, so I used only its generic parts (icon discipline, light/dark contrast, 4/8 spacing).
6. Ran the pre-delivery checklist by hand: SVG icons (no emoji), cursor-pointer, 150-300ms transitions, 4.5:1 contrast, visible focus (3px ring), reduced motion honoured, 390/768/1280 verified, no horizontal scroll, dark mode checked separately.

## Questions answered for the skill (from the brief)
- Product/stack/audience/style: see Step 1 above. No questions to the user were required.
- Design dials: density 4 (standard), motion 3 (subtle); variance left unset.

## Where I deviated from the skill output, and why
- Pattern "Trust & Authority + Conversion" suggests security badges, case studies, logo carousel, stats and "Contact Sales". The brief forbids invented proof, so I dropped all of it and used the skill's own `Pricing Page + CTA` section order instead (hero, plan cards, comparison table, FAQ, final CTA). No logos, badges, counts or testimonials. The hero illustration is an abstract stand-in (two lists linked by ticks, no numbers).
- `pages/pricing.md` came back labelled "Page Type: Settings / Profile" with "1400px / High density / 12-column data grid". That is a misclassification for a marketing pricing page, so I ignored it: container max 1120px, standard density, 3-column plan grid.
- Master "On Accent" is black on `#059669` (5.6:1). I followed that (white would be 3.8:1 and fail). Hover uses the lighter `#10B981`.
- Master card spec has `cursor:pointer` and hover lift on cards. The plan cards are not clickable, so I did not add it. Buttons, toggle and FAQ summaries have it.
- GSAP scroll reveal not used: the brief says no framework, and the skill itself warns about invisible-by-default content. Motion is limited to 150-200ms CSS transitions (price crossfade, hover, chevron), all disabled under `prefers-reduced-motion`.
- Dark mode added via `prefers-color-scheme` tokens (skill: light/dark designed together).

## Content decisions
- Currency symbol "$" added to prices (the data file has bare numbers); this is the one assumption.
- Monthly state shows "Billed monthly". Annual state shows "Billed annually, 20% less than twelve monthly payments" (wording from the FAQ answer). Toggle label "Save 20%" comes from `annual_discount`.
- No plan is badged "popular" or "recommended" (would be an unsupported claim); all three CTAs are identical.
- CTA hrefs are placeholders (`/trial?plan=...&billing=...`); no signup page exists.
- Hero line "Invoice reconciliation for small accounting teams" is the tagline hint; the 14-day trial and no-card line comes from the FAQ.

## Verification (Playwright, Chromium, reducedMotion on)
- scrollWidth equals viewport at 390, 768 and 1280; no page errors.
- Monthly on load; clicking Annual gives 15.20 / 47.20 / 119.20 and the billed-annually text; `aria-pressed` and a polite status line update.
- Keyboard: skip link, nav, toggle, three CTAs, five FAQ summaries, final CTA all reachable with a 3px outline; toggle and FAQ operate with Enter.

## Changed after looking at screenshots
- At 390px the comparison table broke words ("Unlimite/d", "Busines/s") because of `overflow-wrap:anywhere` and 38% label column. Fixed: smaller font (13px), 31% label column, 2px cell padding, no forced breaking. Re-checked at 390 and 768.

## Problems and friction
- No network failure affecting the skill (it is fully local). Google Fonts may not load in the sandbox; the page falls back to system fonts.
- Shared `/tmp/claude-0/` collision: a second participant used the same file names there (`shot.js`, `crop.js`) and its screenshots landed in my `shots/` folder. I noticed an unfamiliar page in `m-768.png`, deleted my `shots/` folder (not part of the deliverable), and re-ran verification from scripts in my own scratchpad. `index.html` was checked by hash before and after and is unaffected.
