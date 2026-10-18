# Our design

Conventions for rebuilt examples (`example.tsx`). Our site is **React/Next + Tailwind**. Examples are function components
styled with Tailwind classes.

**shadcn/ui is allowed as copy-in code we own** (decided 18 Oct 2026): add components with its CLI, keep them in our repo,
restyle them with our tokens, and update them deliberately (they are not a dependency that upgrades itself). Rules:
- Pick the **Base UI** flavour (or Radix if the app is already on Radix), and keep one overlay/focus system per app
  (`guides/accessibility.md`). Use React Aria for date pickers, trees, tables and keyboard drag and drop.
- Check what a copied component pulls in: shadcn's **Command** is built on cmdk, which is unmaintained (`guides/README.md`, Avoid).
- shadcn's AI components (the successor to AI Elements) can be copied in the same way; apply the defaults in `guides/agentic-ui.md`
  (e.g. add the live-region announcement none of the kits ship).

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
