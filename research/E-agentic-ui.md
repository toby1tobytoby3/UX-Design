# E. AI and agentic UI: research notes

Research for layer E of `research/categories.md`. It covers E1 Chat and streaming, E2 Agent workflows, E3 Human review
and approvals, E4 Trust and provenance (all P1), plus a short section on E5 Generative UI. Researched 2026-10-17 for our stack
(React/Next + Tailwind, **no shadcn**). The chat UI library benchmark is being built separately; these notes only set
the questions, the defaults and the shortlist that benchmark should test.

Evidence key: **[V]** checked today (npm, curl, page text or code probe). **[D]** from a vendor's own docs (fetched today).
**[M]** from memory or product observation, not re-verified today, so recapture before it goes into a guide.

---

## 0. Headline findings
1. **Vercel AI Elements is being folded into shadcn/ui.** The banner on ai-sdk.dev/elements says *"AI Elements is moving to shadcn/ui. This project
   will be deprecated at the end of November 2026"* [V]. The successor at ui.shadcn.com/docs/ai-elements ships copy-in shadcn compositions
   (Chat, Message, Plan, Tool, Confirmation, Checkpoint, Inline Citation, Reasoning, Queue, Subagent, Context…), not a package [V]. For us it's
   a **reference and source to read, not a dependency**. The exception is `@shadcn/react` (MIT, "Unstyled components for React"), whose headless
   `MessageScroller` we can use without shadcn [V].
2. **Streamdown also expects shadcn tokens**: *"components are built using shadcn/ui's design system and rely on CSS custom properties"*.
   Without shadcn you have to define about 11 CSS variables and add a Tailwind `@source` line [D]. That's manageable, but it's a stack flag.
3. **The AI SDK (v7) can run fully offline for benchmarks.** `ai` exports `MockLanguageModelV4`, `simulateReadableStream` and
   `DirectChatTransport({ agent })`, so `useChat` can run against a `ToolLoopAgent` in-process with no server and no API key [V, d.ts].
   Tool approval is native: a tool's `needsApproval` produces the part states `approval-requested`/`approval-responded`/`output-denied`, answered
   with `addToolApprovalResponse` [V, bundled docs].
4. **The EU AI Act Art. 50 transparency duties have applied since 2 Aug 2026.** The AI Omnibus didn't postpone them. Only the Art. 50(2)
   *marking* duty has a grace period, until **December 2026**, for generative systems already on the market before 2 Aug 2026 (EC fact page,
   updated 29 Jul 2026) [V]. Disclosure must be *"clear and distinguishable… at the latest at the time of the first interaction"* and must
   meet accessibility requirements (Art. 50(5)) [V]. The Code of Practice on transparency of AI-generated content was published in **June 2026** [V].
5. **Scroll behaviour has converged on "anchor the new turn, don't chase the stream"** (NN/g guideline 7; the shadcn Message Scroller guide). That
   contradicts the older "stick to bottom" default that `use-stick-to-bottom` implements, so the guide has to choose and say why.
6. **No diff library ships per-hunk accept/reject.** You build it on jsdiff (`diff` structuredPatch/applyPatch) and render it with
   `@pierre/diffs` (Shiki-based, line annotations, a merge-conflict "Accept current/incoming/both" UI) or `@git-diff-view/react` (widgets) [V].
7. **Numeric confidence percentages are a trap for LLM output.** PAIR calls numeric confidence "risky", and verbalised LLM confidence
   *"tend[s] to be overconfident"* (Xiong et al., ICLR 2024). That contradicts Smashing's "Confidence: 95%" pattern; see section 6.

---

## E1. Chat and streaming

### Topics the guide must answer
1. How do you render streaming markdown without flicker or reflow, including half-open code fences, links and tables?
2. Scroll: should the view follow the stream or anchor the new turn, and how does the reader get back to "latest"?
3. Latency states: what shows between send and the first token, while a model is "thinking", and on slow tools?
4. Stop, retry, edit and branch: what each does to the transcript, and how branches are navigated.
5. Message actions: which actions show, where, and when (copy, retry, feedback, share, read aloud).
6. Composer: Enter vs Shift+Enter, IME composition, multiline growth, paste/drop of files, queued messages while busy.
7. Attachments: preview chips, upload progress, limits and errors before send, what the model actually "saw".
8. Accessibility of streaming: live regions that don't read every token, focus after send and stop, keyboard reach for actions.
9. Errors and resumption: network drop mid-stream, partial answers, resume vs regenerate.
10. Long threads: performance (render throttling, virtualisation) and reopening a saved chat at the right place.

### Recommended defaults
| Topic | Default | Why (source) | Depart when |
|---|---|---|---|
| Streaming markdown | Use **Streamdown** (or react-markdown with **remend** preprocessing) and memoise per block, so completed blocks don't re-render | remend closes dangling `**`, `` ` ``, `$$` and `*`, and swaps half-typed link targets for a placeholder (`[link](streamdown:incomplete-link)`). We probed this with remend 1.4.0 today [V]. Unclosed ```` ``` ```` fences are left alone, so code renders as code from the first line | Plain-text bots, or a renderer you control end to end (marked + your own sanitiser) |
| Code blocks mid-stream | Render the open fence as a code block immediately, highlight lazily (Shiki on completion or idle), and show copy only once the block closes | Swapping highlighted spans on every token causes reflow. Shiki is heavy, so load it on demand [M] | Short snippets, where highlighting every chunk is cheap |
| Token cadence | Throttle UI updates to ~50 ms (`useChat({ throttle: 50 })`) and optionally smooth with `smoothStream` on the server | Tokens can arrive faster than React can usefully paint. The AI SDK documents `throttle` for exactly this [V, docs] | Very slow models, where every token matters for perceived speed |
| Scroll | **Anchor the user's new message near the top of the viewport and let the answer grow down into the space.** Follow only while the reader is at the live edge; any scroll, text selection or key press releases it. Show a "Jump to latest" button with a "streaming" indicator | NN/g: *"Don't autoscroll users to the end of a response"* (users lose their place). The shadcn Message Scroller guide: *"Auto-scroll should never be the default… Start a new turn near the top of the viewport"* [V] | Terminal or log-like agents with short outputs, where stick-to-bottom (`use-stick-to-bottom`) is fine and simpler |
| Reopening a chat | Open at the **last user message**, not the absolute bottom | shadcn guide: *"Reopen where the reader left off… Often this is the last user message"* [V] | Support chats, where the latest agent reply is the point |
| First token | Show a typing/shimmer indicator under 100 ms after send. After ~1 s, replace it with a specific status ("Searching 4 sites…") | Response-time limits (0.1 s / 1 s / 10 s, NN/g). Apple HIG: *"instead of 'Processing…', say 'Finding substitutions…'"* [V] | – |
| Reasoning ("thinking") | Collapsed by default as one line with a live summary and elapsed time ("Thinking… 12 s", then "Thought for 12 s"); expandable | Keeps the answer primary while proving work is happening. Shape of AI *Stream of Thought*: *"details minimized or altogether hidden behind a click"* [V] | Expert or debug modes, where you can default to expanded |
| Stop | The send button becomes **Stop** in the same place while streaming, with Esc as a shortcut. Keep the partial answer, mark it "Stopped" and keep Retry available | It's a predictable target and needs no hunting. The AI SDK `stop()` aborts the fetch and keeps the parts [V, d.ts] | – |
| Retry / regenerate | Retry creates a **sibling branch** rather than overwriting; show a `‹ 2/3 ›` branch picker on the message | Earlier answers stay recoverable. assistant-ui `BranchPickerPrimitive` and Shape of AI *Branches* both use this [V] | Single-shot tools (e.g. "rewrite this field"), where replacing in place plus undo is clearer |
| Edit a sent message | Edit in place, then resend, which forks the thread from that point (same branch picker) | Same model as ChatGPT and Claude [M] | – |
| Message actions | Assistant messages get Copy, Retry, 👍/👎 (optional reason) and a "more" menu. Actions show on hover/focus on desktop and are always visible on the latest message and on touch | Apple HIG: feedback is *"voluntary… doesn't interrupt"*. Hover-only actions fail on touch and for keyboard users [V] | Dense agent logs, where you move actions into the overflow menu |
| Composer keys | Enter sends and Shift+Enter adds a newline. **Never send while composing in an IME**: check `e.nativeEvent.isComposing \|\| e.keyCode === 229` | Safari fires keydown after `compositionend`, so CJK users send half-typed text unless you guard both checks [M, well known] | Long-form or mobile composers, where Enter is a newline and send is ⌘/Ctrl+Enter or a button |
| Typing while busy | Allow typing during a stream; on send, **queue** the message (show it as queued, editable and cancellable) rather than blocking input | Users steer mid-run. Claude Code and Cursor queue follow-ups [M]. assistant-ui has a `QueueItemPrimitive` [V] | Simple FAQ bots, where you disable send while streaming |
| Attachments | Chips with thumbnail, name, size and remove; validate type and size **before** send; show per-file upload progress; after send, show what was attached on the user turn | Shape of AI *Attachments* [V]. Errors after send waste a turn | – |
| Live regions | Transcript is `role="log"` **without** reading the stream: set `aria-busy="true"` on the streaming message, then announce once through a separate polite region ("Response complete" plus a short summary or the first sentence). Move focus nowhere; return it to the composer after send or stop | Token-by-token updates flood screen readers. `aria-busy` support varies between readers [V, MDN], so test with NVDA and VoiceOver | Voice or audio-first interfaces |
| Network drop | Keep the partial answer, show an inline error with **Retry**, and resume the stream if the server supports it (`resumeStream`) | The AI SDK supports resumable streams [V, d.ts]. The Vercel Chatbot template documents them [V] | – |
| Long threads | Throttle renders, memoise finished messages, and virtualise only past ~200 messages (anchoring plus virtualisation is fragile) | [M]. Measure in the benchmark | – |

---

## E2. Agent workflows

### Topics the guide must answer
1. Plan display: when the plan is advisory (shown) vs contractual (needs approval), and how an editable plan looks.
2. Step and tool-call logs: the default disclosure level, how running/done/failed steps look, and when to auto-expand.
3. Progress for long runs: elapsed time, step counts, ETA honesty, and a todo list that ticks off.
4. Interrupt, pause and redirect: stop vs steer vs queue, and what happens to work in flight.
5. Parallel tasks and subagents: lanes, cards or a list; how to show which agent is doing what.
6. Background agents: leaving and coming back, notifications (done / needs input / failed), and the summary on return.
7. Takeover and handoff: when the human drives (browser takeover, "handle it myself").
8. Context and cost meters: tokens, context window and spend; when to show them at all.
9. Final report: what changed, links to artefacts, what was **not** done.

### Recommended defaults
| Topic | Default | Why (source) | Depart when |
|---|---|---|---|
| Plan | For expensive or multi-step runs, show a short **plain-language step list with Proceed / Edit plan / Handle it myself** before acting. For cheap runs the plan is advisory and lives in the log | Shape of AI *Action plan* (advisory vs contractual): *"The right time to stop an erroneous run is before it begins"* [V]. Smashing *Intent Preview*: three paths, and it is *"non-negotiable"* for irreversible, financial or sharing actions [V] | Users have opted into an autonomous mode for this task type (the autonomy dial, E3) |
| Plan wording | Outcomes, not API calls: "Cancel flight AA123", not `cancel_booking(id)` | Smashing [V]. HAX G1/G2: make clear what the system will do [M] | Developer tools, where showing the command *as well* helps |
| Todo list | Pin the plan as a checklist that ticks live (pending, running with a spinner, done ✓, failed !), above or beside the log | Claude Code TodoWrite, Cursor and ChatGPT agent all converge on this [M]. shadcn AI *Plan*/*Task*/*Queue* patterns [V] | Runs of only one or two steps |
| Step / tool log | **Collapsed by default**: one line per step with an icon, verb, object and duration ("Read `auth.ts` · 0.2 s"). Auto-expand the **running** step and any **failed** step; group repeated reads ("Read 12 files") | Shape of AI *Stream of Thought*: *"bounded box, details minimized"* [V]. Errors must be seen without hunting [M] | Debug or "verbose" mode; agent-builder products |
| Tool call detail | Expanded view shows input (pretty JSON or the command), output (truncated with "show all") and status. Secrets are redacted | AI SDK tool parts expose `input-streaming → input-available → output-available/error` [V]. Render each state | – |
| Progress | Show **elapsed time plus steps done/total** (if a plan exists) and the current activity line. **No fake % bars**; give an ETA only from real history | NN/g progress indicators: percent-done only when you can compute it [M]. Apple: specific status beats "Processing" [V] | Deterministic pipelines (e.g. "indexing 340/1,200 files"), where a percentage is fine |
| Interrupt | Two controls: **Stop** (halts after the current step; in-flight tool calls finish or are cancelled, and the UI says which) and **Steer** (type to queue an instruction the agent picks up at the next step). Esc = stop | Claude Code: "Esc to interrupt" plus queued messages; Cursor queues follow-ups [M]. Stopping mid-write can corrupt state, so say what happened | Agents with transactional tools, where a hard cancel is safe |
| Parallel / subagents | A list of task cards (title, status, elapsed, last activity) with the active one expanded. Subagents nest under their parent step, collapsed | Claude Code Desktop parallel sessions, Cursor Agents window and Codex task list [D/M]. shadcn AI *Subagent* [V] | One agent at a time: a single log |
| Background runs | Allow "run in background"; send a system or in-app notification **only** for *done*, *needs input* and *failed*; show a badge on the task list. On return, show a summary first, then the log | Interruptions should be rare and actionable (HAX G18 *notify about changes*) [M]. Claude Code hooks for notifications [D] | Short runs (< ~30 s): stay inline |
| Takeover | For browser or computer agents, a visible **"Take over"** button that pauses the agent, plus a clear "You're in control / Hand back" state | ChatGPT agent and Manus pattern [M]. NN/g Qwen study: *"Prioritize transparency to protect autonomy"* [V] | Headless agents |
| Context / cost | Hidden by default; show a small meter when > ~70 % of context is used or when the user is paying per run, and warn before an expensive step | shadcn AI *Context* pattern; Claude Code `/context` [V/D]. Shape of AI *Cost estimates* [V] | Developer and power-user tools: always visible |
| Final report | Ends with: what changed (links), what was verified (tests run), what's left or skipped, and next actions. Diffs link into E3 review | Smashing *Explainable Rationale*: "Because you said X, I did Y" [V] | Chat Q&A without side effects |

---

## E3. Human review and approvals

### Topics the guide must answer
1. Approval prompt anatomy: what, why, scope, risk and the choices (once, always, deny with feedback).
2. Permission modes and the autonomy dial: which modes, how the current mode stays visible, and how users switch.
3. Risk tiers: which actions never ask, which ask, and which always ask whatever the mode.
4. Diff review: per-file and per-hunk accept/reject, review all, keyboard flow, partial apply.
5. Irreversible-action guards: confirmations that actually make people read.
6. Undo and checkpoints: what can be rolled back, what can't, and saying so.
7. Approval fatigue: batching, allowlists, classifiers, "don't ask again for X".
8. Asynchronous approvals: approving from a notification or phone; timeouts.
9. Audit of approvals (who allowed what), shared with E4.

### Recommended defaults
| Topic | Default | Why (source) | Depart when |
|---|---|---|---|
| Prompt anatomy | Inline in the transcript, not a modal. Show the action in plain words plus the exact command or target, why it's needed and its scope. Buttons: **Allow once**, **Always allow `<narrow scope>`**, **Deny**, plus a field for "Tell it what to do instead" | Claude Code's prompt pattern (Yes / Yes and don't ask again for … / No and tell Claude what to do differently) [M]. Denial with feedback keeps the run useful. The AI SDK returns denial to the model as `output-denied` [V] | Truly blocking, system-level actions (OS permissions): use a modal |
| "Always allow" scope | Scope to the narrowest pattern (this command prefix, this domain, this folder) and **show it in the button label**. Make rules reviewable and revocable in settings | Cursor Allowlist and Claude Code permission rules [D] | – |
| Permission modes | 3–4 named modes as an **always-visible chip** next to the composer (e.g. *Ask* → *Auto-edit* → *Plan* → *Auto*), cycled with a shortcut. Start in a safe mode; persist per project | Claude Code: `default` (Manual) / `acceptEdits` / `plan` / `auto` / `dontAsk` / `bypassPermissions`, switched with Shift+Tab [D]. Cursor run modes: Auto-review / Allowlist / Run Everything [D]. Smashing *Autonomy Dial*: Observe & Suggest / Plan & Propose / Act with Confirmation / Act Autonomously, *"ideally on a per-task-type basis"* [V] | Consumer agents, where two states (Ask first / Act for me) are enough |
| Always-ask floor | Some actions ask **in every mode**: deletes outside the workspace, payments, sending messages or email as the user, publishing, credential use | Claude Code lists *"Actions no mode auto-approves"* [D]. Apple HIG: *"Avoid automating destructive actions… ask for confirmation before performing a significant action"* [V] | Sandboxed or throwaway environments (containers), explicitly labelled as such |
| Classifier auto-approval | If you auto-approve with a classifier, say so in the mode name. Log every auto-decision and show blocked calls with the reason | Claude Code auto mode and Cursor Auto-review both use a second-model classifier [D] | – |
| Diff layout | **Unified** by default in chat or narrow panes; **split** toggle for wide screens. Collapse unchanged context to 3 lines with "expand" | Familiar from GitHub. Split is unreadable below ~900 px [M] | Prose or doc edits: inline word-diff (redline) rather than line diff |
| Per-hunk control | Each hunk has **Accept / Reject**; each file has Accept all / Reject all; one global "Review N changes" bar with keyboard next/prev hunk. Rejected hunks are fed back to the agent | Cursor's in-editor Keep/Undo per change and "Review" flow [M]. GitHub's per-file "Viewed" checkbox [M]. Build with jsdiff `structuredPatch` → choose hunks → `applyPatch` | Small single-hunk edits: a single Apply / Discard |
| Irreversible guard | A confirm step that **names the consequence and the object** ("Delete 3 branches: a, b, c. This can't be undone"). The destructive button gets a verb label, isn't the default focus and has no Enter-to-confirm. Type-to-confirm only for mass or catastrophic actions | Smashing: time-limited undo windows must be stated (*"Undo available for 15 minutes"*) [V]. Over-used typed confirms train people to stop reading [M] | Actions that are reversible: undo beats confirm |
| Undo / checkpoints | Auto-checkpoint before each agent turn; "Restore" on any prior user message, with a choice of code, conversation or both. **Say what checkpoints don't cover** (shell side effects, external APIs, sent email) | Claude Code `/rewind`: *Restore code and conversation / conversation / code*. *"Checkpointing does not track files modified by Bash commands"* [D] | – |
| Action audit + undo | A timeline of agent actions, each with status and Undo where possible | Smashing *Action Audit & Undo*: *"the ultimate safety net"* [V] | – |
| Async approvals | A pending approval shows on the task card and in a notification with Approve/Deny. The run waits (with a visible "waiting for you" state); no silent timeouts | [M]. The AI SDK keeps approval state in message parts, so it survives reloads [V, docs] | – |

---

## E4. Trust and provenance

### Topics the guide must answer
1. Citations: inline markers vs footnotes vs a sources panel; hover previews; deep links to the passage.
2. AI disclosure and labelling: when it's needed (the EU AI Act Art. 50 is live), where it goes and the wording; labelling AI content in mixed human/AI documents.
3. Confidence and uncertainty: whether to show it, how, and alternatives to percentages.
4. Model and version labels: per message or per chat; showing model switches and fallbacks.
5. Audit trails: what gets logged for agents (actions, approvals, sources), and export.
6. Data use and memory disclosure: what the AI used (files, memory, connectors) and controls.
7. Machine-readable provenance for generated media (C2PA / watermarks).
8. Failure honesty: "I couldn't find…", refusals, and caveats that are specific rather than boilerplate.

### Recommended defaults
| Topic | Default | Why (source) | Depart when |
|---|---|---|---|
| Citations | **Inline numbered chips after the claim** (favicon + short domain), with a hover/focus card showing title, site, date and the **quoted passage**. A "Sources" list at the end of the answer. Deep-link to the passage (PDF page, transcript time, or a `#:~:text=` fragment on the web) | Shape of AI *Citations*: *"deep link to the relevant part of the source or pull quotes up… such as when hovering"*; it also warns that citations lend unearned authority [V] | Long research reports: add a side panel of sources with filters. Single-source answers: one "From: X" line |
| Citation honesty | Distinguish **user-provided sources** from **retrieved** ones; never render a citation the system didn't retrieve | Shape of AI *Disclosure*: separate *"content they have uploaded or referenced from sources that the bot captures"* [V] | – |
| AI disclosure (chat) | A persistent identity in the header or welcome ("AI assistant") **before or at the first message**, plus an accessible name. Don't use human names or avatars that imply a person | EU AI Act Art. 50(1) applies unless it's *"obvious… to a reasonably well-informed"* person; Art. 50(5) requires it *"at the latest at the time of the first interaction"* and accessible [V]. Apple: *"Never trick someone into thinking they're interacting with… a human"* [V] | AI-native tools where AI is self-evident (Shape of AI notes this) [V]. Still keep the header label: it's cheap |
| AI content in mixed docs | A small **"AI" label** on generated blocks or fields that opens a popover explaining what was generated, from what, and the model. It persists until a human edits or accepts | IBM Carbon for AI: the *AI label* is *"the primary indicator… and how users can access explainability content"* [V] | Text that's obviously the AI's chat reply |
| Public-interest text / deepfakes | If our product publishes AI-generated text on matters of public interest without human editorial review, or realistic synthetic media, show a visible label. Providers of generators must also embed machine-readable marks (grace period to Dec 2026 for systems already on the market) | EC Art. 50 fact page and the June 2026 Code of Practice [V] | Human-reviewed or edited text is exempt from the text-label duty [V] |
| Confidence | **Don't show LLM-generated percentages.** Prefer (a) categorical states tied to an action ("Verified in 3 sources" / "Single source" / "Not found, so this is the model's own knowledge"), (b) N-best alternatives, (c) highlighting unsupported sentences | PAIR: numeric confidence is *"risky because [it] presume[s] users have a good baseline understanding of probability"*. Categories should say *"what action a user should take"* [V]. Verbalised LLM confidence *"tend[s] to be overconfident"* (arXiv 2306.13063) [V] | Calibrated classifier scores (fraud, OCR), where a percentage plus explanation is fine |
| Caveats | Specific, local caveats ("Prices may have changed since 12 Oct") over a global "AI can make mistakes" footer. Keep one short global footer for the legal minimum | Shape of AI *Caveat*: *"Assume they will be ignored"* [V]. Apple asks you to communicate that content may contain errors [V] | – |
| Model label | Show the model in the composer picker; show it **per message** in the message's metadata (hover/info) and **inline when it changed** (fallback or the user switched mid-thread) | Users compare answers across models, and silent fallbacks break trust [M]. Shape of AI *Model management* [V] | Consumer single-model products: settings only |
| Audit trail | For agents, a persistent per-run log: prompt, plan, every tool call (inputs, outputs, status), approvals (who, when, scope), model and version, sources, and final diff. Exportable (JSON/Markdown) and linkable | Smashing *Action Audit*; Shape of AI *Footprints* [V]. Enterprise review needs it [M] | – |
| Memory and data use | Show when memory or connectors were used ("Used 2 memories · Google Drive") with a link to view or forget | Apple: *"Clearly disclose how your app and its model use and store personal information"* [V]. Shape of AI *Memory*, *Data ownership* [V] | – |
| Generated media | Embed C2PA Content Credentials where the generator supports it, and show a "CR"/AI badge on media with an inspect link | Matches the Art. 50(2) machine-readable marking intent [V]. Verify tool: contentcredentials.org/verify [V 200] | – |

---

## E5. Generative UI (brief)
**Questions:** when a tool result should be a component rather than text; inline card vs side panel (artifact or canvas) vs fullscreen;
how to stream partial component props; how to sandbox model-authored code; how users edit or iterate on a generated artefact; versioning.
**Defaults:** (1) Map **typed tool parts to our own components** (`message.parts` with `tool-<name>` states in the AI SDK) instead of letting
the model author markup. (2) Inline cards for a single decision or a small amount of data, **at most two primary actions** (OpenAI Apps SDK guidelines: *"Primary actions: Limit to two"* [V]).
Rich or iterative work goes in a side panel with version history. (3) Model-authored HTML or JS only in a sandboxed iframe (assistant-ui depends on
`safe-content-frame`; MCP Apps renders in iframes [V]). (4) **Don't build on AI SDK RSC**: its docs say *"AI SDK RSC is marked as experimental, and we do not recommend
using it for stable production environments"* [V]. Protocols to watch: MCP Apps (`@modelcontextprotocol/ext-apps` 2.0.3), A2UI (`@a2ui/react` 0.14.0),
json-render (`@json-render/react` 0.21.1), AG-UI (`@ag-ui/core` 1.0.3).

---

## Tools (npm checked 2026-10-17 [V])
| Package | Version | Licence | Modified | Best at | React/Next fit and flags | Mock stream, no key? |
|---|---|---|---|---|---|---|
| `ai` | 7.0.143 | Apache-2.0 | 2026-10-16 | Stream protocol, agents (`ToolLoopAgent`), tool approval, resumable streams, `smoothStream` | The de facto standard; framework-agnostic core | **Yes.** `ai/test` `MockLanguageModelV4`, `simulateReadableStream`, `DirectChatTransport` (in-process) |
| `@ai-sdk/react` | 4.0.147 | Apache-2.0 | 2026-10-16 | `useChat`: messages/parts, `stop`, `regenerate`, `resumeStream`, `addToolApprovalResponse`, `addToolOutput`, `throttle` | Headless, no styling. **Our base layer** | Yes (as above) |
| `@assistant-ui/react` | 0.15.29 | MIT | 2026-10-15 | Unstyled, accessible primitives: Thread, Composer, ActionBar, BranchPicker, ChainOfThought, Attachment, Queue, Error | Primitives fit Tailwind without shadcn. **Its styled components come via the shadcn registry** (Radix/Base UI flavours), so we'd style the primitives ourselves. Deps include zustand, radix-ui and `assistant-cloud` (an optional paid cloud) | Yes. `useLocalRuntime` with a custom `ChatModelAdapter` (async generator); `@assistant-ui/react-ai-sdk` 1.4.18 adapter |
| `@copilotkit/react-core` / `react-ui` | 1.79.1 / 1.79.1 | MIT (repo LICENSE MIT [V]) | 2026-10-16 | In-app copilots, shared state, frontend actions, human-in-the-loop over **AG-UI** | Heavy: react-core pulls lit, rxjs, katex, streamdown 1.x, use-stick-to-bottom, Radix and tw-animate-css; react-ui pulls headlessui and react-syntax-highlighter. **Flags:** `@scarf/scarf` install analytics dependency (opt out with `SCARF_ANALYTICS=false` [M]); paid "CopilotKit Intelligence/Cloud" upsell; uses shadcn-style tokens | Possible via a custom AG-UI agent, but needs a `CopilotRuntime` endpoint [M]. More setup than the others |
| `@llamaindex/chat-ui` | 0.6.1 | MIT | 2026-06-05 | A full chat section with doc/PDF viewers, canvas, citations | **Distributed as a shadcn registry** (`npx shadcn add …/chat.json`), react-markdown **8** (old), highlight.js, mdxeditor and CodeMirror. Heavy and older-looking. 4 months without a release | Yes. Takes any `useChat`-compatible handler |
| `streamdown` | 2.7.0 | Apache-2.0 | 2026-09-30 | Streaming-safe markdown (remend), Shiki code plugin, KaTeX, Mermaid, CJK, `rehype-harden` sanitising, caret/animation | A drop-in for react-markdown. **Flags:** needs a Tailwind `@source` line and shadcn-style CSS vars (~11 tokens) [D] | Yes. It just takes a string |
| `remend` | 1.4.0 | Apache-2.0 | 2026-09-30 | The self-healing preprocessor on its own | Use with react-markdown or marked if we skip Streamdown | Yes [V probe] |
| `use-stick-to-bottom` | 1.1.6 | MIT | 2026-06-04 | Zero-dependency stick-to-bottom with spring scrolling, ResizeObserver, user-scroll escape; no reliance on `overflow-anchor` (unsupported in Safari) | Small, widely adopted (CopilotKit and old AI Elements use it). Implements the *follow* model, not turn anchoring | n/a |
| `@shadcn/react` | 0.3.1 | MIT | 2026-08-31 | Headless `MessageScroller`: turn anchoring, follow-while-at-edge, history prepend without jumps, jump to message | Unstyled, so usable **without** shadcn. Young (0.x) | n/a |
| `react-markdown` (+ `remark-gfm` 4.0.1) | 10.1.0 | MIT | 2025-03-07 | Safe, AST-based markdown | Stable but slow-moving. Needs remend for streaming | n/a |
| `shiki` / `react-shiki` | 4.5.0 / 0.11.2 | MIT / MIT | 2026-10-01 / 2026-10-06 | Accurate TextMate highlighting, themes matching VS Code | Heavy (grammars and WASM). Load lazily and highlight on block close | n/a |
| `@pierre/diffs` | 1.5.2 | Apache-2.0 | 2026-10-10 | Shiki-based diff and file rendering, split/unified, **line annotations** (comment and action slots), merge-conflict "Accept current/incoming/both" UI, SSR and worker entry points, edit mode (beta) | React entry `@pierre/diffs/react`. The best-looking option and the closest to "agent review" UI | n/a |
| `@git-diff-view/react` | 0.1.8 | MIT | 2026-10-15 | Split/unified, **widget system** per line, extend data, SSR/RSC | Uses highlight.js/lowlight. Still 0.x | n/a |
| `react-diff-view` | 3.3.3 | MIT | 2026-03-30 | Renders unified git diffs, hunk widgets, tokenisation | Mature but dated. Lodash and older deps | n/a |
| `diff2html` | 3.4.56 | MIT | 2026-01-31 | Static HTML from a unified diff | Not React. Fine for read-only reports | n/a |
| `@monaco-editor/react` (diff editor) | 4.7.0 | MIT | 2025-11-21 | A real editor diff (VS Code feel) | Loads Monaco (multi-MB) from a CDN by default. Only worth it if we already ship an editor. **Has no per-hunk accept** built in | n/a |
| `@codemirror/merge` | 6.12.2 | MIT | 2026-06-09 | Lighter editor merge view, with chunk accept/revert controls in unified mode [M] | Good if we use CodeMirror | n/a |
| `diff` (jsdiff) | 9.0.0 | BSD-3-Clause | 2026-04-13 | `structuredPatch` / `applyPatch`: the **engine for per-hunk accept/reject** | Pure JS | n/a |
| `ai-elements` (CLI) | 1.9.1 | Apache-2.0 | 2026-10-14 | A CLI that copies shadcn components ("built on top of shadcn/ui") | **Being deprecated end of Nov 2026** in favour of ui.shadcn.com/docs/ai-elements [V]. Read the source for patterns; don't adopt | n/a |
| `@openai/chatkit-react` | 1.6.1 | MIT | 2026-08-13 | OpenAI's hosted chat web component | The npm `@openai/chatkit` is **types only** [V]; the runtime is a script loaded from OpenAI [M]. Vendor-tied, so **exclude** | No |
| `@tambo-ai/react` | 1.4.0 | MIT | 2026-10-08 | Generative UI: register components and the model picks them | Tied to the Tambo backend/cloud by default [M] | Unverified |
| `@chatscope/chat-ui-kit-react` | 2.1.1 | MIT | 2025-05-15 | Classic human chat UI kit | Not streaming-aware, stale. Skip | – |
| `@nlux/react` | 2.17.1 | **MPL-2.0** | 2024-08-15 | – | Stale (2024), and the licence is weak copyleft. Skip | – |

**Suggested stack:** `@ai-sdk/react` (state and transport) + `@assistant-ui/react` primitives **or** our own components, styled in
Tailwind + `streamdown` (or react-markdown + remend) + `@shadcn/react` MessageScroller (turn anchoring) **or** `use-stick-to-bottom`
(follow) + `@pierre/diffs` + `diff` for review. The benchmark should decide primitives vs our own components and MessageScroller vs stick-to-bottom.

**Benchmark harness tip:** one mock stream that every library consumes. Build it with `simulateReadableStream` from
`ai` with fixed chunk timings, and include a markdown table, a mid-stream code fence, a link split across chunks, a 2 s pause (thinking), a tool call needing approval
and a 4,000-token answer (scroll test).

---

## Public reference pages (no login; `curl -sL -A "Mozilla/5.0"` status recorded 2026-10-17)
| # | URL | Code | The moment | Suggested capture |
|---|---|---|---|---|
| 1 | https://chatbot.ai-sdk.dev/demo | 307 → guest cookie → **200** ("Next.js Chatbot Template") | Vercel's reference chatbot with a guest session: streaming, reasoning, model picker, artefact side panel, tool approval (Allow/Deny per the docs) | Video: send → first token → stream → stop; screenshot of the artefact panel; the tool approval card if it can be triggered (unverified in the demo) |
| 2 | https://ui.shadcn.com/docs/components/message-scroller | 200 | A live read-only demo of **turn anchoring** plus the best written spec of chat scroll behaviour | Screen recording of send → anchored turn → "jump to latest"; quote the guide's checklist |
| 3 | https://ui.shadcn.com/docs/ai-elements | 200 | Component previews for Plan, Tool, Confirmation, Checkpoint, Inline Citation, Reasoning, Queue, Subagent, Context | One screenshot per pattern (light and dark) as E2/E3/E4 visual references, not code |
| 4 | https://www.assistant-ui.com/examples (/chatgpt, /claude, /perplexity, /artifacts, /generative-ui) | 200 | Clones of the major products on open primitives: branch picker, action bar, attachments, artefacts | Screenshot of the branch picker and edit-message flow; an artefacts example (whether replies are live is unverified) |
| 5 | https://streamdown.ai/playground | 200 | Partial markdown rendered as it streams (code, tables, math, Mermaid) | Recording at slow speed showing no flicker on `**`, tables and code fences |
| 6 | https://www.shapeof.ai/patterns/citations · /stream-of-thought · /action-plan · /disclosure · /branches · /verification · /footprints | 200 each | A curated pattern taxonomy with real product examples per pattern (CC-BY-NC-SA: link and quote, don't copy images) | Link from guide sections; capture the example galleries for citations and stream-of-thought |
| 7 | https://diffs.com/ | 200 | Agent-style diff review UI: collapsed unchanged lines, annotations, a merge conflict "Accept current / incoming / both" bar | Screenshot of the merge-conflict and annotation examples as the per-hunk control reference |
| 8 | https://www.perplexity.ai/discover | 200 (SPA, no Cloudflare challenge seen; content is rendered by JS) | Public articles with inline citation chips, source cards and hover previews | Headless capture of one Discover article: an inline chip hover card and the source list. SPA soft 404s also return 200, so confirm visually |
| 9 | https://www.google.com/search?q=…&udm=50 (AI Mode) | 200 (may show a consent wall in the EU or headless) | Answer with a right-hand source panel and inline link chips | Capture from a real browser; note the region |
| 10 | https://contentcredentials.org/verify | 200 | C2PA provenance inspection: what an "AI-generated" credential shows | Screenshot after dropping in an AI image with credentials |
| also | https://v0.app/community (200), https://huggingface.co/chat/ (200, open-source chat-ui; sending may need login [unverified]), https://consensus.app/ (200, evidence/"consensus meter"), https://code.claude.com/docs/en/permission-modes and /checkpointing (200), https://cursor.com/docs/agent/security/run-modes (200) | | Docs pages give mode tables and wording, not visuals | Use as citation sources |

**Blocked from this sandbox:** github.com (403 on every page via the proxy, so probably reachable in a normal browser: public PR "Files changed" with the
per-file *Viewed* checkbox and suggested-change "Commit suggestion" is the canonical E3 reference); microsoft.com HAX toolkit (403 bot block, so
cite the guidelines from the CHI 2019 paper); openai.com announcement pages (403, Cloudflare); chatgpt.com and claude.ai (403); deepwiki.com
(429 rate limit; DeepWiki's code-cited answers are a strong E4 reference if reachable); lovable.dev (403). **Public share links**: we didn't
find stable public ChatGPT, Claude or Perplexity share links by search. Ask a user to create share links from their own chats (that's the
lowest-risk way to get public captures of real products).

## Logged-in products: screens to capture (for a user with accounts)
| Product | Exact screens |
|---|---|
| **Claude (claude.ai)** | (1) A reply with a collapsed "Thought for Ns" block, then expanded; (2) edit a sent message, then the `‹ 1/2 ›` branch arrows; (3) Research mode: progress and the final report with inline citations, a citation hover and the sources list; (4) Artifact side panel with version switcher; (5) a connector/tool permission prompt (Allow once / Always allow); (6) a share-link page |
| **ChatGPT** | (1) Send button turning into Stop mid-stream; (2) "Thinking" with live summary lines; (3) **agent mode**: task checklist, virtual browser, **"Take over"**, the confirmation before a consequential action; (4) Deep research progress/activity panel with sources; (5) Canvas with "Show changes"; (6) the "Memory updated" chip; (7) citation pills and hover; (8) a model name in the regenerate/"Try again" menu |
| **Cursor** | (1) Plan mode plan file before building; (2) agent todo list ticking; (3) collapsed tool-call rows and one expanded terminal call; (4) the run-mode approval for a terminal command (Run / Skip / Add to allowlist); (5) in-editor per-change **Keep/Undo** and the "Review changes" bar; (6) "Restore checkpoint" on an earlier message; (7) the Agents window with parallel/cloud agents and their status |
| **Claude Code (CLI + Desktop)** | (1) Permission prompt with the three options; (2) the mode indicator after Shift+Tab cycling, including auto mode; (3) the todo list; (4) the `/rewind` menu with Restore code / conversation / both; (5) Desktop: the parallel sessions sidebar, the visual diff review and a needs-input notification |
| **v0** | Prompt, then thinking/steps, code + preview split, version history and restore, and the "Fix with v0" error flow |
| **Devin** | Session timeline/planner, the "Devin's machine" tabs (shell / browser / editor), progress, a Slack notification, and the PR handoff |
| **OpenAI Codex (cloud) / GitHub Copilot coding agent** | The task list with parallel tasks, a per-task log, the diff with "Create PR"; Copilot's "View session" log linked from a PR |
| **Gemini Deep Research** | The **editable research plan** (Edit plan / Start research) before the run, which is the clearest contractual-plan example [M] |
| **Elicit** | Results table with a **supporting quote per cell** (the best E4 claim-to-source example) |
| **Notion AI / Google Docs Gemini** | AI-generated block labelling in a mixed document; the undo/change summary after an AI edit |
| **Manus** | The agent "computer" view and session replay |

---

## Disagreements with `research/categories.md` (layer E)
1. **E1 tools are incomplete.** "Vercel AI SDK (UI), assistant-ui" is right, but the guide's real decisions are about **infrastructure**: Streamdown/remend
   (streaming markdown) and MessageScroller vs use-stick-to-bottom (scroll model). Also note that assistant-ui's *styled* layer is shadcn and only its primitives fit us.
2. **E2 "(patterns)" undersells the tools.** There are now reusable sources: the shadcn AI patterns (Plan, Task, Tool, Queue, Subagent, Context), assistant-ui
   ChainOfThought/Queue primitives, the AI SDK tool-part state machine and the AG-UI event protocol. Score them as sources even if we only read them.
3. **E3 tools:** swap `react-diff-view` (dated) for **`@pierre/diffs`** (primary) and **`@git-diff-view/react`**, keep jsdiff as the engine, and demote Monaco
   diff to "only if you already ship an editor". **"Claude artifacts" isn't an E3 reference** (it's E5). Use Claude Code `/rewind`, Cursor review, GitHub PR review and Codex.
4. **E4 references:** Notion AI is weak for provenance. Use **Perplexity, Elicit (cell-level quotes), Google AI Mode, NotebookLM, IBM Carbon for AI (AI label)**,
   plus **DeepWiki** for code citations. E4 is now partly **compliance** (Art. 50 has applied since 2 Aug 2026), so the guide needs a short legal box and
   should merge with **A9's "AI disclosure wording"**, which is the same topic.
5. **E5 tools:** "Vercel AI SDK RSC" should go. Its own docs say *"we do not recommend using it for stable production"*. Use AI SDK UI typed tool parts.
   Add the protocols (MCP Apps, A2UI, AG-UI, json-render). CopilotKit stays an option (MIT) but carries a heavy dependency tree and a telemetry flag.
6. **A missing category: inline AI in ordinary screens** (ghost-text autocomplete, rewrite-in-place with Accept/Reject, AI fill for forms, ⌘K "edit
   with AI"). Most product briefs need this rather than a chat window. Suggest **E6 Inline AI assist, P1** (references: Cursor Tab, Notion AI, Linear, Gmail).
   Voice/realtime could be a P3 E7.
7. **Merge E3 and the agent part of E4 into one guide, "oversight"** (approvals, checkpoints, audit). They share components (timeline, diff, approval card),
   and the E2/E3 split will otherwise duplicate the tool-call card.
8. **Taxonomy gap:** `taxonomy.md` has no AI terms. Before capturing entries, add pattern terms `chat`, `agent-activity`, `approval`, `citation` and
   `generative-ui` (each will easily get 3+ entries), plus tags `streaming` and `ai-label`.
9. **Smashing's agentic article (Feb 2026) recommends a "Confidence: 95%" score.** We shouldn't adopt that for LLM output (PAIR plus the calibration research in E4).
   Its metric targets (plan acceptance > 85 %, override > 10 % triggers review) are self-described *"representative benchmarks"*, not research. Don't quote them as norms.

## Sources
- Google PAIR Guidebook: https://pair.withgoogle.com/guidebook/ ; Explainability + Trust: https://pair.withgoogle.com/chapter/explainability-trust/ [V]
- Microsoft HAX Guidelines for Human-AI Interaction: https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/ (403 to curl; G-numbers from memory [M])
- Apple HIG Generative AI: https://developer.apple.com/design/human-interface-guidelines/generative-ai (text via the HIG JSON endpoint) [V]
- Shape of AI (Emily Campbell, CC-BY-NC-SA): https://www.shapeof.ai/ [V]
- IBM Carbon for AI (updated 12 Aug 2026): https://carbondesignsystem.com/guidelines/carbon-for-ai/ [V]
- NN/g: 10 Guidelines for Site AI Chatbots (guideline 7, autoscroll): https://www.nngroup.com/articles/ai-chatbots-design-guidelines/ ; Designing AI Agents (Qwen): https://www.nngroup.com/articles/designing-ai-agents/ ; Explainable AI in chat: https://www.nngroup.com/articles/explainable-ai/ ; Response times: https://www.nngroup.com/articles/response-times-3-important-limits/ [V]
- Smashing (Victor Yocco), Designing for Agentic AI, Feb 2026: https://www.smashingmagazine.com/2026/02/designing-agentic-ai-practical-ux-patterns/ ; Beyond Generative, Jan 2026: https://www.smashingmagazine.com/2026/01/beyond-generative-rise-agentic-ai-user-centric-design/ [V]
- shadcn Message Scroller guide: https://ui.shadcn.com/docs/components/message-scroller ; AI Elements: https://ui.shadcn.com/docs/ai-elements ; deprecation banner: https://ai-sdk.dev/elements [V]
- AI SDK docs: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot , https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-tool-usage ; Chatbot template tool approval: https://chatbot.ai-sdk.dev/docs/customization/tool-approval [V]
- Streamdown README: https://github.com/vercel/streamdown (packages/streamdown/README.md) ; use-stick-to-bottom README [V]
- Claude Code docs: https://code.claude.com/docs/en/permission-modes , https://code.claude.com/docs/en/checkpointing [D]
- Cursor docs: https://cursor.com/docs/agent/security/run-modes , https://cursor.com/docs/agent/agent-review [D]
- OpenAI Apps SDK design guidelines: https://developers.openai.com/apps-sdk/concepts/design-guidelines [V]
- EU AI Act Art. 50 text: https://artificialintelligenceact.eu/article/50/ ; EC fact page: https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems [V]
- Xiong et al., *Can LLMs Express Their Uncertainty?* (ICLR 2024): https://arxiv.org/abs/2306.13063 [V]
- MDN aria-busy: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-busy [V]
