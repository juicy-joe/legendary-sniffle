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
const STORAGE_KEY = "safalight:cart";

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
    },
    []
  );

  const removeItem = useCallback(
    (slug: string) => {
      persist(lines.filter((l) => l.slug !== slug));
    },
    [lines, persist]
  );

  const setQty = useCallback(
    (slug: string, qty: number) => {
      if (qty < 1) {
        persist(lines.filter((l) => l.slug !== slug));
        return;
      }
      persist(lines.map((l) => (l.slug === slug ? { ...l, qty } : l)));
    },
    [lines, persist]
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

  const value = useMemo(
    () => ({
      lines,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      removeItem,
      setQty,
      clear,
      count,
      subtotal,
    }),
    [lines, isOpen, addItem, removeItem, setQty, clear, count, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
