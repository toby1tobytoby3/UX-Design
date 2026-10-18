---
title: App sidebar that collapses to a 48 px icon rail with Ctrl+B, tooltips on hover and focus, and the state saved in a cookie
pattern: navigation
page_type: app
tags: [open-source, saas, b2b, minimal, keyboard]
source_url: https://ui.shadcn.com/view/new-york-v4/sidebar-07
source_site: ui.shadcn.com
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 4
why_it_works: The standard SaaS shell in copy-in code. A 256 px sidebar with a team switcher, grouped nav ("Platform", "Projects") and a user menu collapses to a 48 px icon rail with Ctrl+B or the header trigger, and every rail icon shows its label as a tooltip on hover and on keyboard focus.
use_when: Product app shells with 5–15 top-level destinations where people want more room for content but still need one-click navigation.
has_example: false
---

## What it is
shadcn/ui block `sidebar-07` (new-york-v4 view). It has a team switcher ("Acme Inc / Enterprise"), a "Platform"
group with collapsible items, "Projects", a user footer, and a header with the trigger and breadcrumb ("Build Your
Application › Data Fetching"). Captured: expanded, then collapsed with Ctrl+B and the "Playground" tooltip showing.
For our stack, use the Base UI flavour of the same block (`our-design/README.md`).

## Key techniques
- Widths: 256 px expanded, 48 px collapsed (`collapsible="icon"`). Menu buttons are 32 × 32 px in the rail.
- The text stays in the DOM when collapsed (overflow hidden), so each button keeps its accessible name.
- Tooltip per item (`tooltip={item.title}`), shown only when collapsed.
- State saved in a cookie `sidebar_state=false` so the server can render the right width with no flash. The
  standalone view page doesn't read it back (it reloads expanded), but the app layout in the docs does.
- A thin "rail" button on the sidebar edge toggles on click (`tabindex="-1"`, mouse convenience). The header
  trigger is the keyboard path.

## Accessibility (measured)
- Tooltips appear on keyboard **focus** as well as hover (`aria-describedby` set on the button).
- Tab order: team switcher → Playground → History → Starred… (the nav comes before the content; there is no skip link).
- Trigger is a `<button>` with sr-only text "Toggle Sidebar" but **no `aria-expanded`**. Add it, or announce the state.
- Only one `<nav>`, and it has no label. Label it ("Main") if there are other navs.
- Ctrl+B conflicts with "bold" in rich-text editors. Disable or remap it inside editors.

## Weaknesses
- No skip link. Pair it with `navigation/atlassian-multi-target-skip-links`.
- The rail hides group labels, so people with many items lose the structure when collapsed.

## Related entries
- `navigation/atlassian-multi-target-skip-links`, `panels/vscode-workbench-parts`,
  `panels/react-resizable-panels-keyboard-splitter-collapse`.
