import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { computeMetrics, num, type Product } from "@/lib/stockwise";

export function RestockPlanner({ products }: { products: Product[] }) {
  const rows = products
    .map((p) => ({ p, m: computeMetrics(p) }))
    .sort((a, b) => b.m.urgency - a.m.urgency);

  return (
    <div className="grid gap-4">
      {rows.map(({ p, m }) => (
        <Card key={p.id} className="shadow-[var(--shadow-card)]">
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">{p.name}</CardTitle>
              <CardDescription>
                {m.dailySales > 0
                  ? `${num(m.dailySales, 2)} units/day · about ${num(m.daysRemaining ?? 0, 0)} days of stock left`
                  : "No sales recorded in the last 30 days"}
              </CardDescription>
            </div>
            {m.needsRestock ? (
              <Badge className="bg-warning text-warning-foreground hover:bg-warning">
                <AlertTriangle className="mr-1 size-3.5" /> Restock suggested
              </Badge>
            ) : (
              <Badge variant="secondary">
                <CheckCircle2 className="mr-1 size-3.5" /> Stock looks fine
              </Badge>
            )}
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-sm text-foreground/80">
              {m.dailySales > 0 ? (
                <>
                  You sold {p.sold30} units in 30 days, so roughly {num(m.dailySales, 2)} a day. Over
                  a {p.leadTime}-day supplier lead time you would expect to sell about{" "}
                  {num(m.leadTimeDemand, 0)} units. Adding your {p.safetyStock}-unit safety buffer
                  gives a reorder point of {num(m.reorderPoint, 0)} units, and you currently hold{" "}
                  {p.stock}.{" "}
                  {m.needsRestock
                    ? `That is at or below the reorder point, so an order of roughly ${m.suggestedOrder} units would be a reasonable estimate.`
                    : "That is above the reorder point, so there is no estimated need to order yet."}
                </>
              ) : (
                <>
                  No units sold in the last 30 days, so a daily sales rate cannot be estimated and
                  days of stock remaining is not shown. The reorder point falls back to your safety
                  stock of {p.safetyStock} units against {p.stock} units on hand.
                </>
              )}
            </p>
            <div className="rounded-lg bg-muted/70 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
              daily sales = units sold (30d) ÷ 30 = {num(m.dailySales, 3)}
              <br />
              lead-time demand = daily sales × lead time = {num(m.leadTimeDemand, 2)}
              <br />
              reorder point = lead-time demand + safety stock = {num(m.reorderPoint, 2)}
              <br />
              days of stock = current stock ÷ daily sales ={" "}
              {m.daysRemaining === null ? "n/a (no sales)" : num(m.daysRemaining, 1)}
            </div>
            <p className="text-xs text-muted-foreground">
              These are estimates based on the last 30 days only, not a guaranteed outcome.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
