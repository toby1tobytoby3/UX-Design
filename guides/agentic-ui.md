# AI and agentic UI

`ux-find` reads this for chat interfaces, agents, approvals, diffs and review, citations, AI labelling and generative UI.
**Step 1** picks the stack (benchmarked in `benchai/`). **Steps 2–5** are defaults for chat (E1), agent runs (E2), human
oversight (E3) and trust and provenance (E4). Everything is guidance with reasons: depart when the situation calls for it.

Research behind this guide, with sources and the evidence key: `research/E-agentic-ui.md`. Patterns: `pattern: ai-chat`,
`agent-activity`, `ai-review`, `ai-provenance` in `catalog.json`.

## 1. Stack
STACK_TABLE

## 2. Chat and streaming (E1)
| Default | Why | When to depart |
|---|---|---|
| Streaming markdown through a **self-healing** renderer (Streamdown, or react-markdown + `remend`); memoise finished blocks | Half-typed `**`, links and code fences otherwise flash as raw syntax and reflow | Plain-text bots |
| Render an open code fence as code at once; highlight lazily (on block close or idle); show Copy once the block closes | Re-highlighting every token reflows; Shiki is heavy | Short snippets |
| Throttle UI updates to ~50 ms (`useChat({ throttle: 50 })`) | Tokens arrive faster than React usefully paints | Very slow models |
| **Anchor the new user message near the top and let the answer grow into the space.** Follow only while the reader is at the live edge; any scroll, selection or key press releases it; show "Jump to latest" | NN/g: don't autoscroll users to the end; the shadcn Message Scroller guide agrees | Terminal or log-like agents with short outputs: stick-to-bottom is fine |
| Reopen a saved chat at the **last user message** | That's where the reader left off | Support chats |
| Indicator within 100 ms of send; after ~1 s replace it with a specific status ("Searching 4 sites…") | NN/g response limits; Apple: specific beats "Processing…" | – |
| Reasoning collapsed to one line with live summary and time ("Thinking… 12 s" → "Thought for 12 s") | Keeps the answer primary while proving work | Expert/debug modes |
| Send becomes **Stop** in the same place while streaming (Esc too); keep the partial answer marked "Stopped" with Retry | Predictable target; nothing lost | – |
| Retry and edit create **branches** with a `‹ 2/3 ›` picker, not overwrites | Earlier answers stay recoverable | Single-shot "rewrite this field" tools: replace + undo |
| Assistant message actions: Copy, Retry, 👍/👎, More. Visible on hover/focus, always visible on the latest message | Hover-only fails touch and keyboard | Dense agent logs: overflow menu |
| Enter sends, Shift+Enter newline, **never send during IME composition** (`isComposing` or keyCode 229) | Otherwise CJK users send half-typed text | Long-form composers: Cmd/Ctrl+Enter sends |
| Typing allowed while streaming; sending **queues** the message (visible, editable, cancellable) | Users steer mid-run | Simple FAQ bots |
| Attachments as chips with size and remove; validate before send; per-file progress; show on the sent turn | Errors after send waste a turn | – |
| Transcript `role="log"` but the streaming text is **not** announced: `aria-busy` on the streaming message, then one polite "Response complete" announcement; focus back to the composer after send or stop | Token-by-token announcements flood screen readers (see `guides/accessibility.md`) | Voice-first interfaces |
| Network drop: keep the partial answer, inline error with Retry, resume if the server supports it | AI SDK supports resumable streams | – |

## 3. Agent runs (E2)
| Default | Why | When to depart |
|---|---|---|
| For expensive or multi-step runs, show a short plain-language plan with **Proceed / Edit plan / Handle it myself** before acting; for cheap runs the plan is advisory | The cheapest time to stop a wrong run is before it starts | Users opted into autonomy for this task type |
| Plan steps describe outcomes ("Cancel flight AA123"), not calls (`cancel_booking(id)`) | People approve what they understand | Developer tools show both |
| Pin the plan as a live checklist (pending, running, done, failed) | Shared by Claude Code, Cursor and ChatGPT agent | One- or two-step runs |
| Step log **collapsed by default**, one line per step (icon, verb, object, duration); auto-expand the running and any failed step; group repeats ("Read 12 files") | Proof of work without burying the answer; errors seen without hunting | Debug/verbose mode |
| Expanded tool call: input, output (truncated with Show all), status; redact secrets | Matches the AI SDK tool-part states | – |
| Progress = elapsed time + steps done/total + current activity. **No fake percentage bars**; ETA only from real history | Honest progress builds trust | Deterministic pipelines ("340/1,200 files") |
| Two interrupt controls: **Stop** (say what happened to in-flight calls) and **Steer** (queue an instruction for the next step). Esc stops | Stopping mid-write can corrupt state, so say so | Transactional tools where hard cancel is safe |
| Parallel work and subagents as task cards (title, status, elapsed, last activity); subagents nest under their parent step | Claude Code, Cursor and Codex converge on this | One agent at a time |
| Background runs notify **only** on done, needs input or failed; on return show a summary first, then the log | Interruptions should be rare and actionable | Runs under ~30 s stay inline |
| Browser/computer agents get a visible **Take over** that pauses the agent, and a clear "You're in control / Hand back" state | Protects user autonomy | Headless agents |
| Context and cost meters hidden until > ~70% of context is used or the user pays per run; warn before an expensive step | Noise otherwise | Power-user tools: always visible |
| Final report: what changed (links), what was verified, what's left or skipped, next actions | People need to know what wasn't done | Q&A with no side effects |

## 4. Human oversight (E3)
| Default | Why | When to depart |
|---|---|---|
| Approval prompt inline in the transcript: plain-language action + exact command/target + why + scope. **Allow once · Always allow `<narrow scope>` · Deny**, plus "Tell it what to do instead" | Denial with feedback keeps the run useful (AI SDK returns `output-denied` to the model) | OS-level permissions: modal |
| "Always allow" scoped to the narrowest pattern (command prefix, domain, folder) and **named in the button**; rules reviewable and revocable in settings | Claude Code and Cursor both do this | – |
| 3–4 named permission modes as an **always-visible chip** by the composer, cycled with a shortcut; start safe; persist per project | Claude Code (Shift+Tab), Cursor run modes, the "autonomy dial" | Consumer agents: two modes (Ask first / Act for me) |
| An always-ask floor in every mode: deletes outside the workspace, payments, sending messages as the user, publishing, credential use | Apple: don't automate destructive actions | Labelled throwaway sandboxes |
| Classifier auto-approval is named in the mode and logged, with blocked calls shown with a reason | No silent decisions | – |
| Diffs unified by default, split toggle on wide screens, unchanged context collapsed to 3 lines | Split is unreadable below ~900 px | Prose edits: inline word diff (redline) |
| Per-hunk **Accept / Reject**, per-file Accept all / Reject all, one "Review N changes" bar with next/previous hunk keys; rejected hunks go back to the agent. Engine: jsdiff `structuredPatch` → `applyPatch`; renderer: `@pierre/diffs` or `@git-diff-view/react` | No diff library ships per-hunk accept/reject, so we compose it | Single-hunk edits: one Apply / Discard |
| Irreversible actions confirm by **naming the consequence and the objects** ("Delete 3 branches: a, b, c. This can't be undone"); verb label; not default focus; no Enter-to-confirm. Type-to-confirm only for mass or catastrophic actions | Overused typed confirms train people not to read | Reversible actions: undo instead |
| Checkpoint before each agent turn; Restore on any earlier message (code, conversation or both); **say what checkpoints don't cover** (shell side effects, external APIs, sent email) | Claude Code `/rewind` documents exactly this limit | – |
| Pending approvals show on the task card and in a notification; the run waits visibly; no silent timeouts | Async approval is common for background agents | – |

## 5. Trust and provenance (E4)
| Default | Why | When to depart |
|---|---|---|
| Citations as inline numbered chips after the claim (favicon + domain) with a hover/focus card: title, site, date, **the quoted passage**; a Sources list at the end; deep-link to the passage | Lets people check the claim, not just the site | Long reports add a sources side panel; single-source answers use one "From: X" line |
| Separate user-provided sources from retrieved ones; never render a citation the system didn't retrieve | Fake citations destroy trust fastest | – |
| AI identity visible **at or before the first message** ("AI assistant" in the header) with an accessible name; no human names or avatars implying a person | EU AI Act Art. 50 (in force since 2 Aug 2026); Apple HIG | AI-native tools still keep the cheap header label |
| In mixed documents, an "AI" label on generated blocks that opens what was generated, from what and by which model; it stays until a human edits or accepts | IBM Carbon for AI's AI label | Obvious chat replies |
| **No LLM-generated confidence percentages.** Use categorical states tied to action ("Verified in 3 sources", "Single source", "Not found: model's own knowledge"), alternatives, or highlight unsupported sentences | PAIR calls numeric confidence risky; LLM self-reported confidence is overconfident (ICLR 2024) | Calibrated classifier scores (fraud, OCR) |
| Specific local caveats ("Prices may have changed since 12 Oct") over a global "AI can make mistakes"; keep one short global footer | Global caveats get ignored | – |
| Model shown in the picker and in each message's metadata; **inline when it changed** (fallback or switch) | Silent fallbacks break trust | Single-model consumer apps |
| Agent audit trail per run: prompt, plan, every tool call, approvals (who, when, scope), model and version, sources, final diff; exportable and linkable | Enterprise review needs it | – |
| Show when memory or connectors were used ("Used 2 memories · Google Drive") with view and forget | Apple: disclose how personal data is used | – |
| Generated media carries C2PA Content Credentials where supported, with a visible badge and inspect link | Art. 50(2) machine-readable marking (grace period to Dec 2026 for systems already on the market) | – |

**Legal box (not legal advice).** EU AI Act Art. 50 transparency duties apply from 2 August 2026: people must be told
they're interacting with AI at the latest at first interaction, in an accessible way; AI-generated public-interest text
published without human editorial review and realistic synthetic media need visible labels.

## 6. Generative UI (E5, brief)
Map **typed tool results to our own components** (AI SDK `message.parts`, `tool-<name>` states) instead of letting the
model author markup. Inline cards for one decision or a little data, **at most two primary actions**; iterative work in a side
panel with version history. Model-authored HTML/JS only in a sandboxed iframe. Don't build on AI SDK RSC (its docs say it
isn't for production). Watch MCP Apps, A2UI, AG-UI and json-render.

## 7. Screens we still need (logged-in products)
The best agentic references sit behind logins, so they need user screenshots (`/ux-add` with the image). Priority list:
Claude (thinking block, branch arrows, research citations, permission prompt), ChatGPT (agent mode Take over and
consequential-action confirm, deep research panel), Cursor (todo list, run-mode approval, per-change Keep/Undo, Restore
checkpoint), Claude Code (permission prompt, mode chip, `/rewind`), Gemini Deep Research (editable plan), Elicit (quote per
cell). Full list with exact screens: `research/E-agentic-ui.md`, "Logged-in products".
