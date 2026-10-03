"use client";

import { useEffect } from "react";
import { trackViewItem, productToGaItem } from "@/lib/analytics/gtm";
import type { CatalogProduct } from "@/lib/catalog";

export default function TrackViewItem({ product }: { product: CatalogProduct }) {
  useEffect(() => {
    trackViewItem(productToGaItem(product, 1, product.price));
    // Only the product's own identity should re-trigger this, not an
    // unrelated re-render of the page it's mounted on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.sku]);

  return null;
}
