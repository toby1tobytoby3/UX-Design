# AI and agentic UI

`ux-find` reads this for chat interfaces, agents, approvals, diffs and review, citations, AI labelling, generative UI and
inline AI in ordinary screens (ghost text, rewrite in place, AI fill).
**Step 1** picks the stack (benchmarked in `benchai/`). **Steps 2–5** are defaults for chat (E1), agent runs (E2), human
oversight (E3) and trust and provenance (E4). Everything is guidance with reasons: depart when the situation calls for it.

Research behind this guide, with sources and the evidence key: `research/E-agentic-ui.md`. Patterns: `pattern: ai-chat`,
`agent-activity`, `ai-review`, `ai-provenance` in `catalog.json`.

## 1. Stack
Every kit streamed the same 900-word scripted turn (markdown, code, a table, a tool call, an approval and two citations)
from a mock, offline, at 4× CPU throttle (`benchai/`). Scores in `SOURCES.md` (ai-chat section); **fit beats score**.

| Layer | Use | Why (evidence) | Instead, if… |
|---|---|---|---|
| State and transport | **AI SDK `useChat`** (`ai-sdk-ui`, 6.5) | Headless, so it fits Tailwind without shadcn; stop, regenerate, resumable streams and **tool approval** (`addToolApprovalResponse`) all worked offline in the bench | You want the controls built for you: assistant-ui on top of it |
| Message text | **Streamdown** (6.8) | Same chat, renderer swapped: script time **22.7 s → 9.0 s**, stream finished in 18.8 s vs 32.8 s, and no raw `**` or half-typed links (only a table header before its divider row). Pin 2.x; needs a Tailwind `@source` line and ~11 CSS variables; links render as buttons unless you configure `linkSafety` | Bundle matters more than polish (154.6 KB gz): react-markdown + `remend` + `useChat` throttle |
| Thread controls (stop, retry as branch, edit, follow-and-release scroll) | **assistant-ui primitives** (6.8), styled ourselves | The only kit where all four controls worked out of the box; retry kept the old answer as branch `‹ 2/2 ›`. Heavy (192 KB gz) and the slowest default markdown, so use Streamdown as its `Text` | A simple chat: build the four controls on `useChat` (it gives `stop` and `regenerate`; branches are yours) |
| Scroll model | **Turn anchoring** (`@shadcn/react` MessageScroller, unstyled) | See E1 defaults; captured in `ai-chat/shadcn-message-scroller-turn-anchoring` (not benchmarked) | Log-like agents: `use-stick-to-bottom` |
| Diff review | **jsdiff** (engine) + **`@pierre/diffs`** (renderer) | No library ships per-hunk accept/reject; `@pierre/diffs` has Keep/Undo hunks and annotations (`ai-review/pierre-diffs-keep-undo-hunks`, not benchmarked) | Lighter, widget-based: `@git-diff-view/react` |

Not recommended: **CopilotKit** (5.5: 681 KB gz plus 2.9 MB lazy, highest layout shift 0.053, two critical axe failures,
bundles an old Streamdown that corrupts tables, `@scarf/scarf` install analytics) and **LlamaIndex chat-ui** (4.3: 1 MB,
critical axe failure, source cards unreachable by keyboard, no release since August 2025). Vercel's **AI Elements** is being
folded into shadcn/ui (package deprecated end of November 2026): read it for patterns, don't depend on it.

What every kit got wrong: **none provides a live region** for the answer. Add the status-region announcement from E1 yourself.

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

## 7. Inline AI assist (E6)
AI inside ordinary screens: ghost text in fields and editors, rewrite a selection in place, AI fill for forms, AI command
menus, inline summaries and suggested replies. Research: `research/E6-inline-ai.md`. Patterns: `pattern: ai-assist`.

**Stack** (benchmarked in `benchinline/`: same four tasks, ghost text, rewrite with diff, AI fill, AI command menu, from
one offline mock; scores in `SOURCES.md`, ai-assist section):

| Need | Use | Why (evidence) | Instead, if… |
|---|---|---|---|
| Ghost text, rewrite and AI fill in **plain fields** (most forms, comments, descriptions) | **Our reference build**: AI SDK `useCompletion` / `useObject` + `rich-textarea` + jsdiff (`benchinline/libs/ai-sdk-inline.jsx`, 8.8) | No maintained library does ghost text in a plain textarea. Ours passed 4/4: ghost text in 671 ms with one request, Tab/Esc/⌘→, IME-safe, hidden from screen readers with one announcement, rewrite applied 3/3 and undone in one step, 1.5 s script per rewrite, 0 axe. **Caveat:** it was written to these defaults, so the bench partly checks itself | – |
| Inline AI in a **rich editor** | Decide the editor first (D5, not built yet). **Plate AI** (6.0, MIT) only if the editor is Plate and after fixing its gaps | Plate: ghost text and ⌘J menu work, but Accept applied the rewrite in only **16 of 27 trials**, re-diffing the whole block cost **20.9 s of script** per 272-word rewrite (no throttle), ghost text shows during IME composition and is read by screen readers, 2 critical axe failures. 487 KB gz | Free Tiptap or Lexical core with our own AI layer (same pieces as the plain-field build) |
| Not recommended | **BlockNote AI** (4.5) | GPL-3.0 or a paid Business subscription for closed source; no ghost text; undo after Accept leaves garbled text (Revert works); ships AI SDK v6 next to our v7 | – |

Not benchmarked: **Tiptap AI** (paid subscription), **Novel** (no release since January 2025), **CopilotTextarea** (deprecated).

| Default | Why | When to depart |
|---|---|---|
| Go inline when the user is already editing something and the output has **one known destination** (this field, this selection, this row): 4–7 presets plus one "Ask AI…" field. Open questions and multi-step work go to chat or a side panel | People iterate on the artefact itself; broad commands belong in panels (NN/g, Shape of AI) | AI-native, conversational products (E1/E2) |
| **Ghost text**: after the caret, in the field's font, muted but **≥ 4.5:1**, not selectable. Off-caret multi-line edits get a gutter marker | Copilot, Cursor and Plate converge on this; it's content, so it needs text contrast. Plate's demo ghost text measured only 2.7:1 (`ai-assist/plate-copilot-ghost-text`) | Code editors: follow the editor theme |
| Trigger only where continuation is likely (caret at the end of a block, after a space or punctuation); **debounce 250–400 ms**; **abort on every keystroke**; manual trigger **Ctrl+Space** | Measured defaults: CopilotKit 250 ms, codemirror-ai 300 ms, monacopilot 400 ms; Cursor now shows *fewer* suggestions for a higher accept rate | Structured fields (tags, SKU): instant non-LLM autocomplete. Slow-thinking prose: 600–800 ms |
| Worth showing only within ~1 s of the pause; complete to the next punctuation mark; **no spinner** for ghost text | A spinner for something nobody asked for is noise | An explicit "Complete" command shows a "Writing…" pill |
| Keys: **Tab** accept · **Esc** dismiss (typing over it also dismisses) · **⌘→ / Ctrl+→** next word · **Alt+] / Alt+[** alternatives | The converged model (Copilot, Cursor, Plate, Gmail Smart Compose) | – |
| In forms, **intercept Tab only while a suggestion is showing**; otherwise Tab moves focus; never touch Shift+Tab | WCAG 2.1.2 no keyboard trap; keeps keyboard form-filling intact | Rich editors where Tab indents: indent when there's no suggestion |
| Rewrite entry points: a selection-toolbar "Edit with AI", **⌘K** in plain fields (**⌘J** where ⌘K is "insert link"), `/ai` and space-on-empty-line in block editors | Notion, Plate, BlockNote and CopilotKit agree | A single-purpose field: one "Generate" button beats a menu |
| Show short rewrites as an **inline word diff**: deletions **struck through**, insertions **underlined**, colour as a second cue only (Plate's diff uses colour alone, which fails WCAG 1.4.1); longer ones as a highlighted replacement with "Show changes". Action bar under the range: **Accept** (Enter, default) · **Discard** (Esc) · **Try again** · a refine field; **Insert below** for generative actions | Plate, Tiptap and Notion converge; "a suggestion layer, not an overwrite" (Shape of AI) | Proofreading many small fixes: underline each and step through (Apple Writing Tools, Grammarly) |
| Accept is **one undo step** (⌘Z restores the original exactly); keep Try-again drafts for the session; fields keep "Restore my text" until save | Gmail Help me write, Carbon's "revert to AI", Apple Writing Tools Revert | – |
| Stream into a **preview layer**, never into committed content; lock the range; "Writing… · Stop (Esc)"; on stop keep the partial preview with Accept/Discard. Form fill streams a partial object field by field (`useObject`) | Users can't review what's already been written over their text | Outputs under ~1 s: render once |
| **Never auto-apply.** Never overwrite a non-empty field without asking; bulk fills preview 3–5 rows first | Shape of AI auto-fill; Apple: avoid automating destructive actions | Admin-configured auto-apply for low-risk metadata, logged and reversible (Linear) |
| AI fill: a "✨ Generate" button in or beside the field; output is **pending** (tint + AI label + Accept / Retry / Undo) with **why** for inferred values | Carbon for AI label; Linear's suggestions with reasons | High-volume data entry: accept-all with one review summary |
| **Labels:** pending AI content is tinted and labelled; accepted prose carries **no permanent label** (it's the user's text); AI-filled fields keep the label until a human edits or confirms | EU AI Act Art. 50(2) exempts assistive editing and 50(4) human-reviewed text (see E4) | Regulated or collaborative docs: keep an AI-assisted footprint in history |
| Inline summaries on demand for long threads, with **scope and freshness** ("14 messages · 2 min ago"), links to sources, marked stale when new items arrive | Shape of AI summary; NN/g review summaries | Routine material (meeting notes) can summarise automatically |
| Suggested replies: **3 chips**; tapping **inserts for editing, never sends**; hide once the user types | Ownership of what's sent | Support macros with a review step |
| Screen readers: ghost text **`aria-hidden`**, one polite announcement ("Suggestion: … Tab to accept"), a setting to turn automatic suggestions off; rewrite results move focus to the action bar with a change count | VS Code's accessibility signals and Accessible View. **Plate's ghost text is not hidden** from screen readers, so don't copy it blindly | – |
| **IME:** no request and no ghost text during composition; ignore Tab/Enter/Esc while `isComposing` | Ghost text inside a composition corrupts CJK input | – |
| **Phones:** no ghost text (no Tab key; fights OS predictions); an "Improve" chip after a few words and a bottom sheet of presets, full-width ≥ 44 px buttons | Plate hides ghost text below `sm`; Gmail mobile "Refine my draft" | Tablets with keyboards: desktop model |
| Cost and privacy: one request per field in flight, cache by prefix, Snooze and off switches, pause on `saveData`/metered; send only the field plus minimal context and say what's sent; **never** send password, card or one-time-code fields | VS Code pauses on metered connections; Apple: show what's shared | Flat-cost internal tools can relax triggers |
| Failures: ghost text fails **silently**; rewrites fail **inline** with a plain reason + Retry + Cancel and the original untouched; quota says when it resets | BlockNote's error state; Apple and PAIR on paths forward | – |

## 8. Screens we still need (logged-in products)
The best agentic references sit behind logins, so they need user screenshots (`/ux-add` with the image). Priority list:
Claude (thinking block, branch arrows, research citations, permission prompt), ChatGPT (agent mode Take over and
consequential-action confirm, deep research panel), Cursor (todo list, run-mode approval, per-change Keep/Undo, Restore
checkpoint), Claude Code (permission prompt, mode chip, `/rewind`), Gemini Deep Research (editable plan), Elicit (quote per
cell). For inline AI: Cursor Tab (ghost text, word accept, Snooze), VS Code Copilot (hover toolbar, next-edit gutter arrow),
Notion AI (Edit with AI → Accept / Discard / Try again, database AI Autofill), Gmail (Smart Compose, Help me write drafts,
thread summary), Linear (triage suggestions with reasons), Apple Writing Tools (proofread, Revert). Full lists with exact
screens: `research/E-agentic-ui.md` and `research/E6-inline-ai.md`, "Logged-in products".
