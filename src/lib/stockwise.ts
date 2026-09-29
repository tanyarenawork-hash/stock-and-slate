export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  unitCost: number;
  shipping: number;
  feePct: number;
  stock: number;
  sold30: number;
  leadTime: number;
  safetyStock: number;
  isSample?: boolean;
};

export type Metrics = {
  revenuePerUnit: number;
  feePerUnit: number;
  costPerUnit: number;
  profitPerUnit: number;
  marginPct: number;
  inventoryValue: number;
  dailySales: number;
  leadTimeDemand: number;
  reorderPoint: number;
  daysRemaining: number | null;
  needsRestock: boolean;
  suggestedOrder: number;
  profit30: number;
  urgency: number;
};

const n = (v: number) => (Number.isFinite(v) ? v : 0);

export function computeMetrics(p: Product): Metrics {
  const revenuePerUnit = n(p.price);
  const feePerUnit = revenuePerUnit * (n(p.feePct) / 100);
  const costPerUnit = n(p.unitCost) + n(p.shipping) + feePerUnit;
  const profitPerUnit = revenuePerUnit - costPerUnit;
  const marginPct = revenuePerUnit > 0 ? (profitPerUnit / revenuePerUnit) * 100 : 0;
  const inventoryValue = n(p.stock) * n(p.unitCost);
  const dailySales = n(p.sold30) / 30;
  const leadTimeDemand = dailySales * n(p.leadTime);
  const reorderPoint = leadTimeDemand + n(p.safetyStock);
  const daysRemaining = dailySales > 0 ? n(p.stock) / dailySales : null;
  const needsRestock = n(p.stock) <= reorderPoint;
  const suggestedOrder = Math.max(0, Math.ceil(reorderPoint - n(p.stock) + leadTimeDemand));
  const profit30 = profitPerUnit * n(p.sold30);
  const urgency =
    daysRemaining === null
      ? needsRestock
        ? 0.5
        : 0
      : Math.max(0, Math.min(2, (n(p.leadTime) + 1) / Math.max(daysRemaining, 0.5)));
  return {
    revenuePerUnit,
    feePerUnit,
    costPerUnit,
    profitPerUnit,
    marginPct,
    inventoryValue,
    dailySales,
    leadTimeDemand,
    reorderPoint,
    daysRemaining,
    needsRestock,
    suggestedOrder,
    profit30,
    urgency,
  };
}

export const money = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number.isFinite(v) ? v : 0,
  );

export const pct = (v: number) => `${(Number.isFinite(v) ? v : 0).toFixed(1)}%`;
export const num = (v: number, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : "—");

export const emptyProduct = (): Omit<Product, "id"> => ({
  name: "",
  category: "",
  price: 0,
  unitCost: 0,
  shipping: 0,
  feePct: 0,
  stock: 0,
  sold30: 0,
  leadTime: 7,
  safetyStock: 0,
});

const STORAGE_KEY = "stockwise.products.v1";

export function loadProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Product[]) : [];
  } catch {
    return [];
  }
}

export function saveProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    /* storage unavailable */
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export const sampleProducts = (): Product[] =>
  [
    {
      name: "Linen Apron — Sand",
      category: "Home",
      price: 48,
      unitCost: 16.5,
      shipping: 4.2,
      feePct: 12,
      stock: 34,
      sold30: 62,
      leadTime: 18,
      safetyStock: 15,
    },
    {
      name: "Ceramic Pour-Over Set",
      category: "Kitchen",
      price: 89,
      unitCost: 38,
      shipping: 7.5,
      feePct: 12,
      stock: 12,
      sold30: 21,
      leadTime: 25,
      safetyStock: 8,
    },
    {
      name: "Beeswax Wrap 3-Pack",
      category: "Kitchen",
      price: 24,
      unitCost: 9.1,
      shipping: 2.4,
      feePct: 15,
      stock: 210,
      sold30: 140,
      leadTime: 10,
      safetyStock: 40,
    },
    {
      name: "Walnut Phone Stand",
      category: "Desk",
      price: 32,
      unitCost: 18.75,
      shipping: 3.1,
      feePct: 15,
      stock: 88,
      sold30: 18,
      leadTime: 12,
      safetyStock: 10,
    },
    {
      name: "Merino Beanie — Rust",
      category: "Apparel",
      price: 39,
      unitCost: 14,
      shipping: 3.6,
      feePct: 10,
      stock: 6,
      sold30: 47,
      leadTime: 21,
      safetyStock: 20,
    },
    {
      name: "Enamel Camp Mug",
      category: "Outdoor",
      price: 22,
      unitCost: 11.4,
      shipping: 3.9,
      feePct: 12,
      stock: 130,
      sold30: 0,
      leadTime: 14,
      safetyStock: 25,
    },
  ].map((p) => ({ ...p, id: uid(), isSample: true }));
