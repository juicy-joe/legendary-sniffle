"use client";

// Makes the product catalog (fetched once, server-side, in the (site) root
// layout) available synchronously to client components — the cart, the
// checkout summary, and the products filter/sort UI all need to look up a
// product by slug without an extra round trip.
import { createContext, useContext, useMemo } from "react";
import type { CatalogProduct } from "@/lib/catalog";

type CatalogContextValue = {
  products: CatalogProduct[];
  categories: string[];
  getProduct: (slug: string) => CatalogProduct | undefined;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({
  products,
  children,
}: {
  products: CatalogProduct[];
  children: React.ReactNode;
}) {
  const value = useMemo<CatalogContextValue>(() => {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return {
      products,
      categories: Array.from(new Set(products.map((p) => p.category))),
      getProduct: (slug: string) => bySlug.get(slug),
    };
  }, [products]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
