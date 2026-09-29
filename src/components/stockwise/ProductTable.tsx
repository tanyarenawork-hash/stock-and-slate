import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { computeMetrics, money, num, pct, type Product } from "@/lib/stockwise";

export function ProductTable({
  products,
  onEdit,
  onDelete,
}: {
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Profit / unit</TableHead>
            <TableHead className="text-right">Margin</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-right">Days left</TableHead>
            <TableHead className="text-right">Inv. value</TableHead>
            <TableHead className="text-right">Status</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => {
            const m = computeMetrics(p);
            return (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.category}</div>
                </TableCell>
                <TableCell className="text-right tabular-nums">{money(m.revenuePerUnit)}</TableCell>
                <TableCell
                  className={`text-right tabular-nums ${m.profitPerUnit < 0 ? "text-destructive" : ""}`}
                >
                  {money(m.profitPerUnit)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{pct(m.marginPct)}</TableCell>
                <TableCell className="text-right tabular-nums">{p.stock}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {m.daysRemaining === null ? "—" : num(m.daysRemaining, 0)}
                </TableCell>
                <TableCell className="text-right tabular-nums">{money(m.inventoryValue)}</TableCell>
                <TableCell className="text-right">
                  {m.needsRestock ? (
                    <Badge className="bg-warning text-warning-foreground hover:bg-warning">
                      Restock
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Healthy</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${p.name}`}
                      onClick={() => onEdit(p)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete ${p.name}`}
                      onClick={() => onDelete(p)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
