# Third-party skills

Vendored unmodified. Our own skills (`ux-add`, `ux-find`) are the only ones maintained here.

| Skill | Source | Commit | License |
|---|---|---|---|
| `grill-me`, `grilling`, `handoff`, `diagnosing-bugs` | [mattpocock/skills](https://github.com/mattpocock/skills) | `5beb35b` (2026-10-19) | MIT, see `LICENSE-mattpocock-skills.txt` |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) | `dbd4588` (2026-10-09) | Apache 2.0, see `frontend-design/LICENSE.txt` |

The `agents/openai.yaml` files upstream are Codex metadata and were left out.
The Anthropic document skills (`docx`, `pdf`, `pptx`, `xlsx`) are source-available, not open source: do not vendor them.
To update a skill, re-copy it from upstream at a newer commit and bump the row above.
