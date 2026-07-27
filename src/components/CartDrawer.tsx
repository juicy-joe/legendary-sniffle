"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getProduct } from "@/lib/products";
import { EASE } from "@/lib/motion";
import LampIllustration from "./LampIllustration";
import ProductPhoto from "./ProductPhoto";

export default function CartDrawer() {
  const { lines, isOpen, closeCart, setQty, removeItem, subtotal } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[70] bg-ink/50 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.aside
            ref={panelRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            className="fixed right-0 top-0 z-[80] flex h-full w-full max-w-md flex-col bg-paper shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
              <h2 className="flex items-center gap-2.5 font-serif text-2xl font-light text-ink">
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                Your Selection
              </h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="text-ink/60 transition-colors hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="h-10 w-10 text-ink/20" strokeWidth={1} />
                <p className="text-ink/50">Your selection is empty.</p>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="rounded-[3px] bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-gold-dark"
                >
                  Browse the Collection
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="space-y-5">
                    {lines.map((line) => {
                      const product = getProduct(line.slug);
                      if (!product) return null;
                      return (
                        <li
                          key={line.slug}
                          className="flex gap-4 border-b border-ink/10 pb-5"
                        >
                          <Link
                            href={`/products/${product.slug}`}
                            onClick={closeCart}
                            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[4px] border border-ink/10 bg-paper-dim"
                          >
                            {product.images?.length ? (
                              <ProductPhoto
                                images={product.images}
                                alt={product.name}
                                showSelector={false}
                              />
                            ) : (
                              <div className="p-2">
                                <LampIllustration
                                  product={product}
                                  animated={false}
                                  className="h-full w-full"
                                />
                              </div>
                            )}
                          </Link>
                          <div className="flex flex-1 flex-col">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[11px] uppercase tracking-[0.1em] text-ink/40">
                                  {product.designer}
                                </p>
                                <Link
                                  href={`/products/${product.slug}`}
                                  onClick={closeCart}
                                  className="font-serif text-lg text-ink hover:text-gold-dark"
                                >
                                  {product.name}
                                </Link>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(line.slug)}
                                aria-label={`Remove ${product.name} from cart`}
                                className="text-ink/40 transition-colors hover:text-ink"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-3 rounded-[3px] border border-ink/20 px-2.5 py-1">
                                <button
                                  type="button"
                                  onClick={() => setQty(line.slug, line.qty - 1)}
                                  aria-label="Decrease quantity"
                                  className="text-ink/60 transition-colors hover:text-ink"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="w-4 text-center text-sm font-feature-tabular">
                                  {line.qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setQty(line.slug, line.qty + 1)}
                                  aria-label="Increase quantity"
                                  className="text-ink/60 transition-colors hover:text-ink"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="font-serif text-gold-dark font-feature-tabular">
                                ${(product.price * line.qty).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="border-t border-ink/10 px-6 py-6">
                  <div className="mb-4 flex items-center justify-between text-sm text-ink/60">
                    <span>Subtotal</span>
                    <span className="font-serif text-lg text-ink font-feature-tabular">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>
                  <p className="mb-4 text-xs text-ink/40">
                    Shipping &amp; white-glove delivery calculated at checkout.
                  </p>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="block w-full rounded-[3px] border border-ink bg-ink py-4 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
