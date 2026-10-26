# Third-party skills

Vendored unmodified, loaded in this repo's own sessions through `.claude/skills` (`npm run skills:link`) and **not**
shipped by the `ux-library` plugin, which only exposes `skills/` (ours: `ux-add`, `ux-find`).
Scored profiles, bench evidence and verdicts live in `sources/` and `guides/design-skills.md`.

| Skill | Source | Commit | Licence |
|---|---|---|---|
| `grill-me`, `grilling`, `handoff`, `diagnosing-bugs` | [mattpocock/skills](https://github.com/mattpocock/skills) | `5beb35b` (2026-10-19) | MIT, `LICENSE-mattpocock-skills.txt` |
| `better-accessibility`, `better-colors`, `better-interface`, `better-layout`, `better-typography`, `better-ui`, `better-writing`, `interface-review`, `explain-interface`, `break`, `state-machine`, `variant`, `build-design` | [jakubkrehel/skills](https://github.com/jakubkrehel/skills) | `592aedc` (2026-10-25) | MIT, `LICENSE-jakubkrehel-skills.txt` |
| `hallmark` | [Nutlope/hallmark](https://github.com/Nutlope/hallmark) | `7ec8682` (2026-10-22) | MIT, `hallmark/LICENSE` |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) | `dbd4588` (2026-10-09) | Apache 2.0, `frontend-design/LICENSE.txt` |

Left out on purpose: Diagram Design (the unaided model drew a better diagram on our brief; profile kept in `sources/`), `teardown` (Interface Skills; ships JS assets and has no use here), the upstream `agents/openai.yaml`
files of the Pocock skills (Codex metadata; Hallmark's `agents/` folder is kept as shipped), and the Anthropic document skills (`docx`, `pdf`, `pptx`, `xlsx`: source-available, not open source).
To update a skill, re-copy it from upstream at a newer commit, bump its row and rerun `npm run skills:link`.
Hallmark: leave `TOGETHER_API_KEY` unset (optional paid image generation; the skill uses stand-ins without it) and never run its `scripts/install-hook.mjs` (it edits `.claude/settings.json`).
Before vendoring a new one, vet it first (`node scripts/vet-skill-repo.mjs <repo-url>`).
