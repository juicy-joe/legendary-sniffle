"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus, ShoppingBag, TriangleAlert } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCatalog } from "@/context/CatalogContext";
import WishlistButton from "./WishlistButton";
import { useTranslations } from "./TranslationsProvider";

// Below this, we show a scarcity count ("3 in stock") rather than staying
// silent — above it, the exact number isn't useful information for anyone.
const LOW_STOCK_DISPLAY_THRESHOLD = 10;

export default function AddToCartPanel({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const { addItem, lines } = useCart();
  const { getProduct } = useCatalog();
  const { t } = useTranslations();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const availableStock = getProduct(slug)?.availableStock ?? 0;
  const inCartQty = lines.find((l) => l.slug === slug)?.qty ?? 0;
  // How many more of this product can actually be added, given what's
  // already sitting in the cart — never lets the cart exceed real stock.
  const remaining = Math.max(0, availableStock - inCartQty);
  const outOfStock = availableStock <= 0;
  const maxedInCart = !outOfStock && remaining <= 0;
  // Stock can run out (another tab, or someone else buying the last one)
  // while this selector is already open — clamp what's displayed/added
  // against the current `remaining` on every render rather than trusting
  // whatever `qty` was set to earlier.
  const effectiveQty = Math.min(qty, Math.max(remaining, 1));

  const handleAdd = () => {
    if (outOfStock || maxedInCart) return;
    addItem(slug, effectiveQty);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-4 rounded-[3px] border border-ink/25 px-4 py-4">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock || maxedInCart}
            aria-label={t("cart.decreaseQty", "Decrease quantity")}
            className="text-ink/60 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-4 text-center text-sm font-feature-tabular">
            {outOfStock || maxedInCart ? 0 : effectiveQty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(remaining, q + 1))}
            disabled={outOfStock || maxedInCart || effectiveQty >= remaining}
            aria-label={t("cart.increaseQty", "Increase quantity")}
            className="text-ink/60 transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={outOfStock || maxedInCart}
          className="inline-flex items-center gap-2.5 rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:cursor-not-allowed disabled:border-ink/30 disabled:bg-ink/30 disabled:hover:bg-ink/30"
        >
          <AnimatePresence mode="wait" initial={false}>
            {outOfStock ? (
              <motion.span key="oos" className="inline-flex items-center gap-2">
                {t("product.outOfStock", "Out of Stock")}
              </motion.span>
            ) : maxedInCart ? (
              <motion.span key="maxed" className="inline-flex items-center gap-2">
                {t("product.allInCart", "All in Your Cart")}
              </motion.span>
            ) : justAdded ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="inline-flex items-center gap-2"
              >
                <Check className="h-3.5 w-3.5" /> {t("product.addedToCart", "Added to Cart")}
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="inline-flex items-center gap-2"
              >
                <ShoppingBag className="h-3.5 w-3.5" /> {t("product.addToCartButton", "Add to Cart")}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <WishlistButton slug={slug} />
      </div>

      {(outOfStock || availableStock <= LOW_STOCK_DISPLAY_THRESHOLD) && (
        <p className="mt-4 flex items-start gap-2 text-sm text-amber-700">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {outOfStock
            ? t("product.outOfStockNotice", "Currently out of stock.")
            : t("product.lowStockNotice", "Only {count} in stock.").replace("{count}", String(availableStock))}
        </p>
      )}

      <p className="sr-only" aria-live="polite">
        {justAdded ? `${name} ${t("product.addedToCartSr", "added to cart")}` : ""}
      </p>
    </div>
  );
}
