import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { emptyProduct, type Product } from "@/lib/stockwise";

type Draft = Omit<Product, "id"> & { id?: string };

const fields: {
  key: keyof Omit<Product, "id" | "name" | "category" | "isSample">;
  label: string;
  step?: string;
  hint?: string;
}[] = [
  { key: "price", label: "Selling price ($)", step: "0.01" },
  { key: "unitCost", label: "Unit cost ($)", step: "0.01" },
  { key: "shipping", label: "Shipping cost per unit ($)", step: "0.01" },
  { key: "feePct", label: "Platform fee (%)", step: "0.1" },
  { key: "stock", label: "Current stock (units)" },
  { key: "sold30", label: "Units sold, last 30 days" },
  { key: "leadTime", label: "Supplier lead time (days)" },
  { key: "safetyStock", label: "Target safety stock (units)" },
];

export function ProductDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Product | null;
  onSave: (p: Draft) => void;
}) {
  const [draft, setDraft] = useState<Draft>(emptyProduct());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setDraft(initial ? { ...initial } : emptyProduct());
      setErrors({});
    }
  }, [open, initial]);

  const set = (key: string, value: string | number) =>
    setDraft((d) => ({ ...d, [key]: value }) as Draft);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!draft.name.trim()) next["name"] = "Product name is required.";
    if (draft.price <= 0) next["price"] = "Selling price must be greater than 0.";
    if (draft.feePct < 0 || draft.feePct > 100) next["feePct"] = "Fee must be between 0 and 100.";
    for (const f of fields) {
      const v = Number(draft[f.key]);
      if (!Number.isFinite(v) || v < 0) next[f.key] = "Enter a number of 0 or more.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave({ ...draft, name: draft.name.trim(), category: draft.category.trim() || "Uncategorized" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {initial ? "Edit product" : "Add product"}
          </DialogTitle>
          <DialogDescription>
            All profit and restock figures are calculated from these inputs.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <div className="grid gap-1.5 sm:col-span-1">
            <Label htmlFor="name">Product name</Label>
            <Input
              id="name"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={!!errors["name"]}
              aria-describedby={errors["name"] ? "err-name" : undefined}
            />
            {errors["name"] && (
              <p id="err-name" className="text-xs text-destructive">
                {errors["name"]}
              </p>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={draft.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. Kitchen"
            />
          </div>
          {fields.map((f) => (
            <div key={f.key} className="grid gap-1.5">
              <Label htmlFor={f.key}>{f.label}</Label>
              <Input
                id={f.key}
                type="number"
                min={0}
                step={f.step ?? "1"}
                inputMode="decimal"
                value={String(draft[f.key] ?? 0)}
                onChange={(e) => set(f.key, e.target.value === "" ? 0 : Number(e.target.value))}
                aria-invalid={!!errors[f.key]}
                aria-describedby={errors[f.key] ? `err-${f.key}` : undefined}
              />
              {errors[f.key] && (
                <p id={`err-${f.key}`} className="text-xs text-destructive">
                  {errors[f.key]}
                </p>
              )}
            </div>
          ))}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{initial ? "Save changes" : "Add product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
