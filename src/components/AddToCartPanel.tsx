"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import WishlistButton from "./WishlistButton";

export default function AddToCartPanel({
  slug,
  name,
}: {
  slug: string;
  name: string;
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    addItem(slug, qty);
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
            aria-label="Decrease quantity"
            className="text-ink/60 transition-colors hover:text-ink"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-4 text-center text-sm font-feature-tabular">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(9, q + 1))}
            aria-label="Increase quantity"
            className="text-ink/60 transition-colors hover:text-ink"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2.5 rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark"
        >
          <AnimatePresence mode="wait" initial={false}>
            {justAdded ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="inline-flex items-center gap-2"
              >
                <Check className="h-3.5 w-3.5" /> Added to Cart
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="inline-flex items-center gap-2"
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Add to Cart
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <WishlistButton slug={slug} />
      </div>
      <p className="sr-only" aria-live="polite">
        {justAdded ? `${name} added to cart` : ""}
      </p>
    </div>
  );
}
