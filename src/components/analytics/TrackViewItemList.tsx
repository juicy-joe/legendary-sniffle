"use client";

import { useEffect } from "react";
import { trackViewItemList, productToGaItem } from "@/lib/analytics/gtm";
import type { CatalogProduct } from "@/lib/catalog";

export default function TrackViewItemList({
  products,
  listName,
}: {
  products: CatalogProduct[];
  listName: string;
}) {
  useEffect(() => {
    if (products.length === 0) return;
    trackViewItemList(
      products.map((p) => productToGaItem(p, undefined, p.price)),
      listName
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listName, products.map((p) => p.sku).join(",")]);

  return null;
}
