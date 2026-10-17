---
title: Error summary at the top of a form that links to each failing field
pattern: accessibility
page_type: docs
tags: [accessible, keyboard, minimal]
source_url: https://design-system.service.gov.uk/components/error-summary/default/index.html
source_site: design-system.service.gov.uk
captured_at: 2026-10-17
captured_by: toby
input: url
rating: 5
why_it_works: After a failed submit, one bordered box headed "There is a problem" lists every error as a link to the field, so keyboard and screen-reader users hear all problems at once and can jump straight to each one instead of hunting through the form.
use_when: Any form with server or submit-time validation, especially long or multi-section forms (settings, checkout, onboarding).
has_example: false
---

## What it is
The GOV.UK Design System's default error summary example: a box with a 5px red border, the heading "There is a problem", and
links such as "Enter your full name" and "The date your passport was issued must be in the past". Each link targets the input
with the error; the inline error message beside the field repeats the same wording.

## Key techniques
- `border: 5px solid rgb(202,53,53)` (red #ca3535, 5.2:1 against white): strong enough to see without relying on colour alone, because the heading says "There is a problem".
- Links are written as **instructions** ("Enter your full name"), not field names or codes, and match the inline message word for word.
- `data-module="govuk-error-summary"`: the component script moves focus to the summary on page load and, when a link is used, focuses the input and scrolls so its **label** is visible (per `research/A7-accessibility.md`; in this standalone example page, focus stayed on `<body>` on load and the targets don't exist, so we couldn't observe those two behaviours here).
- Focused links use the same two-tone focus style as the rest of GOV.UK (yellow fill, black 4px bar), visible in `desktop.jpg`.

## Accessibility
Moving focus to the summary means screen readers announce the heading and the list immediately after submit. Put "Error: " in the page
`<title>` too. Inline messages should be associated with inputs via `aria-describedby`.

## Weaknesses
- The example page is the component in isolation; see it inside a real form (GOV.UK's "Validation" pattern page) before copying the flow.
- For instant (as-you-type) validation, a summary is overkill; use it for submit-time errors.

## Related entries
- `accessibility/govuk-two-tone-focus`
- `accessibility/react-aria-combobox`

> Captured live on 2026-10-17 with a Playwright script (load, Tab once, Enter). Border and focus styles read from computed styles.
