import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Stockwise — how the estimates work" },
      {
        name: "description",
        content:
          "How Stockwise calculates profit per unit, reorder points and days of stock remaining, and where those estimates fall short.",
      },
      { property: "og:title", content: "About Stockwise" },
      {
        property: "og:description",
        content: "The business problem, the formulas used, and the limits of the estimates.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to dashboard
        </Link>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">About Stockwise</h1>

        <div className="mt-8 grid gap-6">
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="font-display text-xl">The problem</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-relaxed text-foreground/85">
              <p>
                Small online sellers usually track stock in one spreadsheet and profit in another —
                if at all. The result is ordering more of a product that barely breaks even after
                fees and shipping, while a genuinely profitable item goes out of stock during a long
                supplier lead time.
              </p>
              <p>
                Stockwise puts both sides in one view: what each product actually earns per sale,
                and when it needs to be reordered.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="font-display text-xl">How the calculations work</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 font-mono text-xs leading-relaxed text-foreground/85">
              <p>platform fee per unit = selling price × fee % ÷ 100</p>
              <p>cost per unit = unit cost + shipping + platform fee per unit</p>
              <p>profit per unit = selling price − cost per unit</p>
              <p>margin % = profit per unit ÷ selling price × 100</p>
              <p>inventory value = current stock × unit cost</p>
              <p>daily sales = units sold in last 30 days ÷ 30</p>
              <p>lead-time demand = daily sales × supplier lead time</p>
              <p>reorder point = lead-time demand + safety stock</p>
              <p>restock flag = current stock ≤ reorder point</p>
              <p>days of stock = current stock ÷ daily sales (hidden when daily sales = 0)</p>
              <p>30-day profit = profit per unit × units sold in last 30 days</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="font-display text-xl">Limits of the estimates</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm leading-relaxed text-foreground/85">
              <ul className="ml-5 list-disc space-y-2">
                <li>
                  Everything assumes the last 30 days repeat. Seasonality, promotions and viral
                  spikes are not modelled.
                </li>
                <li>
                  Overheads like returns, storage, ad spend, packaging and taxes are not included,
                  so real profit is usually lower.
                </li>
                <li>
                  Supplier lead times are treated as fixed; delays and partial shipments are not
                  accounted for.
                </li>
                <li>
                  The what-if calculator holds sales volume constant. Changing price normally
                  changes demand.
                </li>
                <li>
                  With zero recorded sales, no daily rate can be estimated and days of stock is not
                  shown.
                </li>
                <li>
                  Sample data is fictional and clearly labelled. Nothing here reflects real stores,
                  customers or integrations.
                </li>
              </ul>
              <p className="text-muted-foreground">
                Treat every figure as a planning estimate, not a guaranteed outcome. Data is saved
                only in your browser&apos;s local storage.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
