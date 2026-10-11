import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BarChart3,
  Boxes,
  CircleDollarSign,
  FilterX,
  PackageSearch,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessAnalytics } from "@/components/stockwise/BusinessAnalytics";
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
      { title: "Stock and Slate: Business analytics for online sellers" },
      {
        name: "description",
        content:
          "Stock and Slate turns product, profit, and inventory data into clear business analytics for small online sellers.",
      },
      { property: "og:title", content: "Stock and Slate: Business analytics command center" },
      {
        property: "og:description",
        content:
          "Analyze revenue, profit, margins, stock coverage, and category performance from your own store data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { products, ready, addProduct, updateProduct, removeProduct, loadSample, clearAll } =
    useProducts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category || "Uncategorized"))).sort(),
    [products],
  );
  const filteredProducts = useMemo(
    () => products.filter((product) => {
      const metrics = computeMetrics(product);
      const matchesQuery = `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "all" || (product.category || "Uncategorized") === category;
      const matchesStatus = status === "all"
        || (status === "restock" && metrics.needsRestock)
        || (status === "healthy" && !metrics.needsRestock && product.sold30 > 0)
        || (status === "nosales" && product.sold30 === 0)
        || (status === "loss" && metrics.profitPerUnit < 0);
      return matchesQuery && matchesCategory && matchesStatus;
    }),
    [products, query, category, status],
  );
  const metrics = filteredProducts.map(computeMetrics);
  const inventoryValue = metrics.reduce((s, m) => s + m.inventoryValue, 0);
  const profit30 = metrics.reduce((s, m) => s + m.profit30, 0);
  const revenue30 = filteredProducts.reduce((s, p, i) => s + (metrics[i]?.revenuePerUnit ?? 0) * p.sold30, 0);
  const avgMargin = revenue30 > 0 ? (profit30 / revenue30) * 100 : 0;
  const restockCount = metrics.filter((m) => m.needsRestock).length;
  const cost30 = revenue30 - profit30;
  const hasSample = products.some((p) => p.isSample);
  const filtersActive = query !== "" || category !== "all" || status !== "all";

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Boxes className="size-5" />
            </span>
            <div>
              <p className="font-display text-xl leading-none font-semibold">Stock and Slate</p>
              <p className="text-xs text-muted-foreground">Business analytics</p>
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

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        <section className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase text-primary">Command center</p>
              {hasSample && <Badge variant="secondary">Fictional demo data</Badge>}
            </div>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">Business performance overview</h1>
            <p className="mt-1 text-sm text-muted-foreground">Revenue, profitability, inventory health, and priorities from your current inputs.</p>
          </div>
          <Button onClick={openAdd}><Plus className="size-4" /> Add product</Button>
        </section>

        {!ready ? null : products.length === 0 ? (
          <Card className="shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="font-display text-2xl">Start with your catalogue</CardTitle>
              <CardDescription>
                 Add your first product, or load a fictional sample store to explore the analytics.
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
            <section className="mb-4 grid gap-3 border-y border-border bg-card px-4 py-4 sm:grid-cols-2 lg:grid-cols-5">
              <Kpi label="30-day revenue" value={money(revenue30)} note={`${filteredProducts.reduce((sum, p) => sum + p.sold30, 0)} units sold`} icon={CircleDollarSign} />
              <Kpi label="30-day profit" value={money(profit30)} note={`${money(cost30)} estimated costs`} icon={TrendingUp} />
              <Kpi label="Blended margin" value={pct(avgMargin)} note="Across selected sales" icon={BarChart3} />
              <Kpi label="Inventory at cost" value={money(inventoryValue)} note={`${filteredProducts.length} products selected`} icon={Boxes} />
              <Kpi
                label="Action required"
                value={`${restockCount} of ${filteredProducts.length}`}
                note="At or below reorder point"
                icon={PackageSearch}
                highlight={restockCount > 0}
              />
            </section>

            <section className="mb-4 grid gap-3 border border-border bg-card p-3 md:grid-cols-[1fr_220px_220px_auto]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input aria-label="Search products" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products or categories" className="pl-9" />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger aria-label="Filter by category"><SelectValue placeholder="All categories" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All categories</SelectItem>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger aria-label="Filter by status"><SelectValue placeholder="All statuses" /></SelectTrigger>
                <SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="restock">Restock</SelectItem><SelectItem value="healthy">Healthy</SelectItem><SelectItem value="nosales">No sales</SelectItem><SelectItem value="loss">Loss-making</SelectItem></SelectContent>
              </Select>
              <Button variant="ghost" disabled={!filtersActive} onClick={() => { setQuery(""); setCategory("all"); setStatus("all"); }}><FilterX className="size-4" /> Reset</Button>
            </section>

            {filteredProducts.length === 0 ? (
              <div className="mb-6 border border-border bg-card px-5 py-12 text-center"><PackageSearch className="mx-auto mb-3 size-6 text-muted-foreground" /><p className="font-medium">No products match these filters</p><p className="mt-1 text-sm text-muted-foreground">Reset the filters to return to the full business view.</p></div>
            ) : <div className="mb-6"><BusinessAnalytics products={filteredProducts} /></div>}

            <Tabs defaultValue="products" className="gap-4">
              <div className="border-b border-border">
              <TabsList className="h-auto flex-wrap bg-transparent p-0">
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="restock">Restock planner</TabsTrigger>
                <TabsTrigger value="whatif">What-if</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>
              </div>

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
                      products={filteredProducts}
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
                <RestockPlanner products={filteredProducts} />
              </TabsContent>

              <TabsContent value="whatif">
                <WhatIf products={filteredProducts} />
              </TabsContent>

              <TabsContent value="insights">
                <Insights products={filteredProducts} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        Stock and Slate stores your data only in this browser.{" "}
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
  note,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div className="min-w-0 border-b border-border pb-3 last:border-0 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3 sm:last:border-r-0">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">
            {label}
          </p>
          <p
            className={`mt-1 font-display text-2xl font-semibold tabular-nums ${highlight ? "text-warning-foreground" : ""}`}
          >
            {value}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{note}</p>
        </div>
        <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary-soft text-accent-foreground">
          <Icon className="size-4" />
        </span>
      </div>
    </div>
  );
}
