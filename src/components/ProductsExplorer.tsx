"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";
import { useCatalog } from "@/context/CatalogContext";

type Sort = "featured" | "price-asc" | "price-desc";

function ExplorerInner() {
  const { products, categories } = useCatalog();
  const params = useSearchParams();
  const initialCategory = params.get("category");

  const [category, setCategory] = useState<string>(
    initialCategory && categories.includes(initialCategory)
      ? initialCategory
      : "All"
  );
  const [sort, setSort] = useState<Sort>("featured");

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) => category === "All" || p.category === category
    );
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "featured")
      list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
    return list;
  }, [products, category, sort]);

  return (
    <div>
      <div className="mb-12 flex flex-col gap-6 border-b border-ink/10 pb-8 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {(["All", ...categories] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`rounded-[3px] border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors duration-300 ${
                category === c
                  ? "border-gold-dark bg-gold-dark/10 text-gold-dark"
                  : "border-ink/20 text-ink/60 hover:border-ink"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="text-[11px] uppercase tracking-[0.15em] text-ink/65">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-[3px] border border-ink/20 bg-transparent px-3.5 py-2 text-[11px] uppercase tracking-[0.08em] text-ink outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <p className="mb-8 text-xs uppercase tracking-[0.2em] text-ink/65" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
      </p>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={category + sort}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((product, i) => (
            <ProductCard key={product.slug} product={product} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function ProductsExplorer() {
  return (
    <Suspense fallback={null}>
      <ExplorerInner />
    </Suspense>
  );
}
