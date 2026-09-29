import { useCallback, useEffect, useState } from "react";
import {
  loadProducts,
  saveProducts,
  sampleProducts,
  uid,
  type Product,
} from "@/lib/stockwise";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setProducts(loadProducts());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveProducts(products);
  }, [products, ready]);

  const addProduct = useCallback((p: Omit<Product, "id">) => {
    setProducts((prev) => [...prev, { ...p, id: uid() }]);
  }, []);

  const updateProduct = useCallback((p: Product) => {
    setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
  }, []);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const loadSample = useCallback(() => setProducts(sampleProducts()), []);
  const clearAll = useCallback(() => setProducts([]), []);

  return { products, ready, addProduct, updateProduct, removeProduct, loadSample, clearAll };
}
