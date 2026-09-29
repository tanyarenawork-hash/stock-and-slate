import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { computeMetrics, money, num, pct, type Product } from "@/lib/stockwise";

type SortKey = "margin" | "profit" | "urgency";

export function Insights({ products }: { products: Product[] }) {
  const [sort, setSort] = useState<SortKey>("margin");
  const rows = products.map((p) => ({ p, m: computeMetrics(p) }));

  const sorted = [...rows].sort((a, b) => {
    if (sort === "margin") return b.m.marginPct - a.m.marginPct;
    if (sort === "profit") return b.m.profit30 - a.m.profit30;
    return b.m.urgency - a.m.urgency;
  });

  const chartData = sorted.slice(0, 8).map(({ p, m }) => ({
    name: p.name.length > 16 ? `${p.name.slice(0, 15)}…` : p.name,
    value: sort === "margin" ? m.marginPct : sort === "profit" ? m.profit30 : m.urgency * 100,
  }));

  const hasSample = products.some((p) => p.isSample);
  const best = [...rows].sort((a, b) => b.m.marginPct - a.m.marginPct)[0];
  const worst = [...rows].sort((a, b) => a.m.marginPct - b.m.marginPct)[0];
  const topEarner = [...rows].sort((a, b) => b.m.profit30 - a.m.profit30)[0];
  const restocks = rows.filter((r) => r.m.needsRestock);
  const noSales = rows.filter((r) => r.p.sold30 === 0);
  const tiedCapital = rows.reduce((s, r) => s + r.m.inventoryValue, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="shadow-[var(--shadow-card)] lg:col-span-3">
        <CardHeader className="gap-3">
          <div>
            <CardTitle className="font-display text-xl">Product ranking</CardTitle>
            <CardDescription>
              {hasSample ? "Includes demo data you loaded. " : ""}Calculated from the values you
              entered.
            </CardDescription>
          </div>
          <Tabs value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <TabsList>
              <TabsTrigger value="margin">Margin</TabsTrigger>
              <TabsTrigger value="profit">30-day profit</TabsTrigger>
              <TabsTrigger value="urgency">Restock urgency</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: 4, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={48} />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) =>
                    sort === "profit" ? money(v) : sort === "margin" ? pct(v) : num(v, 0)
                  }
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.value < 0 ? "var(--destructive)" : "var(--primary)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ol className="mt-4 grid gap-2">
            {sorted.map(({ p, m }, i) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <span className="truncate">
                  <span className="mr-2 text-muted-foreground tabular-nums">{i + 1}.</span>
                  {p.name}
                </span>
                <span className="shrink-0 font-medium tabular-nums">
                  {sort === "margin"
                    ? pct(m.marginPct)
                    : sort === "profit"
                      ? money(m.profit30)
                      : m.needsRestock
                        ? "Restock now"
                        : `${m.daysRemaining === null ? "—" : num(m.daysRemaining, 0) + " days"}`}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)] lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-display text-xl">Observations</CardTitle>
          <CardDescription>Generated from your current numbers.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 text-sm text-foreground/85">
            {best && (
              <li>
                <strong>{best.p.name}</strong> has the highest estimated margin at{" "}
                {pct(best.m.marginPct)} ({money(best.m.profitPerUnit)} per unit).
              </li>
            )}
            {worst && worst.p.id !== best?.p.id && (
              <li>
                <strong>{worst.p.name}</strong> is the weakest at {pct(worst.m.marginPct)} margin
                {worst.m.profitPerUnit < 0 ? " — it currently loses money on every sale." : "."}
              </li>
            )}
            {topEarner && (
              <li>
                Most estimated profit in the last 30 days: <strong>{topEarner.p.name}</strong> at{" "}
                {money(topEarner.m.profit30)} from {topEarner.p.sold30} units.
              </li>
            )}
            <li>
              {restocks.length === 0
                ? "No products are at or below their reorder point right now."
                : `${restocks.length} product${restocks.length > 1 ? "s are" : " is"} at or below the reorder point: ${restocks.map((r) => r.p.name).join(", ")}.`}
            </li>
            {noSales.length > 0 && (
              <li>
                {noSales.length} product{noSales.length > 1 ? "s have" : " has"} no sales in the last
                30 days, so days-of-stock cannot be estimated for{" "}
                {noSales.map((r) => r.p.name).join(", ")}.
              </li>
            )}
            <li>
              About <strong>{money(tiedCapital)}</strong> of cash is tied up in current inventory at
              cost.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
