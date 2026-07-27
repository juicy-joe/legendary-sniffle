"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import type { Product } from "@/lib/products";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { DURATION, EASE } from "@/lib/motion";
import LampIllustration from "./LampIllustration";
import ProductPhoto from "./ProductPhoto";

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { isSaved, toggle } = useWishlist();
  const { addItem } = useCart();
  const saved = isSaved(product.slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: DURATION.slow, delay: (index % 6) * 0.06, ease: EASE }}
      className="group relative"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="corner-ticks relative aspect-[3/4] overflow-hidden rounded-[6px] border border-ink/10 bg-paper-dim">
          {product.limited && (
            <span className="absolute left-4 top-4 z-10 border border-paper/40 bg-ink/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-paper backdrop-blur-sm">
              Limited Edition
            </span>
          )}
          <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                toggle(product.slug);
              }}
              aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
              aria-pressed={saved}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/85 backdrop-blur transition-transform duration-200 hover:scale-110"
            >
              <Heart
                className={clsx(
                  "h-4 w-4 transition-colors",
                  saved ? "fill-gold text-gold-dark" : "text-ink/60"
                )}
              />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                addItem(product.slug);
              }}
              aria-label={`Add ${product.name} to cart`}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-paper/85 backdrop-blur transition-transform duration-200 hover:scale-110"
            >
              <ShoppingBag className="h-4 w-4 text-ink/60" />
            </button>
          </div>

          {product.images?.length ? (
            <ProductPhoto
              images={product.images}
              alt={`${product.name} by ${product.designer}`}
              showSelector={false}
              className="transition-transform duration-700 ease-out group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 transition-transform duration-700 ease-out group-hover:scale-[1.035]">
              <LampIllustration product={product} className="h-full w-full" />
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-5 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <p className="text-xs leading-relaxed text-paper/85">
              {product.description}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45">
              {product.designer}
            </p>
            <h3 className="mt-1 font-serif text-xl text-ink">{product.name}</h3>
          </div>
          <p className="whitespace-nowrap font-serif text-lg text-gold-dark font-feature-tabular">
            ${product.price.toLocaleString()}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
