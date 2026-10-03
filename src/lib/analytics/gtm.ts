"use client";

// Centralized GA4 ecommerce event layer — every tracking call in the app
// goes through one of these functions rather than each component pushing
// its own ad-hoc dataLayer shape. item_id is always the stable Olleria
// SKU (TL####), never the slug or an internal database id, so the same
// identifier lines up across GA4, Google Ads, Merchant Center, and order
// records (see Product.sku's doc comment in schema.prisma).
import type { CatalogProduct } from "@/lib/catalog";

export type GaItem = {
  item_id: string;
  item_name: string;
  item_brand: string;
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity?: number;
  discount?: number;
  currency: string;
};

const CURRENCY = "EUR";
const BRAND = "Ollerialight";

export function productToGaItem(
  product: Pick<CatalogProduct, "sku" | "name" | "category" | "collection">,
  quantity?: number,
  price?: number
): GaItem {
  return {
    item_id: product.sku,
    item_name: product.name,
    item_brand: BRAND,
    item_category: product.category,
    item_variant: product.collection,
    price: price ?? 0,
    ...(quantity !== undefined ? { quantity } : {}),
    currency: CURRENCY,
  };
}

function push(event: string, ecommerce: Record<string, unknown> | null) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // GA4's own recommendation: clear the previous "ecommerce" object before
  // pushing a new one, so values from an earlier event (e.g. a prior page's
  // view_item) can't leak into this one by Object.assign-style merging.
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({ event, ecommerce });
}

export function trackViewItemList(items: GaItem[], listName: string) {
  push("view_item_list", { item_list_name: listName, items });
}

export function trackViewItem(item: GaItem) {
  push("view_item", { currency: CURRENCY, value: item.price, items: [item] });
}

export function trackAddToCart(item: GaItem) {
  push("add_to_cart", { currency: CURRENCY, value: item.price * (item.quantity ?? 1), items: [item] });
}

export function trackRemoveFromCart(item: GaItem) {
  push("remove_from_cart", { currency: CURRENCY, value: item.price * (item.quantity ?? 1), items: [item] });
}

export function trackViewCart(items: GaItem[], value: number) {
  push("view_cart", { currency: CURRENCY, value, items });
}

export function trackBeginCheckout(items: GaItem[], value: number, coupon?: string) {
  push("begin_checkout", { currency: CURRENCY, value, items, ...(coupon ? { coupon } : {}) });
}

export type PurchaseInput = {
  transactionId: string;
  value: number;
  shipping?: number;
  tax?: number;
  items: GaItem[];
  userData?: { sha256Email?: string };
};

/** Fired exactly once per order — see ClearCartOnMount's sibling
 * PurchaseTracker component for the sessionStorage dedup that guarantees
 * "once" even across a confirmation-page refresh. transaction_id is the
 * order's own orderNumber (e.g. "SFL-123456"), which is also what the
 * customer sees, so a support conversation and a GA4 report can always be
 * matched to the same real order. */
export function trackPurchase(input: PurchaseInput) {
  push("purchase", {
    transaction_id: input.transactionId,
    currency: CURRENCY,
    value: input.value,
    shipping: input.shipping,
    tax: input.tax,
    items: input.items,
  });

  // Enhanced Conversions: a hashed identifier only, pushed as a top-level
  // dataLayer field (not inside "ecommerce") — GTM's own Enhanced
  // Conversions tag reads user-provided data from here when configured.
  // Raw email never reaches the dataLayer; hashSha256 runs before this is
  // called. Only pushed when marketing consent was actually granted (the
  // caller is responsible for checking consent first).
  if (input.userData?.sha256Email) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "purchase_user_data",
      user_data: { sha256_email_address: input.userData.sha256Email },
    });
  }
}

export function trackViewPromotion(promotionId: string, promotionName: string) {
  push("view_promotion", { promotion_id: promotionId, promotion_name: promotionName });
}

export function trackSelectPromotion(promotionId: string, promotionName: string) {
  push("select_promotion", { promotion_id: promotionId, promotion_name: promotionName });
}

/** Not wired to any UI yet — this site has no internal site search today
 * (see the audit report). Kept here, ready to call the moment one exists,
 * rather than being built again from scratch then. */
export function trackSearch(searchTerm: string, resultsCount: number) {
  push("search", { search_term: searchTerm, results_count: resultsCount });
}

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}
