# Replace dashes in app copy with proper punctuation

Swap every em dash used as sentence punctuation in Stockwise's visible text for normal punctuation (commas, colons, periods). The bare "—" that appears in tables as a "no data yet" placeholder stays, since it marks a missing value rather than joining words.

## Changes

**src/routes/index.tsx**
- Page title / og:title: "Stockwise — Inventory & profit planning..." → "Stockwise: Inventory & profit planning..."
- Headline: "Which products should you restock — and will they make money?" → "Which products should you restock, and will they make money?"
- Badge: "Demo data — fictional sample store" → "Demo data: fictional sample store"

**src/routes/about.tsx**
- Page title: "About Stockwise — how the estimates work" → "About Stockwise: how the estimates work"
- First paragraph: "...profit in another — if at all." → "...profit in another, if at all."

**src/components/stockwise/WhatIf.tsx**
- Description: "Estimates only — not a guaranteed outcome." → "Estimates only, not a guaranteed outcome."

**src/components/stockwise/Insights.tsx**
- Observation sentence: "...is the weakest at X% margin — it currently loses money on every sale." → "...is the weakest at X% margin, and it currently loses money on every sale." (plain period kept for the healthy case)

**src/lib/stockwise.ts** (sample store product names)
- "Linen Apron — Sand" → "Linen Apron (Sand)"
- "Merino Beanie — Rust" → "Merino Beanie (Rust)"

## Verification
- Search `src/` afterward to confirm no punctuation em dashes remain in user-facing copy.
- Type check passes and the dashboard and About page load.
