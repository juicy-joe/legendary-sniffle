"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useCatalog } from "./CatalogContext";
import { trackAddToCart, trackRemoveFromCart, trackViewCart, productToGaItem } from "@/lib/analytics/gtm";

export type CartLine = { slug: string; qty: number };

type CartContextValue = {
  lines: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (slug: string, qty?: number) => void;
  removeItem: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "ollerialight:cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { getProduct } = useCatalog();
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setLines(JSON.parse(stored));
    } catch {
      // localStorage unavailable — cart simply won't persist
    }
  }, []);

  const persist = useCallback((next: CartLine[]) => {
    setLines(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore persistence failures
    }
  }, []);

  const addItem = useCallback(
    (slug: string, qty = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.slug === slug);
        const next = existing
          ? prev.map((l) =>
              l.slug === slug ? { ...l, qty: l.qty + qty } : l
            )
          : [...prev, { slug, qty }];
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore persistence failures
        }
        return next;
      });
      setIsOpen(true);

      const product = getProduct(slug);
      if (product) trackAddToCart(productToGaItem(product, qty, product.price));
    },
    [getProduct]
  );

  const removeItem = useCallback(
    (slug: string) => {
      const line = lines.find((l) => l.slug === slug);
      persist(lines.filter((l) => l.slug !== slug));

      const product = line && getProduct(slug);
      if (product && line) trackRemoveFromCart(productToGaItem(product, line.qty, product.price));
    },
    [lines, persist, getProduct]
  );

  const setQty = useCallback(
    (slug: string, qty: number) => {
      const line = lines.find((l) => l.slug === slug);
      const previousQty = line?.qty ?? 0;

      if (qty < 1) {
        persist(lines.filter((l) => l.slug !== slug));
      } else {
        persist(lines.map((l) => (l.slug === slug ? { ...l, qty } : l)));
      }

      // A decrease (including down to removal) is a remove_from_cart of the
      // difference; an increase is an add_to_cart of the difference — both
      // fired with the exact delta so GA4's totals stay accurate rather
      // than double-counting the quantity that was already tracked.
      const product = getProduct(slug);
      if (product && qty < previousQty) {
        trackRemoveFromCart(productToGaItem(product, previousQty - qty, product.price));
      } else if (product && qty > previousQty) {
        trackAddToCart(productToGaItem(product, qty - previousQty, product.price));
      }
    },
    [lines, persist, getProduct]
  );

  const clear = useCallback(() => persist([]), [persist]);

  const count = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const product = getProduct(l.slug);
        return product ? sum + product.price * l.qty : sum;
      }, 0),
    [lines, getProduct]
  );

  const openCart = useCallback(() => {
    setIsOpen(true);
    const items = lines
      .map((l) => {
        const product = getProduct(l.slug);
        return product ? productToGaItem(product, l.qty, product.price) : null;
      })
      .filter((i) => i !== null);
    if (items.length > 0) trackViewCart(items, subtotal);
  }, [lines, getProduct, subtotal]);

  const value = useMemo(
    () => ({
      lines,
      isOpen,
      openCart,
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      setQty,
      clear,
      count,
      subtotal,
    }),
    [lines, isOpen, openCart, addItem, removeItem, setQty, clear, count, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
