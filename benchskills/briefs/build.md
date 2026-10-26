# Build brief: Ledgerly pricing page

You are building one web page. Use the design skill you were given (read its SKILL.md fully first and follow its
workflow as Claude Code would when the skill loads). If the skill tells you to ask the user questions, do not stop:
answer them yourself from this brief, state the answers in RUN.md and carry on. If the skill has no answer for
something, decide and move on.

**Product:** Ledgerly, invoice reconciliation for small accounting teams (matches bank statements to the ledger).
**Page:** `pricing`, the page a visitor reaches from the main nav before starting a trial.
**Audience:** bookkeepers and practice managers at firms of 2 to 20 people, comparing plans on a laptop or phone.

**Content you must include (exactly this; nothing else of fact):** the data in `pricing-content.json` next to this
file: three plans with their monthly and annual prices and features, a monthly/annual toggle (monthly selected on
load; annual shows the annual prices and says they are billed annually), the "Start free trial" call to action on
every plan, an eight-row plan comparison table, and the five-question FAQ with those answers.
**Do not invent** any metric, customer count, rating, testimonial, logo wall, award, security badge or claim that is
not in that file. Where a picture would normally carry a claim, use an honest stand-in or leave it out.

**Output:** a single self-contained `index.html` in your output folder (inline CSS and JS; web fonts from Google
Fonts or system fonts are fine; images must be inline or in the same folder). No framework or build step. It must
work at 390, 768 and 1280 px wide, with keyboard only, and with reduced motion on.

**Process notes:**
- Work only inside your output folder. Do not open any other folder under `benchskills/out/`.
- You may run the skill's scripts, use Chromium through Playwright (`require('playwright')`), and fetch from the
  network if the skill needs it; if something fails, say so in RUN.md rather than silently working around it.
- When done, write `RUN.md` in your output folder: the skill steps you followed, any you skipped or that failed,
  the questions you answered for the skill and how, and anything you changed after looking at screenshots.
