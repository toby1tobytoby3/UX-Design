# E6. Inline AI assist: research notes

Research for row E6 of `research/categories.md`: AI inside ordinary screens rather than a chat window. Covers ghost-text
autocomplete, rewrite-in-place (Accept / Reject / Retry), AI fill for forms and fields, ⌘K / slash "edit with AI",
inline summaries in lists, and suggested replies. Researched 2026-10-18 for our stack (React/Next + Tailwind, **no shadcn**).
Builds on `guides/agentic-ui.md` (E1–E5) and `research/E-agentic-ui.md`. It doesn't repeat them.

Evidence key (same as E-agentic-ui): **[V]** checked today (npm, curl, page text, package source or a headless Playwright
probe). **[D]** from a vendor's own docs, fetched today. **[M]** from memory or product observation, not re-verified today.

---

## 0. Headline findings
1. **The editor decides most of E6, and the licences split sharply** [V]. Plate's AI plugins are MIT and built on AI SDK v7
   (`@platejs/ai` peers `ai ^7`, `@ai-sdk/react ^4`). Tiptap's AI features need a **paid subscription** (*"AI and some Pro
   extensions need an active subscription for verification"*). BlockNote AI (`@blocknote/xl-ai`) is **`GPL-3.0 OR PROPRIETARY`**
   and is still on AI SDK v6. Novel hasn't shipped since **2025-01-18** and is still on Tiptap 2. CopilotKit's `CopilotTextarea`
   is in the **deprecated v1 SDK** (*"Do not use v1 APIs for new code"*) and pulls in MUI 5, Emotion and Slate.
2. **No maintained headless "ghost text in a plain `<textarea>`" library exists** [V, npm search]. Most of our briefs need
   this case (form fields, comment boxes, descriptions), so we'll build it: AI SDK `useCompletion` plus a mirrored overlay
   (`rich-textarea` MIT, or ~150 lines of our own).
3. **The keyboard model has converged** [V]: **Tab** accepts, **Esc** dismisses (or just keep typing), and **⌘→ / Ctrl+→**
   accepts the next word. GitHub Copilot, Cursor Tab and Plate all use these. Copilot cycles alternatives with **Alt+] / Alt+[**,
   and Plate triggers on demand with **Ctrl+Space**. Rewrite actions converge on **Accept · Discard · Try again**, plus a
   refine field. Plate adds "Insert below"; Tiptap uses "Apply" and *"Tell AI what else needs to be changed…"*; Notion says
   *"accept, discard, or ask it to try again"* [D].
4. **Restraint is now marketed as a feature.** Cursor: *"Our new Tab model makes 21% fewer suggestions while having 28% higher
   accept rate"* [V]. VS Code stops automatic ghost-text requests on metered connections and offers a 5-minute **Snooze** [V].
   Linear's Triage Intelligence suggests properties with an explanation of why, plus Accept / Decline. It auto-applies only
   when an admin opts in per property [V].
5. **The EU AI Act treats inline editing differently from generation** [V]. Art. 50(2) marking *"shall not apply to the extent
   the AI systems perform an assistive function for standard editing or do not substantially alter the input data"*.
   Art. 50(4) exempts text that *"has undergone a process of human review or editorial control"*. So, after the user accepts,
   **text in a prose editor doesn't need a permanent AI label**. AI-filled *fields* awaiting confirmation do need one.
6. **Two public demos can be captured headlessly with no key or login** [V]. On platejs.org the Copilot and AI menu fall back
   to mocked lorem text when `/api/ai/*` returns 404. That shows ghost text, the **inline red/green diff**, and Accept / Discard /
   Insert below / Try again. Tiptap's Notion-like template calls a real model without login. BlockNote's example gives a clean
   **failure state** ("Oops! Something went wrong" · Retry · Cancel).

---

## 1. Topics the guide must answer
1. **When inline beats chat** (and when to hand off to chat): scope, where the output goes, and how many steps.
2. **Ghost text:** look, trigger conditions, debounce and latency budget, accept (all / word / line), dismiss, alternatives,
   stale-suggestion handling, and a global off switch or snooze.
3. **Rewrite a selection in place:** the entry points (selection toolbar, ⌘K/⌘J, `/ai`, space on an empty line), the preset
   actions, and how the result is shown (inline diff, replacement preview, or side-by-side).
4. **Accept / Discard / Try again / Undo:** keeping the original recoverable, undo granularity, and refining ("make it shorter").
5. **Streaming into a field or document:** a preview layer vs direct writes, locking the range, Stop, and partial structured output.
6. **AI fill for forms** ("Generate description", smart defaults, extract-to-fields): never overwrite user input, per-field
   state, explanations, and bulk fills.
7. **Inline summaries and suggested replies** in lists, threads and tables: on-demand vs automatic, scope, staleness, and labels.
8. **Labelling AI-written content:** while it's pending vs after acceptance, and in fields vs prose (link to E4 for disclosure law).
9. **Keyboard model and accessibility:** Tab conflicts in forms, screen-reader announcement of ghost text, contrast, IME composition.
10. **Mobile vs desktop:** no Tab key, OS keyboard predictions, and where the actions go.
11. **Cost, rate limits and privacy:** what triggers a call, cancelling, caching, quotas, what text is sent, and sensitive fields.
12. **Failure states:** a silent miss vs an inline error, offline, refusal, and quota exhausted.

---

## 2. Recommended defaults
| Topic | Default | Why (source) | Depart when |
|---|---|---|---|
| Inline vs chat | Use inline when the user is **already editing an artefact** and the output has **one known destination** (this field, this selection, this row). Offer at most 4–7 preset actions plus one free-text "Ask AI…" field. Hand off to chat (or a side panel) for open questions, multi-step work or cross-document tasks | NN/g: users do "accordion editing" (repeated shrink/expand) and *"still edit their final output outside the AI chatbot"* [V]. Shape of AI *Inline action*: *"Offer concise, high-value defaults… shorten, expand, summarize, or translate. Broader commands belong in side panels"* [V] | The product is AI-native and conversational (agents, research) → E1/E2 |
| Ghost text look | Inline, after the caret, in the field's own font. Muted colour **with ≥ 4.5:1 contrast** (we read it, so it's content), **not selectable** (`contenteditable=false`, `pointer-events:none`). Never hide or overlap the user's text. For multi-line edits that aren't at the caret, show a gutter/margin marker and preview on demand | Copilot: *"suggest… in grayed text"*; Cursor: *"grayed-out text ahead of your cursor"* [V]. Plate renders `<span contenteditable="false" class="pointer-events-none text-muted-foreground/70">` [V probe]. VS Code NES uses a gutter arrow that points up or down when the edit is off-screen [V]. Contrast floor is our call [M] | Code editors already themed for it (follow the editor theme) |
| Ghost text trigger | **Automatic only where continuation is likely**: caret at the end of a block, collapsed selection, and the last char is a space or punctuation. **Debounce 250–400 ms** after the last keystroke. **Abort the in-flight request on every keystroke.** Drop a response that arrives after the prefix changed, unless the typed chars match the ghost text (then consume them). Manual trigger: **Ctrl+Space** | Plate `autoTriggerQuery` requires a trailing space; `triggerQuery` requires cursor at block end; `shouldAbort: true`; docs example `debounceDelay: 500` [V source]. Debounce defaults: CopilotKit 250 ms, codemirror-ai 300 ms, monacopilot 400 ms `onIdle` (120 ms `onTyping`) [V source]. NN/g: 0.1 s feels instant, 1 s keeps flow [V] | Short structured fields (tags, SKU) → instant, non-LLM autocomplete. Long-form prose where people pause to think → 600–800 ms |
| Latency budget | Ghost text is **worth showing only within ~1 s of the pause**. Target p50 < 500 ms using a small, fast model. Return short completions (to the next punctuation mark, ≤ 1 sentence). **No spinner** for ghost text, ever | Plate's prompt: *"Continue the text naturally up to the next punctuation mark"* [V]. A spinner for something unasked is noise [M] | Explicit "Complete" command: show an inline "Writing…" pill |
| Accept / dismiss keys | **Tab** = accept all · **Esc** = dismiss (typing over it also dismisses) · **⌘→ (Mac) / Ctrl+→** = accept next word · **Alt+] / Alt+[** = next/previous alternative (only if you generate several). Blur and mouse-down dismiss. Make Accept remappable | Copilot VS Code: *"Command + →"* / *"Control + →"* next word; *"Alt + ]"* / *"Alt + ["* alternatives [V]. Cursor: Tab / Esc / *"Cmd Ctrl + Arrow Right"* word-by-word [V]. Plate: Tab, Escape, `mod+right`, `ctrl+space`; rejects on blur and mouse-down [V source]. Gmail Smart Compose: *"To accept a suggestion… press Tab"* [V] | Plain web forms: see "Tab in forms" below |
| Tab in forms | **Intercept Tab only while a suggestion is visible.** Otherwise Tab moves focus as normal. After an accept, the next Tab moves focus. Esc dismisses without leaving the field. Never intercept Shift+Tab | WCAG 2.1.2 No Keyboard Trap (focus must be able to leave) [V URL]. Keeps keyboard form-filling intact [M] | Rich editors where Tab indents: accept with Tab, indent with Tab when there's no suggestion (Plate does this) |
| Rewrite entry points | (1) A **selection toolbar button** "✨ Edit with AI" / "Ask AI". (2) **⌘K / Ctrl+K** in plain fields, or **⌘J** where ⌘K is already "insert link" in editors. (3) `/ai` slash item and space on an empty line in block editors. The menu: free-text input on top ("Ask AI anything…"), then 4–7 presets (Improve writing, Fix spelling & grammar, Make shorter, Make longer, Simplify, Change tone ▸, Translate ▸) | Notion: *"highlight the text and select Edit with AI"*, *"press the space key on a new line"* [D]. Plate: ⌘J, "Ask AI" toolbar, right-click, space [V]. BlockNote: "Edit with AI" button + `/ai` [V]. CopilotKit: Cmd+K hovering editor [V]. codemirror-ai: `Mod-k` [V]. Cursor inline edit ⌘K [M] | Single-purpose fields: one inline button ("Generate description") beats a menu |
| How to show a rewrite | **≤ ~2 sentences or < ~40 % changed** → **inline word diff** (deletions struck through in red, insertions in green) in place. **Longer** → show the new text as a highlighted **replacement preview** with a "Show changes" toggle. **Side-by-side** only for code or very wide panes. The action bar is docked under the range | Plate "Improve writing" shows a red-struck original plus green insertion inline [V probe]. Tiptap's template shows purple highlighted replacement [V probe]. VS Code NES renders side-by-side *"if there is enough space"* [V]. Shape of AI: *"show the AI's result inline as a suggestion layer, not an overwrite"* [V] | Proofreading (many tiny fixes): underline each change and let users step through, accepting or rejecting each (Apple Writing Tools proofread [M]; Grammarly cards [M]) |
| Action set after a rewrite | Default focus on **Accept** (Enter), then **Discard** (Esc), **Try again**, plus a refine input ("Tell AI what else to change…"). Add **Insert below** for generative actions (summary, continue). Labels are verbs; no "OK" | Plate: Accept / Discard / Insert below / Try again [V probe]. Tiptap: Try again / Discard / Apply [V probe]. Notion: accept / discard / try again [D]. Apple HIG: *"surfacing controls like Edit, Undo, Retry, or Adjust near generated content"* [V] | Destructive scope (whole document): don't default focus to Accept |
| Keep the original recoverable | Accept is **one undo step** (⌘Z restores the original exactly). Keep **Try again** history in the session (‹ 1/3 › or Undo/Redo between drafts). Fields keep a **"Revert to AI" / "Restore my text"** affordance until save | Gmail: *"To switch between different drafts… click Undo or Redo"* [V]. Carbon for AI: *"Once edited, the user should still be able to switch back to the initially AI-generated content via a revert to AI button"* [V]. Apple Writing Tools: *"revert to the original version of your text"* [V] | – |
| Streaming | Stream into a **preview layer** (suggestion marks or an overlay), never straight into committed content. Lock the target range. Show a **"Writing… · Stop (Esc)"** pill. On stop, keep the partial preview with Accept / Discard. For forms, stream a **partial object** field by field | Plate's "Writing… Stop Esc" pill [V probe]. AI SDK `useObject` (stable; `experimental_useObject` alias kept) and `streamText` with `output` / `partialOutputStream` (`streamObject` is now `@deprecated`) [V d.ts] | Very short outputs (< 1 s): render once, no stream |
| Never auto-apply | AI output is a **proposal** until the user accepts. No silent overwrites of user-entered values. Bulk fills preview the first 3–5 rows before running the rest | Shape of AI *Auto-fill*: *"Don't write over existing content without permission"*; *"have users verify the result before filling the rest"* [V]. Apple: *"Avoid automating destructive actions"* [V] | Admin-configured auto-apply for low-risk metadata, logged and reversible (Linear lets teams set suggestions to *"auto-applied"* per property [V]) |
| AI fill for fields | A **"✨ Generate" button inside or next to the field** (not a modal). Output lands as a pending value: tinted background + **AI label** + Accept / Retry / Undo. Never fill a non-empty field without asking ("Replace your text?"). Show **why** for inferred values (Linear-style "Suggested because…"). Smart defaults are pre-selected, but labelled and keyboard-reachable | Carbon: AI variant switches to default once the user overrides [V]. Shape of AI: *"Retain a visual distinction until the user accepts the generated content or overrides it"* [V]. Linear: *"Accept, decline, or view more information about why a suggestion was made"* [V] | High-volume data entry: accept-all for a whole form with a single review summary |
| Labelling | **Pending** AI content: visible tint plus an "AI" chip (Carbon-style label with a popover saying what it used). **After accept, in prose:** no persistent label (it's the user's text). Optionally keep provenance in history or comments. **Fields** keep the label until a human edits or confirms | EU Art. 50(2) exempts *"assistive function for standard editing"*; 50(4) exempts human-reviewed text [V]. Shape of AI: *"showing footprints of inline modifications so others can distinguish AI-assisted changes"* in collaborative docs [V]. Full disclosure rules: E4 | Collaborative or regulated docs: keep an "AI-assisted" footprint in version history |
| Inline summaries | **On demand** ("✨ Summarize thread") for threads > ~10 messages, cached. Show **scope and freshness** ("Summary of 14 messages · 2 min ago"), an AI label, and links back to the source messages. Mark it stale when new items arrive. Automatic only for routine material (mail threads, meeting notes) | Shape of AI *Summary*: *"Expose scope and source"*, *"Provide automatic summarization with caution"* [V]. NN/g AI review summaries: a section label ("Customers say"), an AI disclaimer, themes linked to reviews [V] | Dashboards with a fixed daily digest: precompute server-side |
| Suggested replies | **3 short chips** above the composer. Tapping one **inserts the text for editing; it never sends**. Hide them once the user starts typing. No AI label on sent replies (the human sent it) | Shape of AI *Suggestions*: *"three to six"*, *"Scope when suggestions appear"* [V]. NN/g: AI disclosure lowers ratings when people expect *"human judgment, sincerity, or connection"*. Another reason the user must edit and own it [V] | Support agents with macros: one-tap send is fine with a review step |
| Screen readers | The ghost text node is **`aria-hidden`**. When a suggestion appears, announce **once** via a polite live region: "Suggestion: ‹first ~10 words›. Tab to accept." Don't re-announce while it updates. Offer a setting to turn off automatic suggestions, and keep manual (Ctrl+Space) available. Rewrite results get focus moved to the action bar, with the diff summarised ("3 changes") | VS Code: accessibility signals for inline suggestions, and **Accessible View ⌥F2** *"available for… inline completions"* [V]. Plate's ghost span has **no** `aria-hidden` [V probe], so don't copy it blindly | – |
| IME (CJK, etc.) | **No request and no ghost text while composing** (`compositionstart`…`compositionend`). Ignore Tab/Enter/Esc keydowns with `event.isComposing` (or keyCode 229). Re-trigger after `compositionend` | MDN `KeyboardEvent.isComposing` [V URL]. Rendering ghost text inside an active composition corrupts input [M] | – |
| Mobile | **No ghost text on phones** (no Tab key, and it fights the OS keyboard's predictions). Use an explicit **"✨ Improve / Refine" chip** that appears after N words, and a bottom sheet with presets. Results come back with Accept / Discard / Try again as full-width buttons ≥ 44 px | Plate hides its ghost text below `sm` (`max-sm:hidden`) [V probe]. Gmail mobile shows "Refine my draft" *"When 12+ words are present"* [V] | Tablets with hardware keyboards: desktop model |
| Cost and rate limits | Trigger conditions before debounce, abort on keystroke, cache by (field, prefix hash), one request in flight per field. **Snooze** and **off** switches. Pause automatic requests on `navigator.connection.saveData` / metered. Rewrites use a bigger model than ghost text. Show a quota only where users pay per use | Cursor: fewer suggestions with higher acceptance [V]. VS Code: metered → *"does not start new automatic ghost text… requests"*; Snooze in 5-minute steps [V]. Notion: premium models *"spend Notion credits"* [D] | Internal tools with flat cost: relax the triggers |
| Privacy | Send **only the field plus the minimum context**, described in a one-line "What's sent" note in the menu or settings. **Never** send `type=password`, `autocomplete="cc-*"`, `one-time-code` or fields marked `data-ai="off"`. Respect content locks or exclusions. Offer on-device where it's available | Apple HIG: *"process as much information locally as possible… showing them what's shared"* [V]. Gmail Help me write uses *"your other emails and Drive files"* and stores the *"Text in the draft you refine"* [V]. Linear: no training, subprocessors only [V]. Tiptap: *"Lock specific content to exclude it from AI"* [V]. Chrome Summarizer API stable from **138**; Writer / Rewriter in developer trial; Proofreader in origin trial [V] | Enterprise: admin-level exclusions, like Copilot content exclusion and `.cursorignore` [M] |
| Failure states | **Ghost text fails silently** (no suggestion, no toast, logged). **Rewrite fails inline** inside the AI menu: plain-language reason + **Retry** + **Cancel**, original untouched. Quota: say when it resets. Refusal: say what can't be done and offer an alternative preset | BlockNote: "Oops! Something went wrong" · Retry · Cancel [V probe]. Apple: *"describe what happened in plain language and offer a clear next step"*; *"Unable to use that description"* [V]. PAIR: *"Provide paths forward from failure"* [V] | – |

**Microsoft HAX** (403 to curl; from the CHI 2019 paper [M]) maps directly onto these defaults: G3 *time services based on context*
(triggers), G7 *efficient invocation* (⌘K, Ctrl+Space), G8 *efficient dismissal* (Esc, keep typing), G9 *efficient correction*
(Try again, refine field), G11 *make clear why* (Linear's reasons), G17 *global controls* (Snooze / off).

---

## 3. Tools (npm checked 2026-10-18 [V])
| Package | Version | Licence | Modified | Best at | React/Next fit and flags | Mock stream, no key? |
|---|---|---|---|---|---|---|
| `ai` | 7.0.143 | Apache-2.0 | 2026-10-16 | `streamText` (+ `output: Output.object()` → `partialOutputStream` for form fill). `streamObject` now **deprecated** | Our base layer (same as E1) | **Yes.** `ai/test` `MockLanguageModelV4` + `simulateReadableStream` |
| `@ai-sdk/react` | 4.0.147 | Apache-2.0 | 2026-10-16 | **`useCompletion`** (`complete`, `stop`, `setInput`, `throttle`, custom `fetch`) for ghost text and rewrites. **`useObject`** (stable; `experimental_useObject` alias) for streaming partial objects into fields | Headless. The ghost-text overlay and the menu are ours | **Yes.** Pass a custom `fetch` that returns a simulated stream |
| `@platejs/ai` (+ `platejs`) | 53.3.17 (53.3.15) | MIT | 2026-10-14 | The most complete open inline-AI kit: **CopilotPlugin** (ghost text, Tab / Esc / ⌘→ / Ctrl+Space, abort, trigger rules), **AIChatPlugin** (⌘J menu, streaming markdown insert, **diffed suggestions with accept/reject**, comments), table-cell edits | Peers `ai ^7` + `@ai-sdk/react ^4`: matches us. **Flags:** UI comes via the **shadcn registry** (`npx shadcn@latest add @plate/ai-menu`) [V], so we restyle or rebuild the menu. Docs carry a **"Plus"** badge and "Get all-access" upsell for paid templates; the plugins themselves are MIT. Slate-based | **Yes.** Its own docs demo mocks with `faker` in `onError` [V]; any `fetch` mock works |
| `@tiptap/core` / `@tiptap/react` | 3.32.0 | MIT | 2026-10-13 | The editor core is excellent. **AI is not free**: Content AI (`@tiptap-pro/extension-ai`, private registry) and the AI Toolkit need a Tiptap subscription (30-day trial) [V pricing]. `@tiptap/ai-toolkit` 0.4.1 is MIT on npm but is *"the SDK for connecting to the Server AI Toolkit service"* [V] | Fine with Tailwind (headless). **Paid flag** for any AI feature: we'd hand-build AI on the free core (Suggestion marks + our own `useCompletion`) | Core: yes. Pro AI: needs the paid service |
| `@blocknote/xl-ai` (+ `@blocknote/core`, `react`) | 0.56.0 (core 0.56.0) | **GPL-3.0 OR PROPRIETARY** (core **MPL-2.0**) | 2026-10-14 | Notion-style AI menu (Ask AI…, Improve Writing, Fix Spelling, Translate, Simplify), accept/reject via `prosemirror-suggest-changes`, good error state | **Licence flag:** closed-source use of the AI package needs the *"BlockNote Business subscription or above"* [V]. `xl-ai-server` 0.31.0 is **AGPL-3.0 OR PROPRIETARY** and stale (2025-05-20). Depends on **`ai ^6` / `@ai-sdk/react ^3`** (a major behind). Default UI is Mantine | Yes, with a custom `ChatTransport` (`ClientSideTransport` example exists) [D] |
| `novel` | 1.0.2 | Apache-2.0 | **2025-01-18** | The Notion-style editor that popularised "++" AI autocomplete [M] | **Stale:** 21 months without a release, Tiptap **2** deps, `cmdk`, `jotai`, `tippy.js`. Read for patterns; don't adopt | Possible (it's just a fetch), but unmaintained |
| `lexical` / `@lexical/react` | 0.52.0 | MIT | 2026-10-16 | Fast, accessible core. **No official AI plugin.** The playground's AutocompletePlugin shows how to do ghost text as a node [M] | Good React fit. We'd write ghost text and rewrite ourselves | n/a (bring your own) |
| `@marimo-team/codemirror-ai` | 0.3.10 | Apache-2.0 | 2026-10-16 | CodeMirror 6 **inline edit** (`Mod-k` prompt, `Mod-y` accept, `Mod-u` reject, 300 ms debounce, accept/reject callbacks) + next-edit prediction | Maintained (marimo). Peers `@codemirror/view` / `state` ^6 only | **Yes.** `prompt` is a plain async function |
| `codemirror-copilot` / `codemirror-extension-inline-suggestion` | 0.0.7 / 0.0.3 | MIT / **none** | 2024-01-18 / 2024-02-11 | Ghost text for CM6 | Stale; the second has **no licence**. Skip | – |
| `monaco-editor` (+ `@monaco-editor/react`) | 0.57.0 (4.7.0) | MIT | 2026-09-24 (2025-11-21) | Built-in `registerInlineCompletionsProvider` gives the VS Code ghost-text UX, including word accept [M] | Multi-MB. Only if we already ship Monaco | Yes (provider is a function) |
| `monacopilot` | 1.2.12 | MIT | 2026-01-09 | Drop-in Monaco ghost text. Triggers `onIdle` (default, 400 ms), `onTyping` (120 ms), `onDemand` [V source] | 9 months since release | Yes (custom request handler) |
| `@copilotkit/react-textarea` | 1.79.1 | MIT | 2026-10-16 | Ghost text in a textarea (Tab, 250 ms debounce) + **⌘K hovering editor** for selection rewrites | **Deprecated v1 SDK** [V docs]. Deps: **Slate, MUI 5, Emotion**, Radix, cmdk, `material-icons`. Skip. The fork `copilot-react-textarea` 1.5.8 has the same deps | Needs a CopilotKit runtime [M] |
| `rich-textarea` | 0.28.0 | MIT | 2026-10-13 | A real `<textarea>` with a decorated mirror layer: the cleanest base for **ghost text in plain form fields** (keeps native IME, autofill, mobile) | Tiny, peer React only. Ghost-text use is our design, not a library feature | n/a |
| `prosekit` | 0.22.4 | MIT | 2026-10-09 | Headless ProseMirror toolkit with React bindings; no AI | An alternative base if we avoid Tiptap's paid AI | n/a |
| Chrome built-in AI (Summarizer / Writer / Rewriter / Proofreader) | – | browser API | – | On-device summarise/rewrite, with no data leaving the device | Summarizer stable in Chrome 138. Writer/Rewriter in **developer trial**; Proofreader in **origin trial** [V]. Progressive enhancement only | n/a |

**Suggested stack:** AI SDK (`useCompletion`, `useObject`, `streamText` + `Output.object`). For plain fields: our own
`<AiTextField>` built on `rich-textarea`, with the defaults above. For rich text: **Plate** (MIT, AI SDK v7) if the D5 editor
choice lands on Slate. If D5 picks Tiptap or ProseKit, use free Tiptap/ProseKit **without** Tiptap's paid AI and build the menu
ourselves. Use `jsdiff` `diffWords` for prose redlines (shared with E3).

**Benchmark harness (a future `benchinline/`):** one mocked `fetch` (`simulateReadableStream`, fixed chunk delays), and
the same tasks per library. (a) Type 3 words, pause, and measure the time to ghost text and the abort on the next keystroke.
(b) Partial accept with ⌘→. (c) Select a paragraph → Make shorter → diff → Accept → ⌘Z restores the original exactly.
(d) Generate 4 form fields via `useObject`, one of them pre-filled by the user (must not be overwritten). (e) IME composition
via Playwright `insertText` and composition events. (f) The axe and screen-reader live-region probe. (g) Bundle size.

---

## 4. Public reference pages (no login; `curl -sL -A "Mozilla/5.0"` status recorded 2026-10-18)
| # | URL | Code | The moment | Headless without key? | Suggested capture |
|---|---|---|---|---|---|
| 1 | https://platejs.org/docs/copilot | 200 | **Ghost text** after the caret in muted grey, with on-page key legend (Tab / ⌘→ / Esc) | **Yes [V].** `/api/ai/copilot` 404s, so the demo shows mocked lorem ghost text | Click `[data-slate-editor="true"]`, `Control+End`, type `" The quick brown fox "` (60 ms delay), wait 2.5 s, screenshot the editor. `Control+Space` gives an alternative |
| 2 | https://platejs.org/docs/ai | 200 | **Selection rewrite as an inline diff** (red strike + green insert), with "Ask AI anything…" and **Accept · Discard · Insert below · Try again**. ⌘J menu; "Writing… Stop Esc" pill | **Yes [V]** (mocked lorem) | Triple-click the text "Generate and refine content with AI.", `Control+j`, click `[cmdk-item]:has-text("Improve writing")`, wait 10 s, screenshot. Also capture mid-stream for the Stop pill |
| 3 | https://template.tiptap.dev/preview/templates/notion-like | 200 (redirects to a fresh doc id) | Selection toolbar AI menu (Improve, Adjust tone, Fix spelling & grammar, Extend, Reduce, Simplify, Emojify, Complete sentence, Summarize, Translate). Result highlighted + *"Tell AI what else needs to be changed…"* + **Try again · Discard · Apply** | **Yes, real model [V]** (`api.tiptap.dev/v1/ai/…?stream=1` returned 200). May be rate-limited | Triple-click the 2nd `p`, click `button[aria-label*="AI"]`, click "Fix spelling & grammar", wait 10 s |
| 4 | https://www.blocknotejs.org/examples/ai/minimal (also `/examples/ai/playground`) | 200 | AI menu ("Ask AI anything…", Improve Writing, Fix Spelling, Translate…, Simplify) and the **failure state**: "Oops! Something went wrong" · Retry · Cancel | Menu yes; generation **fails** headless (backend defaults to localhost) [V]. A real run may need sign-in [unverified] | Triple-click `.bn-inline-content` nth(1), click `button[aria-label="Edit with AI"]`, choose Simplify, wait, then screenshot the error |
| 5 | https://cursor.com/tab (+ https://cursor.com/docs/tab/overview) | 200 / 200 | Product videos of Tab (multi-line, jump-in-file, cross-file portal). The docs page has the key table and Snooze | Marketing video only | Record the hero video frames. Quote the "21% fewer suggestions / 28% higher accept rate" line |
| 6 | https://code.visualstudio.com/docs/copilot/ai-powered-suggestions | 200 | Ghost-text and **NES gutter arrow** images; side-by-side NES; Snooze; metered-network rule | Static docs | Screenshot the NES images. Cite the settings `editor.inlineSuggest.minShowDelay`, `…edits.renderSideBySide` |
| 7 | https://docs.github.com/en/copilot/how-tos/get-code-suggestions/get-ide-code-suggestions | 200 (WebFetch can't resolve it; curl works) | The canonical shortcut tables (Tab, Esc, Alt+] / Alt+[, ⌘→, Ctrl+Enter panel) per IDE | Static | Cite, no capture |
| 8 | https://www.apple.com/apple-intelligence/ | 200 (3 videos) | Writing Tools: proofread / rewrite / tone, system-wide grammar suggestions | Video only | Pause on the Writing Tools panel frames |
| 9 | https://www.shapeof.ai/patterns/inline-action · /auto-fill · /suggestions · /summary | 200 each | Curated example galleries (Atlassian, Notion, Attio, Linear, LogicGate, Granola…). CC-BY-NC-SA: link and quote, don't copy images | Static | Link from the guide |
| 10 | https://linear.app/ai · https://linear.app/docs/triage-intelligence | 200 / 200 | Triage Intelligence: suggested assignee, team and labels **with reasons**, Accept/Decline. The best "AI fill with justification" reference | Video / docs | Capture the suggestion chips from the video frames |
| also | https://www.grammarly.com/ai (200, videos), https://www.notion.com/product/ai (200), https://www.figma.com/ai/ (200), https://monacopilot.dev (200, demo unverified), https://playground.lexical.dev (200, non-AI ghost-text autocomplete [M]), https://docs.copilotkit.ai/reference/v1/components/CopilotTextarea (200, marked deprecated) | | | | |

**Failed or weak:** https://novel.sh returns 200 but shows *"Application error: a client-side exception has occurred"* in headless
Chromium today [V]; try a real browser. github.com/features/copilot returns 403 to the proxy (as in E1–E5).

## 5. Logged-in products: screens to capture (for a user with accounts)
| Product | Exact screens |
|---|---|
| **Cursor** | (1) Tab ghost text mid-line, plus a multi-line diff-style Tab suggestion; (2) after accept, the **jump-in-file** hint and the cross-file **portal** at the bottom; (3) word-by-word accept half-way; (4) ⌘K inline edit prompt over a selection and its inline diff with Accept/Reject; (5) the Tab status-bar menu with **Snooze** |
| **VS Code + GitHub Copilot** | (1) Grey ghost text with the hover toolbar (‹ 1/3 › Accept / Accept Word); (2) **NES gutter arrow**, collapsed and expanded, and side-by-side; (3) the Ctrl+Enter suggestions panel; (4) Accessible View (⌥F2) on a suggestion; (5) Copilot menu → Snooze |
| **Notion AI** | (1) Highlight → **Edit with AI** menu (presets and free text); (2) the result with **Accept / Discard / Try again**; (3) space on an empty line → prompt → streamed text; (4) a database **AI Autofill** property (summary or keywords column) and its config; (5) the `/AI Block` |
| **Gmail** | (1) **Smart Compose** grey text in a new email; (2) **Help me write** prompt bar → draft → **Formalize / Friendly / Shorten**, plus **Undo/Redo** between drafts; (3) the **thread summary** card at the top of a long thread; (4) **Suggested replies** chips; (5) mobile "Refine my draft" (after 12+ words) |
| **Google Docs (Gemini)** | Help me write → Replace / Insert / Refine; the side-panel vs inline choice |
| **Linear** | (1) Triage issue with suggested assignee, team and labels, the "why" popover, and Accept/Decline; (2) the duplicate-issue suggestion; (3) AI issue/project summary; (4) Settings → AI per-property *show / hide / auto-apply* |
| **Apple Writing Tools (macOS / iOS 27)** | (1) Proofread with underlined changes and per-change navigation; (2) Rewrite → Friendly / Professional / Concise; (3) **Revert** and **Done**; (4) "Describe a change"; (5) the inline grammar suggestion in Notes |
| **Figma AI** | Rename layers (bulk AI fill with review), rewrite or translate text on canvas, First Draft |
| **Grammarly** | Inline underline → suggestion card with Accept / Dismiss; "Improve it" rewrite of a paragraph with a diff |
| **Slack / Superhuman** | Slack AI thread and channel recaps (scope and freshness lines); Superhuman instant reply chips → editable draft |
| **Atlassian (Jira/Confluence)** | Selection → "Atlassian Intelligence" inline preview before insert (Shape of AI cites it) |

---

## 6. Disagreements with the E6 row in `research/categories.md`
1. **"Tools: (patterns; AI SDK)" undersells the decision.** E6 is mostly an **editor and licence** choice. Plate (MIT, AI SDK v7)
   is the only full open kit that fits. Tiptap AI is **paid**, BlockNote AI is **GPL/commercial**, Novel is **stale**, and
   CopilotTextarea is **deprecated**. List them with flags, and run a small bench (section 3) that shares the D5 editor shortlist.
2. **E6 depends on D5 (Rich text, P2).** You can't ship rich-editor inline AI (P1) without choosing the editor. Either raise D5's
   editor choice to P1, or split E6: **P1 = plain fields** (ghost text in a textarea, "Generate" field fill, rewrite with
   Accept/Discard, summaries, suggested replies); **P2 = rich-editor** ghost text and next-edit prediction.
3. **"Covers" is missing four things briefs ask for:** inline **summaries** in lists and threads, **suggested replies**, **smart
   defaults / suggested properties with reasons**, and the non-visual requirements (**IME, screen readers, Tab-in-forms, mobile**).
4. **References:** Linear is weak for ghost text or rewrite, but it's the **best "AI fill with justification"** example (keep it,
   for that reason). Add **Apple Writing Tools** (system rewrite/proofread with Revert), **VS Code Copilot NES** (keyboard model,
   off-caret edits, accessibility), **Grammarly** (proofread cards), and the two **capturable demos** (platejs.org, the Tiptap
   template). Cursor Tab stays, but it's code-only.
5. **Overlap with E3/E4.** E3's guide already says *"Prose or doc edits: inline word-diff (redline)"*. Prose redlines and
   accept/reject belong in **E6**, and code hunks in E3, with one shared `jsdiff` engine. E4 keeps the disclosure law, and E6
   should link to it with the **assistive-editing exemption** (Art. 50(2)) that E4 doesn't mention yet.
6. **Taxonomy gap:** `taxonomy.md` has `ai-chat`, `ai-review` and `ai-provenance`, but nothing for inline assist. Add pattern
   **`ai-assist`** (ghost text, inline rewrite, AI fill, inline summary, suggested replies) and tags `ghost-text`, `ai-fill`.

## Sources
- GitHub Copilot IDE suggestions: https://docs.github.com/en/copilot/how-tos/get-code-suggestions/get-ide-code-suggestions [V]
- VS Code inline suggestions and NES: https://code.visualstudio.com/docs/copilot/ai-powered-suggestions ; accessibility: https://code.visualstudio.com/docs/configure/accessibility/accessibility [V]
- Cursor Tab docs: https://cursor.com/docs/tab/overview ; page: https://cursor.com/tab [V]
- Apple HIG Generative AI (changelog June 8, 2026): https://developer.apple.com/design/human-interface-guidelines/generative-ai ; Writing Tools dev docs: https://developer.apple.com/documentation/uikit/writing-tools ; Mac help: https://support.apple.com/guide/mac-help/mchldcd6c260/mac [V]
- Shape of AI: https://www.shapeof.ai/patterns/inline-action , /auto-fill , /suggestions , /summary [V]
- Google PAIR: https://pair.withgoogle.com/chapter/feedback-controls/ , https://pair.withgoogle.com/chapter/errors-failing/ [V]
- Microsoft HAX guidelines: https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/ (403 to curl; G-numbers [M])
- IBM Carbon for AI (revert to AI, AI label): https://carbondesignsystem.com/guidelines/carbon-for-ai/ , https://carbondesignsystem.com/components/ai-label/usage/ [V]
- NN/g: https://www.nngroup.com/articles/accordion-editing-apple-picking/ , https://www.nngroup.com/articles/ai-reviews/ , https://www.nngroup.com/articles/disclose-ai-paced/ , https://www.nngroup.com/articles/response-times-3-important-limits/ [V]
- Gmail: Help me write https://support.google.com/mail/answer/13955415?hl=en ; Smart Compose https://support.google.com/mail/answer/9116836?hl=en ; Refine my draft https://workspaceupdates.googleblog.com/2024/08/refine-emails-faster-with-help-me-write-gmail.html [V]
- Notion: https://www.notion.com/help/guides/notion-ai-for-docs , https://www.notion.com/help/notion-ai-faqs [D]
- Linear Triage Intelligence: https://linear.app/docs/triage-intelligence [D]
- Tiptap pricing and AI: https://tiptap.dev/pricing , https://tiptap.dev/product/content-ai , https://tiptap.dev/docs/editor/ai/introduction [V]
- BlockNote AI and licensing: https://www.blocknotejs.org/docs/features/ai , https://www.blocknotejs.org/pricing [V]
- Plate: https://platejs.org/docs/copilot , https://platejs.org/docs/ai [V]
- CopilotKit v1 deprecation: https://docs.copilotkit.ai/reference/v1/components/CopilotTextarea [V]
- Chrome built-in AI: https://developer.chrome.com/docs/ai/built-in-apis [V]
- EU AI Act Art. 50: https://artificialintelligenceact.eu/article/50/ [V]
- MDN isComposing: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/isComposing ; WCAG 2.1.2: https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html [V]
