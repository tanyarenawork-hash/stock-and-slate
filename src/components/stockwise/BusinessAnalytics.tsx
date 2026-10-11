import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, ArrowUpRight, CircleDollarSign, PackageOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { computeMetrics, money, num, pct, type Product } from "@/lib/stockwise";

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 12,
};

export function BusinessAnalytics({ products }: { products: Product[] }) {
  const rows = products.map((product) => ({ product, metrics: computeMetrics(product) }));
  const productFinancials = rows
    .map(({ product, metrics }) => ({
      name: product.name.length > 15 ? `${product.name.slice(0, 14)}…` : product.name,
      revenue: metrics.revenuePerUnit * product.sold30,
      cost: metrics.costPerUnit * product.sold30,
      profit: metrics.profit30,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 7);

  const categories = Array.from(
    rows.reduce((map, { product, metrics }) => {
      const key = product.category || "Uncategorized";
      const current = map.get(key) ?? {
        category: key,
        revenue: 0,
        profit: 0,
        inventory: 0,
        units: 0,
      };
      current.revenue += metrics.revenuePerUnit * product.sold30;
      current.profit += metrics.profit30;
      current.inventory += metrics.inventoryValue;
      current.units += product.sold30;
      map.set(key, current);
      return map;
    }, new Map<string, { category: string; revenue: number; profit: number; inventory: number; units: number }>()).values(),
  )
    .map((row) => ({ ...row, margin: row.revenue > 0 ? (row.profit / row.revenue) * 100 : 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  const inventoryHealth = [
    { name: "Restock", value: rows.filter(({ metrics }) => metrics.needsRestock).length, fill: "var(--chart-2)" },
    { name: "No sales", value: rows.filter(({ product }) => product.sold30 === 0).length, fill: "var(--chart-3)" },
    {
      name: "High cover",
      value: rows.filter(({ product, metrics }) =>
        product.sold30 > 0 && (metrics.daysRemaining ?? 0) > Math.max(product.leadTime * 3, 60),
      ).length,
      fill: "var(--chart-5)",
    },
    {
      name: "Healthy",
      value: rows.filter(({ product, metrics }) =>
        !metrics.needsRestock && product.sold30 > 0 && (metrics.daysRemaining ?? 0) <= Math.max(product.leadTime * 3, 60),
      ).length,
      fill: "var(--chart-4)",
    },
  ].filter((item) => item.value > 0);

  const coverage = rows
    .filter(({ metrics }) => metrics.daysRemaining !== null)
    .map(({ product, metrics }) => ({
      name: product.name.length > 12 ? `${product.name.slice(0, 11)}…` : product.name,
      days: metrics.daysRemaining ?? 0,
      leadTime: product.leadTime,
    }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 8);

  const actions = rows
    .map(({ product, metrics }) => {
      if (metrics.needsRestock) {
        return { product, type: "Restock", detail: `Order about ${metrics.suggestedOrder} units`, priority: 3 };
      }
      if (metrics.profitPerUnit < 0 || metrics.marginPct < 15) {
        return { product, type: "Margin", detail: `${pct(metrics.marginPct)} estimated margin`, priority: 2 };
      }
      if (product.sold30 === 0 && product.stock > 0) {
        return { product, type: "No sales", detail: `${money(metrics.inventoryValue)} held at cost`, priority: 1 };
      }
      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 6);

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <Card className="shadow-[var(--shadow-card)] xl:col-span-8">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">30-day financial performance</CardTitle>
              <CardDescription>Estimated revenue, costs, and profit by product.</CardDescription>
            </div>
            <Badge variant="secondary">Last 30 days</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productFinancials} margin={{ left: 0, right: 8, top: 8, bottom: 28 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} angle={-18} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => money(value)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" name="Revenue" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="cost" name="Cost" fill="var(--chart-3)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="var(--chart-4)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)] xl:col-span-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Inventory health</CardTitle>
          <CardDescription>Current product status across the catalogue.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={inventoryHealth} dataKey="value" nameKey="name" innerRadius={54} outerRadius={78} paddingAngle={3}>
                  {inventoryHealth.map((item) => <Cell key={item.name} fill={item.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {inventoryHealth.map((item) => (
              <div key={item.name} className="flex items-center justify-between border-t border-border pt-2 text-xs">
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-semibold tabular-nums">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)] xl:col-span-7">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Stock coverage and supplier lead time</CardTitle>
          <CardDescription>Products with fewer coverage days than lead time need attention.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={coverage} margin={{ left: 0, right: 8, top: 8, bottom: 24 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} angle={-18} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => `${num(value, 0)} days`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="days" name="Stock coverage" fill="var(--chart-1)" radius={[3, 3, 0, 0]} />
                <Line dataKey="leadTime" name="Lead time" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)] xl:col-span-5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Priority actions</CardTitle>
              <CardDescription>Highest-impact issues in the current view.</CardDescription>
            </div>
            <AlertTriangle className="size-4 text-warning-foreground" />
          </div>
        </CardHeader>
        <CardContent className="grid gap-1">
          {actions.length === 0 ? (
            <div className="grid min-h-52 place-items-center text-center text-sm text-muted-foreground">
              <div><PackageOpen className="mx-auto mb-2 size-5" />No immediate actions found.</div>
            </div>
          ) : actions.map((item) => (
            <div key={`${item.product.id}-${item.type}`} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <Badge variant={item.priority === 3 ? "default" : "secondary"}>{item.type}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="shadow-[var(--shadow-card)] xl:col-span-12">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Category performance</CardTitle>
              <CardDescription>Commercial performance and working capital by category.</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><CircleDollarSign className="size-3.5" /> Profit contribution</span>
              <span className="inline-flex items-center gap-1"><ArrowUpRight className="size-3.5" /> Margin quality</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 lg:grid-cols-5">
          <div className="h-64 lg:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories} layout="vertical" margin={{ left: 10, right: 12 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="category" width={80} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => money(value)} />
                <Bar dataKey="profit" name="Profit" fill="var(--chart-1)" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="overflow-x-auto lg:col-span-3">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Category</TableHead><TableHead className="text-right">Revenue</TableHead><TableHead className="text-right">Profit</TableHead><TableHead className="text-right">Margin</TableHead><TableHead className="text-right">Inventory</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {categories.map((row) => <TableRow key={row.category}>
                  <TableCell className="font-medium">{row.category}<span className="block text-xs font-normal text-muted-foreground">{row.units} units sold</span></TableCell>
                  <TableCell className="text-right tabular-nums">{money(row.revenue)}</TableCell>
                  <TableCell className={`text-right tabular-nums ${row.profit < 0 ? "text-destructive" : ""}`}>{money(row.profit)}</TableCell>
                  <TableCell className="text-right tabular-nums">{pct(row.margin)}</TableCell>
                  <TableCell className="text-right tabular-nums">{money(row.inventory)}</TableCell>
                </TableRow>)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}