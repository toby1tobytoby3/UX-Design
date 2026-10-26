# Choosing an agent design skill

`ux-find` reads this for "is there a skill for X?" and for design-quality asks. Every skill below was given the same brief
as the unaided model (the control), then measured the same way (`benchskills/`, one run per skill per track, pinned
commits, 26 Oct 2026). **The headline: no skill beat the control by much except Hallmark on look, and the two diagram
skills lost to it.** A skill earns its place by consistency, structure and the rules it carries, not by finding or
building more than a careful agent with a browser would. Scores and evidence: `SOURCES.md` (category `design-skills`) and
each `sources/<slug>/source.md`.

## 1. Which skill for the job
| Job | Use | Why (evidence) | Runner-up |
|---|---|---|---|
| Build a new page that must not look generated | **Hallmark** | Jury 4.38 against 3.63 for the control, first with both judges; 13 of 14 checks; costs 2.3x tokens | Anthropic `frontend-design` (matches the control at 1.2x cost) |
| Build a brand or editorial page with a point of view | **Taste Skill** | Top distinctiveness (5 of 5), all 14 checks; but last overall on a pricing page (2.88) because plans were hard to compare | Hallmark |
| Review a built screen or a pull request, with a report a team can act on | **Interface Skills** (`better-interface`, `interface-review`) | Ranked, located, before and after code, verdict; found 87% against the control's 90% | Hallmark `audit` (97%, but half its gates are generated-look rules) |
| Name the rules to check against | **UI UX Pro Max** `quick-reference.md` | Named rules by category with IDs; 22 stacks incl. React and Tailwind; review 90% | Interface Skills `better-accessibility` (WCAG 2.2 criteria) |
| Explain a process or pipeline as a diagram | **The unaided model** (HTML cards) | Jury 4.75 against 3.63 and 1.75; 12 of 12 checks; text 12 px at 390 | Diagram Design if you need a swimlane look |
| A branded diagram of a specific type, or a draw.io, Mermaid or Excalidraw import | **Diagram Design** (not vendored) | 45 type references, brand onboarding, import and export; text is 8 px and the phone layout needed a second SVG | Archify for code-grounded maps on a large screen |

## 2. What was measured
| Skill (commit) | Page: checks / jury | Review: defects found | Diagram: checks / jury | Cost vs control | Score |
|---|---|---|---|---|---|
| Control (no skill) | 12/14 / 3.63 | 28/31 | 12/12 / 4.75 | 1.0x | – |
| Hallmark (`7ec8682`) | 13/14 / **4.38** | **30/31** | – | 1.9x | 7.3 |
| Taste Skill (`12af471`) | **14/14** / 2.88 | 28/31 | – | 2.1x | 6.5 |
| UI UX Pro Max (`1f88579`) | 13/14 / 3.88 | 28/31 | – | 1.5x | 7.5 |
| Anthropic frontend-design (`dbd4588`) | 13/14 / 3.63 | – | – | 1.2x | 7.3 |
| Interface Skills (`592aedc`) | – | 27/31 | – | 1.6x | 7.3 |
| Diagram Design (`b8f3617`) | – | – | 10/12 / 3.63 | 2.4x | 5.5 |
| Archify (`81c6be8`) | – | – | 9/12 / 1.75 | 1.4x | 5.8 |

Page checks: axe, sideways scroll, visible focus on every Tab stop, keyboard toggle and FAQ, every fact present, reduced
motion, 24 px targets, 12 px text, headline and call to action on the first screen, nothing invented, page structure,
works without JavaScript, no errors. Review key: 31 planted defects (11 accessibility, 5 layout, 5 writing, 4 polish,
3 contrast, 3 typography). Jury: two model judges who see only screenshots, four dimensions, 1 to 5. Scores are the
rubric in `guides/source-rubric.md` (Default look, Coverage and Accessibility are relative to the control, so a skill
no better than no skill gets 3).

## 3. Things that held for every skill
- **The control is strong.** An unaided agent with a browser found 90% of the planted defects and built a page that passed
  12 of 14 checks. Treat a skill as a discipline and a checklist, and measure whether it beats that on your task.
- **Cost is real.** 1.2x to 2.8x the control's tokens and 1.6x to 7x its minutes. The cheapest (`frontend-design`, 72 lines)
  also added the least.
- **Every skill that ships scripts hit setup friction as root:** Hallmark's and Taste's browser checks need `--no-sandbox`
  (and Hallmark `puppeteer-core`), and neither documents it.
- **No skill replaces measuring.** Reviewers found their facts with their own Playwright probes; none ships a contrast or
  target-size checker that ran out of the box. Use `axe-core` (test-only, MPL-2.0) alongside any of them.
- **A skill can fight the brief.** Hallmark's word budget, UI UX Pro Max's generated "trust" pattern and Taste's
  imagery quota each pulled against a pricing page with no invented claims; the runs overrode them.
- **Limits:** n = 1 run per track, two judges, one brief per track (a pricing page, a process diagram). Differences under
  about one rubric point are noise. Hallmark's lead on look (0.75 of a jury point) is the one gap that two judges agreed on.

## 4. Using them in this repo
- **Vendored** means an unmodified copy saved in `vendor/skills/`, pinned to one version, so it loads in our own sessions
  with nothing to install, no sign-up and no cost. It is **not** shipped by the `ux-library` plugin. Vendored: Hallmark,
  Interface Skills (13 of 14), Anthropic `frontend-design`, plus the Pocock skills. See `vendor/skills/THIRD_PARTY.md`;
  `npm run skills:link`.
- Not vendored: Taste Skill, UI UX Pro Max, Diagram Design, Archify. `node benchskills/fetch.mjs` fetches their pinned commits
  for re-runs; vendor a new one only after vetting it, and only if it is free and works without setup (`ux-add`, "Agent skill, plugin or design-toolkit repo").
- Every third-party skill is code an agent will follow: `node scripts/vet-skill-repo.mjs <repo>` first, read the flagged
  lines, never install by running the author's installer, pin the commit. Opt-in behaviours found so far: Hallmark's hook
  installer and Together AI image key, Taste's `install.sh` and open-archive downloads, Archify's update check
  (`ARCHIFY_UPDATE_CHECK_DISABLED=1`), UI UX Pro Max's Pexels scraper and a broad sample settings file.

## 5. Looked at, not benchmarked
Logged with reasons in `research/catalogue/skill-sources.csv`: Stitch Skills (needs a Google Stitch account and MCP),
Scroll World (paid Monid and Higgsfield services, about $27 a chain), Frontend Slides (deck builder: to be compared with the
team's own deck skill). A list of skill repos is a lead, not a recommendation: vet each one before it reaches this table.

## 6. Re-running
`benchskills/README.md` has the procedure. Re-run a skill after it updates (the profile names the commit and date) and add a
brief when a new kind of job matters (a form, a data table, a dashboard) rather than trusting a pricing-page result for it.
