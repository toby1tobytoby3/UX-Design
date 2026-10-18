---
title: Multi-target skip links ("Skip to: Top Bar · Sidebar · Main Content") as the first focusable element of an app shell
pattern: navigation
page_type: docs
tags: [accessible, keyboard, b2b, minimal]
source_url: https://atlassian.design/components/navigation-system/examples
source_site: atlassian.design
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 5
why_it_works: In a three-region shell, a single "Skip to main content" isn't enough. Atlassian's navigation system renders a small focus-revealed menu with one link per region, so keyboard users can jump straight to the top bar, sidebar or main content.
use_when: Any app shell with a top bar and a sidebar. It meets WCAG 2.4.1 Bypass Blocks and helps most where the sidebar is long.
has_example: false
---

## What it is
atlassian.design's own shell, built with `@atlaskit/navigation-system`. When focused, the first focusable element
reveals a card at the top-left: "Skip to:" with three links. Captured: the page, and the skip card with "Top Bar" focused.

## Key techniques
- Markup: `<ol>` of three `<a href="#top-navigation">`, `#side-navigation` and `#main-content`. Hidden until
  focused, then shown as a white card with a shadow over the logo.
- Each target matches a landmark: `<header id="top-navigation">`, `<nav id="side-navigation" aria-label="Sidebar">`,
  and `<div role="main" id="main-content" tabindex="-1">`.
- The link labels name the regions as users see them ("Top Bar", "Sidebar", "Main Content").

## Accessibility (measured)
- The skip link is the first focusable element in the DOM (`a[href="#top-navigation"]`, `tabindex="0"`).
- Tab moves Top Bar → Sidebar → Main Content within the card. Enter on "Main Content" moved focus to
  `div#main-content` (`tabindex="-1"`), so focus really moves and doesn't just scroll.
- The focused link has a visible 2 px blue outline on the white card.

## Weaknesses
- The card covers the logo while visible. That's fine because it only shows during keyboard focus.
- A second `<nav aria-label="Page content">` (the on-page contents) isn't offered as a skip target. Add targets
  only for the regions people need to jump to.

## Related entries
- `navigation/shadcn-sidebar-icon-rail`, `panels/vscode-workbench-parts` (F6 part cycling as the in-app equivalent).
