---
title: IDE workbench with named parts, F6 to cycle between them, one-key toggles for sidebar and panel, and layout buttons
pattern: panels
page_type: app
tags: [devtools, dark, keyboard, dense, accessible]
source_url: https://vscode.dev/
source_site: vscode.dev
captured_at: 2026-10-18
captured_by: toby
input: url
rating: 5
why_it_works: The canonical fixed-region workspace. Activity bar, sidebar, editor, bottom panel, secondary sidebar and status bar are each a named part, and every part can be reached and toggled from the keyboard (F6 cycles the parts, Ctrl+B the sidebar, Ctrl+J the panel), with matching layout toggle buttons in the title bar.
use_when: Tool UIs with a primary work area plus optional navigation and output regions (editors, consoles, admin tools). Use it as the model for which regions exist and how people show, hide and reach them.
has_example: false
---

## What it is
vscode.dev with no folder open, captured at 1440×900 with the bottom panel opened (Ctrl+J). The parts are the
activity bar (48 px), Explorer sidebar (300 px), editor (main), panel (Problems / Output / Terminal) and status
bar. The four layout toggles sit at the top-right of the title bar.

## Key techniques
- Fixed regions instead of free docking: views move between known containers (sidebar, panel, secondary
  sidebar), so the layout never becomes unrecognisable.
- Toggle shortcuts: Ctrl+B sidebar (300 → 0 → 300 px measured), Ctrl+J panel (0 → 292 px). Panel maximise and close sit in the panel header.
- Title-bar layout buttons mirror the shortcuts for pointer users, and "Customize Layout" gives presets.
- Empty states inside parts give clear next actions (Open Folder, Open Recent, Connect to Tunnel…).
- Sashes are 4 px. The sidebar sash shows a small grip at its midpoint.

## Accessibility (measured)
- F6 cycles focus across parts: status bar → activity bar → sidebar → editor → panel. This is the same
  "jump between regions" idea as skip links, but repeatable.
- Landmarks: the banner part is `role="banner"`, the editor `role="main"` and the status bar `role="status"`.
  Other parts have no landmark role.
- **Sashes are not focusable**: `.monaco-sash` elements have no role or tabindex. Keyboard resizing is done
  through commands ("View: Increase/Decrease Current View Size"), not a focusable splitter. Prefer an APG
  separator in web apps.
- Activity bar items are named with their shortcut ("Explorer (Ctrl+Shift+E)").

## Weaknesses
- Keyboard resize hidden in the command palette is not discoverable. Give splitters focus and arrow keys.
- No skip link, because F6 replaces it. On the web, add a skip link too, since most users don't know F6.

## Related entries
- `panels/react-resizable-panels-keyboard-splitter-collapse`, `panels/flexlayout-docking-keyboard-splitters`,
  `panels/dockview-trading-workspace-docking`, `navigation/atlassian-multi-target-skip-links`.
