# RUN: baseline (control, no design skill)

- No design skill used. Read brief and pricing-content.json, wrote index.html by hand, checked it in Chromium via Playwright at 390, 768 and 1280 px (no horizontal overflow, no page errors), keyboard-only (Tab reaches the toggle; arrow keys switch Monthly/Annual) and reduced motion emulation.
- Questions answered myself: none asked.
- Decisions: "$" currency symbol added to the prices (the data has none; assumption). CTAs link to `#trial`, which is the trial note on the page, since there is no signup URL in the brief. No "most popular" badge, no stats, logos or testimonials. Hero illustration is an abstract, labelled stand-in (statement lines matched to ledger lines, no numbers).
- Annual view shows the annual price per month, "Billed annually", and the monthly price struck through (both from the data). Toggle is a radio group (monthly on load); a live region announces the change.
- Comparison table is static HTML with 8 body rows. FAQ uses native details/summary.
- Changed after screenshots: the mobile comparison table broke words mid-word ("Reconcilia/tions"), fixed with a colgroup width for the first column; plan card top accent bar was clipped by rounded corners, now clipped by overflow hidden.
- Nothing failed. System fonts only (no network fetch).
