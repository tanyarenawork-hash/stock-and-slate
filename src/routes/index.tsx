import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Boxes, Plus, Sparkles, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Insights } from "@/components/stockwise/Insights";
import { ProductDialog } from "@/components/stockwise/ProductDialog";
import { ProductTable } from "@/components/stockwise/ProductTable";
import { RestockPlanner } from "@/components/stockwise/RestockPlanner";
import { WhatIf } from "@/components/stockwise/WhatIf";
import { useProducts } from "@/hooks/useProducts";
import { computeMetrics, money, pct, type Product } from "@/lib/stockwise";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Stockwise — Inventory & profit planning for online sellers" },
      {
        name: "description",
        content:
          "Stockwise shows which products to restock and whether they actually make money, with profit margins, reorder points and what-if pricing.",
      },
      { property: "og:title", content: "Stockwise — Inventory & profit planning" },
      {
        property: "og:description",
        content:
          "Track margins, reorder points and days of stock remaining for your online store, all calculated from your own numbers.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { products, ready, addProduct, updateProduct, removeProduct, loadSample, clearAll } =
    useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const metrics = products.map(computeMetrics);
  const inventoryValue = metrics.reduce((s, m) => s + m.inventoryValue, 0);
  const profit30 = metrics.reduce((s, m) => s + m.profit30, 0);
  const revenue30 = products.reduce((s, p, i) => s + (metrics[i]?.revenuePerUnit ?? 0) * p.sold30, 0);
  const avgMargin = revenue30 > 0 ? (profit30 / revenue30) * 100 : 0;
  const restockCount = metrics.filter((m) => m.needsRestock).length;
  const hasSample = products.some((p) => p.isSample);

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Boxes className="size-5" />
            </span>
            <div>
              <p className="font-display text-xl leading-none font-semibold">Stockwise</p>
              <p className="text-xs text-muted-foreground">Inventory & profit planning</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/about"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              About
            </Link>
            <Button variant="outline" size="sm" onClick={loadSample}>
              <Sparkles className="mr-1.5 size-4" /> Load sample store
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={products.length === 0}>
                  <Trash2 className="mr-1.5 size-4" /> Clear data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all products?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This removes every product saved in this browser. It cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      clearAll();
                      toast.success("All products cleared");
                    }}
                  >
                    Clear everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button size="sm" onClick={openAdd}>
              <Plus className="mr-1.5 size-4" /> Add product
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <section className="mb-8">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Which products should you restock — and will they make money?
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Every figure below is calculated from the numbers you enter. All results are estimates,
            not guaranteed outcomes.
          </p>
          {hasSample && (
            <Badge variant="secondary" className="mt-3">
              Demo data — fictional sample store
            </Badge>
          )}
        </section>

        {!ready ? null : products.length === 0 ? (
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Start with your catalogue</CardTitle>
              <CardDescription>
                Add your first product, or load a fictional sample store to explore the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button onClick={openAdd}>
                <Plus className="mr-1.5 size-4" /> Add product
              </Button>
              <Button variant="outline" onClick={loadSample}>
                <Sparkles className="mr-1.5 size-4" /> Load sample store
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi label="Inventory value (at cost)" value={money(inventoryValue)} icon={Boxes} />
              <Kpi label="Estimated 30-day profit" value={money(profit30)} icon={TrendingUp} />
              <Kpi label="Blended margin" value={pct(avgMargin)} icon={BarChart3} />
              <Kpi
                label="Products to restock"
                value={`${restockCount} of ${products.length}`}
                icon={Sparkles}
                highlight={restockCount > 0}
              />
            </section>

            <Tabs defaultValue="products" className="gap-6">
              <TabsList className="flex-wrap">
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="restock">Restock planner</TabsTrigger>
                <TabsTrigger value="whatif">What-if</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <Card className="shadow-[var(--shadow-card)]">
                  <CardHeader>
                    <CardTitle className="font-display text-xl">Product dashboard</CardTitle>
                    <CardDescription>
                      Profit per unit = price − unit cost − shipping − platform fee.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0 sm:px-6">
                    <ProductTable
                      products={products}
                      onEdit={(p) => {
                        setEditing(p);
                        setDialogOpen(true);
                      }}
                      onDelete={(p) => {
                        removeProduct(p.id);
                        toast.success(`${p.name} deleted`);
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="restock">
                <RestockPlanner products={products} />
              </TabsContent>

              <TabsContent value="whatif">
                <WhatIf products={products} />
              </TabsContent>

              <TabsContent value="insights">
                <Insights products={products} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Stockwise stores your data only in this browser.{" "}
        <Link to="/about" className="underline underline-offset-4">
          How the calculations work
        </Link>
      </footer>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSave={(p) => {
          if (editing) {
            updateProduct({ ...(p as Product), id: editing.id });
            toast.success("Product updated");
          } else {
            addProduct(p);
            toast.success("Product added");
          }
        }}
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <Card className="shadow-[var(--shadow-card)]">
      <CardContent className="flex items-start justify-between gap-3 pt-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          <p
            className={`mt-2 font-display text-2xl font-semibold tabular-nums ${highlight ? "text-warning-foreground" : ""}`}
          >
            {value}
          </p>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-accent-foreground">
          <Icon className="size-4" />
        </span>
      </CardContent>
    </Card>
  );
}
