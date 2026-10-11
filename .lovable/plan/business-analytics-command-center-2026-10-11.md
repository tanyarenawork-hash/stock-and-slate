# Business analytics command center

## Goal
Turn the main Stock and Slate screen into a polished, business-focused command center while preserving product entry, restock planning, what-if analysis, local browser storage, and the existing cream-and-teal identity.

## What will change

### 1. Executive overview
- Replace the introductory headline area with a compact dashboard header and an “Add product” primary action.
- Add a filter bar for product search, category, and inventory status, with a clear reset action.
- Expand the headline metrics to show estimated 30-day revenue, estimated 30-day profit, blended margin, inventory value at cost, and products requiring action.
- Add small supporting context to each metric, derived from the currently filtered products.

### 2. Financial analysis
- Add an estimated revenue-versus-cost-versus-profit chart for the last 30 days.
- Add a product contribution chart showing which products drive the most estimated profit.
- Surface margin health, loss-making products, and the main cost components using only entered values.

### 3. Inventory analysis
- Add an inventory health view that separates healthy, restock, no-sales, and overstock-risk products.
- Add a stock coverage chart comparing days remaining with supplier lead time.
- Add an action table prioritizing restocks, low-margin items, and cash tied up in slow-moving stock.

### 4. Category analysis
- Group products by category and compare estimated revenue, estimated profit, margin, units sold, and inventory value.
- Add a category performance chart and a compact sortable category table.

### 5. Operational tools
- Keep Products, Restock planner, What-if, and detailed Insights available beneath the command center.
- Make the product table denser and more businesslike while retaining edit and delete controls.
- Preserve the fictional sample-data label and all estimate disclaimers.

### 6. Responsive presentation
- Use a desktop analytics grid with restrained borders, tighter spacing, and clear chart legends.
- Reflow KPIs, filters, charts, and action rows into readable mobile layouts without hiding core information.
- Keep the refined warm cream, white, deep teal, amber, and charcoal visual direction.

## Technical details
- Compute every dashboard value from the existing product records and calculation functions; no invented trend history or external data.
- Treat all revenue and profit figures as 30-day estimates because the available sales input covers the last 30 days.
- Add focused analytics components for filters, KPI summaries, financial charts, inventory health, category performance, and action priorities.
- Reuse the existing Recharts and design-system components, extend semantic chart tokens where needed, and avoid adding persistence or login features.
- Update page metadata for the stronger business analytics positioning.
- Verify calculations for zero sales, negative profit, empty filters, and sample data, then check desktop and mobile rendering.
