---
title: CopilotKit
kind: source
pattern: ai-chat
page_type: app
tags: [ai, chat, streaming, open-source, agents, copilot]
source_url: https://www.copilotkit.ai
source_site: copilotkit.ai
captured_at: 2026-10-17
captured_by: toby
input: library-render
version: 1.79.1
licence: MIT
s_look: 4
s_interact: 3
s_coverage: 3
s_a11y: 2
s_perf: 3
s_react: 3
s_bundle: 1
s_licence: 3
why_it_works: A polished drop-in copilot chat over the AG-UI agent protocol, with tool-call cards, human-in-the-loop hooks and shared agent state, so an in-app assistant that acts on the page can be wired up quickly.
use_when: An in-app copilot (sidebar or popup) that reads and changes app state through frontend tools, where a finished look matters more than bundle size.
avoid_when: Bundle size matters (681 KB gz up front), you need citations, branching or edit out of the box, or install analytics are unacceptable.
alternatives: [assistant-ui, ai-sdk-ui]
has_example: false
---

## Verdict
**Fastest route to a finished-looking copilot, at a large cost in weight.** The default chat looks the most complete
of the five and its tool cards and approval hook work. But it ships 681 KB gz before anything lazy-loads, renders
citations nowhere, hides regenerate/edit/branch unless you implement them, and its bundled markdown renderer added
stray characters to our text.

## Benchmark (same scripted turn as every other kit)
3/4 tasks. Code: `benchai/libs/copilotkit.jsx`. Ran **offline** via `selfManagedAgents`: a client-side AG-UI agent
replays the mock as AG-UI events, so no `CopilotRuntime` server was needed (production use normally has one).

| Measure (4× CPU throttle) | Result |
|---|---|
| JS, library only | **681 KB gz** initial, +2,956 KB lazy chunks, 30.2 KB CSS |
| Script time while streaming | 10.6 s, 25 long tasks (2.6 s) |
| Stream finished | 26.0 s for a turn the mock paces at ~11 s |
| Layout shift | **0.053**, the highest of the five |
| Raw markdown seen mid-stream | only a table header before its `---` row (1 of 181 samples) |
| Follows the stream | no (a scroll-to-bottom button instead) |

Found in the benchmark:
- **Stray asterisks in the final text.** Its bundled Streamdown **1.6.11** rendered `release/*` cells as `Yes*`,
  `No*`, `Never*` and appended `*` to the follow-up message. Standalone Streamdown 2.7.0 rendered the same text correctly.
- Tool calls render as collapsible cards with name and status by default (`useDefaultRenderTool`); arguments and
  result appear when expanded.
- `useHumanInTheLoop` rendered our Approve/Deny and `respond()` resumed the run.
- Stop works once the agent implements `abortRun()`: the base AG-UI `AbstractAgent.abortRun()` is a no-op, so a
  custom agent must abort its own stream (HttpAgent does this for you).
- Regenerate, edit and branch buttons exist but **only render when you pass handlers** (`onRegenerate`,
  `onEditMessage`, `onSwitchToBranch`) and implement the logic.
- AG-UI has no citation/source event, so the two sources had nowhere to go: **citations unsupported**.
- axe: `button-name` (critical, 2 icon-only buttons) and `scrollable-region-focusable` (serious). No live region.
- Adds a "AI can make mistakes. Please verify important information." disclaimer under the composer by default.

## Coverage
| Capability | Support |
|---|---|
| Streaming text | ✓ (Streamdown 1.x inside) |
| Stop | ✓ (needs `abortRun` in custom agents) |
| Retry / edit / branch | Handlers only: buttons appear when you implement them |
| Attachments | ✓ add-menu and attachment queue (not benchmarked) |
| Tool steps | ✓ default tool cards |
| Approvals | ✓ `useHumanInTheLoop` render |
| Citations | ✗ no source event in AG-UI |
| Generative UI | ✓ tool renders, A2UI, sandboxed "OpenGenerativeUI" |

## Styling with Tailwind
Ships its own prefixed Tailwind build (`cpk:` classes, 30 KB gz CSS) using shadcn-style tokens. Overridable via slots
and CSS variables, but it's its own design system rather than our Tailwind classes.

## Weaknesses
- 681 KB gz initial plus ~3 MB of lazy chunks (KaTeX, Mermaid, Shiki and more).
- Installs `@scarf/scarf` install analytics (opt out with `SCARF_ANALYTICS=false`) and upsells a paid
  "Intelligence/Cloud" tier.
- Highest layout shift of the five while streaming.

## Scorecard
| Criterion | Score | Evidence |
|---|---|---|
| Default look | 4 | Most finished default chat; marred by the stray-asterisk rendering bug |
| Interactivity | 3 | Stop works; regenerate/edit/branch need your handlers |
| Coverage | 3 | Tool steps and approvals yes, citations no; generative UI yes |
| Accessibility | 2 | 2 critical axe `button-name` failures, unfocusable scroll region, no live region |
| Performance | 3 | Lowest script time (10.6 s) but 25 long tasks and the highest layout shift (0.053) |
| React/Next fit | 3 | Provider + agent protocol; production needs a runtime endpoint; own CSS system |
| Bundle size | 1 | 681 KB gz initial |
| Licence & health | 3 | MIT and very active, but install analytics and a paid-cloud upsell |
