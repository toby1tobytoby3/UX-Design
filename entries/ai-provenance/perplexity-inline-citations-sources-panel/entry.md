---
title: Inline source chips per paragraph plus a per-section sources panel
pattern: ai-provenance
page_type: app
tags: [editorial, citations, b2c, minimal]
source_url: https://www.perplexity.ai/discover/tech/idc-smartphone-shipments-fall-LJNesH4OSbWFO7k0GStMEA
source_site: perplexity.ai
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 4
why_it_works: Every claim-bearing paragraph ends with a small monospace chip naming its source domain ("idc +1"), a strip of source cards sits under the lead, and "5 sources" opens a side panel listing each source by section, so a reader can check any claim at the point they read it without leaving the answer.
use_when: AI answers, research summaries or generated reports where users need to verify claims: search, research assistants, internal knowledge Q&A.
has_example: false
---

## What it is
A public Perplexity Discover article (an AI-written news summary; we picked a neutral tech story). Captured without logging in:
- **Inline chips** at the end of paragraphs: `idc +1`, `finance.yahoo +2`, `theregister +1`, `9to5mac +1`. The label is the source's short domain; `+N` means more sources back the same paragraph.
- **Source cards** under the lead: favicon, domain, and the source article's title, truncated to two lines.
- **"5 sources" button** with stacked favicons under each section; clicking it opens a right-hand panel titled "5 sources", grouped under the section heading ("Memory costs up about 350%"), each row with favicon, domain and headline.
- Hovering a chip shows a card with the domain and full headline ("Global Smartphone Shipments Drop Record High of 22% in Q3 2026…").

## Key techniques
- Chips are real links (`target="_blank" rel="noopener"`) to the source URL, so they work without the hover card.
- **Domain, not number**, as the chip label: readers judge credibility from "idc" faster than from "[3]".
- Citations are scoped per paragraph and per section, not one list at the end, which keeps claim-to-source distance short.
- "Published 16 Oct 2026" date plus the follow-up composer ("Ask follow-up") under the article.

## Accessibility
Chip links have no `aria-label`; the accessible name is just the domain ("idc"), which says nothing about what's being cited.
Add context, e.g. `aria-label="Source: IDC press release, Global smartphone shipments…"`. The 11px monospace chip text is small; check contrast and target size (WCAG 2.5.8: 24×24px minimum; the chip was 28×23px).

## Weaknesses
- Paragraph-level, not claim-level: one chip covers several sentences, so you can't tell which source supports which number.
- We saw no explicit "AI-generated" label on the article itself beyond the Perplexity branding; for disclosure rules see `research/E-agentic-ui.md` (EU AI Act Art. 50).
- A sign-up popup covers part of the page for logged-out readers (visible at the edge of `crop-inline-chips.jpg`).

## Related entries
- `ai-chat/streamdown-streaming-markdown`
- `ai-review/pierre-diffs-keep-undo-hunks`

> Captured live on 2026-10-17 (logged out) with a Playwright script: closed the cookie banner and sign-up popup, hovered the first chip,
> opened the sources panel. Chip attributes and size read from the DOM. The news photo was cropped out.
