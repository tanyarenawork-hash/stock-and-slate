import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { computeMetrics, money, pct, type Product } from "@/lib/stockwise";

const inputs = [
  { key: "price", label: "Selling price ($)", step: "0.01" },
  { key: "unitCost", label: "Unit cost ($)", step: "0.01" },
  { key: "shipping", label: "Shipping per unit ($)", step: "0.01" },
  { key: "feePct", label: "Platform fee (%)", step: "0.1" },
] as const;

export function WhatIf({ products }: { products: Product[] }) {
  const [id, setId] = useState(products[0]?.id ?? "");
  const base = products.find((p) => p.id === id) ?? products[0];
  const [draft, setDraft] = useState<Product | null>(base ?? null);

  useEffect(() => {
    setDraft(base ? { ...base } : null);
  }, [base]);

  const current = useMemo(() => (base ? computeMetrics(base) : null), [base]);
  const proposed = useMemo(() => (draft ? computeMetrics(draft) : null), [draft]);

  if (!base || !draft || !current || !proposed) return null;

  const deltaProfit = proposed.profitPerUnit - current.profitPerUnit;
  const deltaMargin = proposed.marginPct - current.marginPct;
  const delta30 = (proposed.profitPerUnit - current.profitPerUnit) * base.sold30;

  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardHeader>
        <CardTitle className="font-display text-xl">What-if calculator</CardTitle>
        <CardDescription>
          Adjust the numbers to see an estimated effect on profit per unit. Estimates only — not a
          guaranteed outcome.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="whatif-product">Product</Label>
            <Select
              value={base.id}
              onValueChange={(v) => setId(v)}
            >
              <SelectTrigger id="whatif-product">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {inputs.map((f) => (
              <div key={f.key} className="grid gap-1.5">
                <Label htmlFor={`wi-${f.key}`}>{f.label}</Label>
                <Input
                  id={`wi-${f.key}`}
                  type="number"
                  min={0}
                  step={f.step}
                  inputMode="decimal"
                  value={String(draft[f.key])}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      [f.key]: e.target.value === "" ? 0 : Math.max(0, Number(e.target.value)),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Current: {f.key === "feePct" ? `${base[f.key]}%` : money(base[f.key])}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid grid-cols-3 items-center gap-2 rounded-xl border border-border bg-muted/50 p-4 text-sm font-medium">
            <span>Metric</span>
            <span className="text-right">Current</span>
            <span className="text-right">Proposed</span>
          </div>
          {[
            { label: "Revenue per unit", a: money(current.revenuePerUnit), b: money(proposed.revenuePerUnit) },
            { label: "Total cost per unit", a: money(current.costPerUnit), b: money(proposed.costPerUnit) },
            { label: "Profit per unit", a: money(current.profitPerUnit), b: money(proposed.profitPerUnit) },
            { label: "Margin", a: pct(current.marginPct), b: pct(proposed.marginPct) },
          ].map((r) => (
            <div key={r.label} className="grid grid-cols-3 items-center gap-2 px-4 text-sm">
              <span className="text-muted-foreground">{r.label}</span>
              <span className="text-right tabular-nums">{r.a}</span>
              <span className="text-right font-semibold tabular-nums">{r.b}</span>
            </div>
          ))}
          <div className="rounded-xl bg-primary-soft p-4 text-sm text-accent-foreground">
            <p className="flex items-center gap-2 font-medium">
              Change <ArrowRight className="size-4" />{" "}
              {deltaProfit >= 0 ? "+" : ""}
              {money(deltaProfit)} per unit ({deltaMargin >= 0 ? "+" : ""}
              {deltaMargin.toFixed(1)} pts of margin)
            </p>
            <p className="mt-1">
              At last month&apos;s volume of {base.sold30} units, that would have been an estimated{" "}
              {delta30 >= 0 ? "+" : ""}
              {money(delta30)} in profit. Actual results depend on demand, which may change with
              price.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
