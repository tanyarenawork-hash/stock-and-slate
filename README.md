# Stock & Slate

Stock & Slate is an inventory and profit planning dashboard designed to help small online sellers evaluate product margins, anticipate restocking needs, and explore pricing scenarios.

## The Problem

A product's selling price alone does not reveal its profitability. Sellers also need to account for product costs, shipping expenses, platform fees, inventory levels, and supplier lead times.

Stock & Slate brings these inputs together in a dashboard to support everyday business decisions.

## Features

- **Product Management:** Add, edit, and delete products and their financial and inventory details.
- **Profit Analysis:** Calculate estimated profit per unit, profit margin, and inventory value.
- **Restock Planner:** Identify products that may need replenishment based on sales pace, supplier lead time, and safety stock.
- **What-If Calculator:** Compare the effect of changes to pricing, costs, shipping, and platform fees.
- **Product Insights:** Compare products by margin, estimated profit, and restock urgency.
- **Sample Store:** Explore the dashboard using clearly labeled fictional data.
- **Browser Storage:** Save product information locally between sessions.

## Core Calculations

Platform fee per unit:
Selling price × Platform fee percentage ÷ 100

Estimated profit per unit:
Selling price − Unit cost − Shipping cost − Platform fee per unit

Estimated profit margin:
Estimated profit per unit ÷ Selling price × 100

Inventory value at cost:
Current stock × Unit cost

Average daily sales:
Units sold in the last 30 days ÷ 30

Reorder threshold:
(Average daily sales × Supplier lead time) + Safety stock

Estimated days of stock remaining:
Current stock ÷ Average daily sales

Zero selling prices and zero sales require special handling to avoid division by zero.

## Assumptions and Limitations

- Recent sales are used as an estimate of future demand.
- Supplier lead times are assumed to remain consistent.
- Profit estimates include only the costs entered.
- Taxes, returns, advertising, storage fees, and other overhead are not included unless added to the model.
- Sample data does not represent actual business performance.

## Built With

Created with AI-assisted development using Lovable.

See `package.json` for the project's dependencies and available commands.

## Running Locally

Requires Node.js and npm.

1. Clone this repository.
2. Open a terminal in the project directory.
3. Install dependencies:

   npm install

4. Start the development server:

   npm run dev

5. Open the local URL displayed in the terminal.

## Data Storage

Product data is stored in the user's browser using local storage. Clearing browser storage may remove saved products.

## Project Status

Independent portfolio project inspired by online selling experience. This repository contains the source code; the app is not deployed as a public website.

## Future Improvements

- Import and export product data using CSV files.
- Add advertising, returns, and overhead costs.
- Introduce seasonal demand scenarios.
- Compare estimated performance with actual sales history.
