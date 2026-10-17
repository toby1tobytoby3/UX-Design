# Our design

Conventions for rebuilt examples (`example.tsx`). Our site is **React/Next + Tailwind**
(no shadcn/ui), so examples are plain function components styled with Tailwind classes.

## Status
No design tokens captured yet. Until they are, examples use Tailwind defaults:
- Neutrals: `zinc`; accent: `indigo-600`
- Radius: `rounded-xl` for cards, `rounded-lg` for buttons/inputs
- Type: Tailwind default sans; headings `font-semibold tracking-tight`

When tokens exist, put the site's `tailwind.config.*` (or a `tokens.md`) in this folder
and examples should use those names instead.

## Example conventions (defaults)
- One file, default export, no dependencies beyond React and Tailwind.
- Accessible by default: semantic elements, labelled controls, visible focus, keyboard support.
- Placeholder copy and data inline at the top of the file so it is easy to swap.
