import Link from "next/link";
import { ArrowRight } from "lucide-react";
import RevealOnScroll from "./RevealOnScroll";
import CollectionSlideshow from "./CollectionSlideshow";

export type CollectionSummary = {
  name: string;
  slug: string;
  description: string | null;
  count: number;
  images: { src: string; alt: string }[];
};

// A plain (server) wrapper — only the slideshow inside each card needs to
// be a Client Component. Sits above the grouped product grid on /products;
// each card links down to that collection's own section via #slug.
export default function CollectionsShowcase({ collections }: { collections: CollectionSummary[] }) {
  if (collections.length === 0) return null;

  return (
    <div className="mb-20 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-8">
      {collections.map((collection, i) => (
        <RevealOnScroll key={collection.slug} delay={i * 0.1}>
          <Link href={`#${collection.slug}`} className="group block">
            <CollectionSlideshow images={collection.images} />
            <div className="mt-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-ink md:text-3xl">{collection.name}</h2>
                {collection.description && (
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">
                    {collection.description}
                  </p>
                )}
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink/50">
                  {collection.count} {collection.count === 1 ? "piece" : "pieces"}
                </p>
              </div>
              <span className="mt-1 flex shrink-0 items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-ink/70 transition-colors group-hover:text-gold-dark">
                View <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        </RevealOnScroll>
      ))}
    </div>
  );
}
