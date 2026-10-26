# RUN.md (baseline / control, no diagram skill)

No skill was loaded, so there were no skill steps. I worked as I normally would:

1. Read the brief and used only its facts.
2. Chose a structure: write lane (ux-add, 6 steps), library band (four layers plus a callout that catalog.json is the link between the skills), read lane (ux-find, 5 steps plus 1 optional step). `catalog.json` carries the same amber chip everywhere it appears.
3. Built one self-contained `diagram.html` (HTML/CSS, inline SVG arrows, system fonts, light and dark colours). The steps are ordered lists in cards, so the layout reflows from a 6-column row at 1280 px to a single column at 390 px.
4. Added a text alternative: a visually hidden description tied to the figure with `aria-describedby`, plus a visible "Read it as a list" disclosure.
5. Rendered with Playwright at 1280 and 390 px (`shot.mjs`, `shot-1280.png`, `shot-390.png`) and checked for horizontal overflow (none at either width).

Skipped: nothing failed. No user questions were asked.

Changed after viewing: the first render had no card styling and a crushed layout, because a `display:contents` rule on `.steps>li` also hit the cards. I removed it. I also reworded the "Source profiles" card to "Profiles of the sources." so it adds no detail beyond the brief.
