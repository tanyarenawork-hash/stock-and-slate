# Rename the site to "Stock and Slate"

Replace the user-facing name "Stockwise" with "Stock and Slate" everywhere it appears to visitors. File and folder names (`src/lib/stockwise.ts`, `src/components/stockwise/`) and the localStorage key (`stockwise.products.v1`) are internal identifiers, so they stay unchanged; this also keeps any saved products intact.

## Changes

1. `src/routes/index.tsx`
   - Page title: "Stock and Slate: Inventory & profit planning for online sellers"
   - og:title: "Stock and Slate: Inventory & profit planning"
   - Description and og:description: swap "Stockwise shows..." → "Stock and Slate shows..."
   - Header logo text: "Stock and Slate"
   - Footer line: "Stock and Slate stores your data only in this browser."

2. `src/routes/about.tsx`
   - Title: "About Stock and Slate: how the estimates work"
   - og:title: "About Stock and Slate"
   - Description/og:description: swap the "Stockwise" mentions
   - Page heading: "About Stock and Slate"
   - Body: "Stock and Slate puts both sides in one view: ..."

3. `src/routes/__root.tsx`
   - Root fallback title "Lovable App" → "Stock and Slate" and description "Lovable Generated Project" → "Inventory & profit planning for online sellers" (og matches). This only shows if the app ever renders without a page title.

## Verification

- `rg -i "stockwise"` over user-facing copy shows no remaining matches (only import paths and the storage key remain).
- Typecheck passes; both `/` and `/about` load with the new name in the header, titles, and footer.
