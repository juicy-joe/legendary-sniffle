"use client";

import { Heart } from "lucide-react";
import clsx from "clsx";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistButton({ slug }: { slug: string }) {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(slug);

  return (
    <button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      className={clsx(
        "inline-flex items-center gap-2.5 rounded-[3px] border px-7 py-4 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors duration-300",
        saved
          ? "border-gold-dark bg-gold-dark/10 text-gold-dark"
          : "border-ink/25 text-ink hover:border-ink hover:bg-ink hover:text-paper"
      )}
    >
      <Heart className={clsx("h-3.5 w-3.5", saved && "fill-gold-dark")} />
      {saved ? "Saved" : "Add to Wishlist"}
    </button>
  );
}
