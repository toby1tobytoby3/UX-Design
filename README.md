# UX-Design

The team's library of leading UX patterns: screenshots, analysis and code we can look up while building.

- **Browse:** [published gallery](https://claude.ai/artifact/NRvM6i9bYjZeVUGWY9wQfL), or locally with `npm run gallery`
- **Table:** [CATALOG.md](CATALOG.md)
- **How it works:** [handbook](https://claude.ai/artifact/Qgprmg98mR26eXVZzxvVRA) (source: `docs/how-it-works.html`) · design: [SPEC.md](SPEC.md)

## Use it from Claude Code
The repo is a plugin marketplace containing the `ux-library` plugin (skills `ux-add` and `ux-find`).

**Locally**
```
/plugin marketplace add toby1tobytoby3/UX-Design
/plugin install ux-library@ux-design
```

**In another project (local and cloud)** — add to that project's `.claude/settings.json`:
```json
{
  "extraKnownMarketplaces": {
    "ux-design": { "source": { "source": "github", "repo": "toby1tobytoby3/UX-Design" } }
  },
  "enabledPlugins": { "ux-library@ux-design": true }
}
```
In cloud sessions, also attach this repo to the session or environment so the skills can read and push entries.

Then just ask: *"add this to the UX library"* with a URL or screenshot, or *"find a good pricing page pattern in the UX library"*.

## Working in this repo
```
npm install                       # Playwright for captures (locally: npx playwright install chromium)
npm run capture -- <url> <dir>    # screenshots (+ --selector "<css>" for a focused crop and code)
npm run catalog                   # rebuild catalog.json, CATALOG.md, gallery/data.js
```
