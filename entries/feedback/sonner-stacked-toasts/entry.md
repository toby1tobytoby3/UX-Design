---
title: Stacked toasts that expand on hover, with promise loading → success
pattern: feedback
page_type: docs
tags: [minimal, animated, open-source, accessible, saas]
source_url: https://sonner.emilkowal.ski
source_site: sonner.emilkowal.ski
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: Several toasts collapse into a compact depth stack so they never cover the page, fan out on hover so each can be read, and a promise toast turns one async action into a single message that changes from loading to success or error instead of two separate toasts.
use_when: Any React app that needs transient confirmation of background actions (saved, copied, deployed), especially async ones with a loading phase.
has_example: false
---

## What it is
The Sonner demo site. "Render a toast" pushes toasts into a stack in the bottom-right corner. At rest only the front toast
is fully visible and the older ones peek out behind it, slightly scaled. Hovering the stack expands it into a list
with gaps. The "Promise" button shows one toast that reads "Loading…" with a spinner, then becomes "Sonner toast has been added"
with a check icon when the promise resolves (about 2.3 s in our capture). Buttons demo types (success, info, warning, error,
action, custom), positions and options.

## Key techniques
Read from the live DOM after four toasts:
- **Stack geometry as CSS variables on the toaster:** `--width: 356px; --gap: 14px; --offset-*: 24px` (16px on mobile). Each toast carries
  `data-index`, `data-front`, `data-expanded`, `--index`, `--toasts-before`, `--z-index`, `--offset`, so the stacked vs expanded layout is pure CSS driven by data attributes.
- **Motion:** `transition: transform .4s, opacity .4s, height .4s, box-shadow .2s`. Only 3 toasts are visible; older ones are kept but hidden.
- **Promise toast:** `toast.promise(p, { loading, success, error })` reuses one toast for the whole lifecycle, so the user sees one thing change state.
- Defaults (from the package source, per `research/A5-A6-motion-states.md`): bottom-right, 4 s duration, timers pause on hover and when the tab is hidden, swipe to dismiss.

## Accessibility
- The toaster sits in a `<section aria-label="Notifications alt+T" aria-live="polite" aria-relevant="additions text">`, so new toasts are announced politely without interrupting.
- **Alt+T moves focus to the toasts**; each toast is `tabindex=0`, so actions inside are reachable by keyboard.
- Timers pause on hover; check that toasts carrying actions (Undo) stay long enough (5–10 s guidance in the research file) and that nothing important lives only in a toast.
- Per the research, Sonner removes motion entirely under reduced motion rather than reducing it.

## Weaknesses
- The stacked look hides older messages; don't use toasts for anything the user must read (errors that block work belong inline).
- Bottom-right placement can cover content or chat composers in app layouts; pick the position per app.
- The demo site is a showcase; real usage needs your own tokens (it ships its own styles unless `unstyled`).

## Related entries
- `motion/numberflow-digit-roll`: another small, state-change animation done well
- `design-tokens/geist-materials-elevation`: the floating material a toast should use

> Captured live on 2026-10-17 with a Playwright script (click "Render a toast" ×4, hover the stack, click "Promise");
> attributes and transitions read from the DOM.
