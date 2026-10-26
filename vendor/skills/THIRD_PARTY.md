# Third-party skills

Vendored unmodified, loaded in this repo's own sessions through `.claude/skills` (`npm run skills:link`) and **not**
shipped by the `ux-library` plugin, which only exposes `skills/` (ours: `ux-add`, `ux-find`).
Scored profiles, bench evidence and verdicts live in `sources/` and `guides/design-skills.md`.

| Skill | Source | Commit | Licence |
|---|---|---|---|
| `grill-me`, `grilling`, `handoff`, `diagnosing-bugs` | [mattpocock/skills](https://github.com/mattpocock/skills) | `5beb35b` (2026-10-19) | MIT, `LICENSE-mattpocock-skills.txt` |
| `better-accessibility`, `better-colors`, `better-interface`, `better-layout`, `better-typography`, `better-ui`, `better-writing`, `interface-review`, `explain-interface`, `break`, `state-machine`, `variant`, `build-design` | [jakubkrehel/skills](https://github.com/jakubkrehel/skills) | `592aedc` (2026-10-25) | MIT, `LICENSE-jakubkrehel-skills.txt` |
| `diagram-design` | [cathrynlavery/diagram-design](https://github.com/cathrynlavery/diagram-design) | `b8f3617` (2026-10-26) | MIT, `diagram-design/LICENSE` (bundled icon notices in `diagram-design/THIRD_PARTY_LICENSES.md`) |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) | `dbd4588` (2026-10-09) | Apache 2.0, `frontend-design/LICENSE.txt` |

Left out on purpose: `teardown` (Interface Skills; ships JS assets and has no use here), the upstream `agents/openai.yaml`
files (Codex metadata), and the Anthropic document skills (`docx`, `pdf`, `pptx`, `xlsx`: source-available, not open source).
To update a skill, re-copy it from upstream at a newer commit, bump its row and rerun `npm run skills:link`.
Before vendoring a new one, vet it first (`node scripts/vet-skill-repo.mjs <repo-url>`).
