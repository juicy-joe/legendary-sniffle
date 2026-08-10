// Server-side data access for the public storefront. Replaces the old
// static src/lib/products.ts as the thing pages actually render from — that
// file now only feeds prisma/seed.ts as historical seed data. Every product
// shown on the site comes from here, which means admin edits go live the
// next time a page is requested (Next.js revalidation permitting).
import "server-only";
import { prisma } from "./prisma";

export type LampPalette = "gold" | "ivory" | "onyx" | "bronze" | "smoke";
export type LampShade = "dome" | "drum" | "cone" | "sphere" | "pleated";
export type LampBase = "urn" | "column" | "sculpted" | "orb" | "disc";

export type ProductPhoto = { src: string; label: string; swatch: string };

export type CatalogProduct = {
  slug: string;
  name: string;
  designer: string;
  collection: string;
  price: number;
  // Categories are admin-managed now, not a fixed set — plain string.
  category: string;
  palette: LampPalette;
  shade: LampShade;
  base: LampBase;
  materials: string;
  dimensions: string;
  description: string;
  story: string;
  featured?: boolean;
  limited?: boolean;
  /** Real photography, when available. Falls back to the SVG study when absent. */
  images?: ProductPhoto[];
};

const include = {
  designer: true,
  collection: true,
  category: true,
  images: { orderBy: { sortOrder: "asc" as const } },
} as const;

async function fetchRows() {
  return prisma.product.findMany({ include, orderBy: { createdAt: "asc" as const } });
}

type ProductRow = Awaited<ReturnType<typeof fetchRows>>[number];

function toCatalogProduct(p: ProductRow): CatalogProduct {
  return {
    slug: p.slug,
    name: p.name,
    designer: p.designer.name,
    collection: p.collection.name,
    price: p.price,
    category: p.category.name,
    palette: p.palette,
    shade: p.shade,
    base: p.base,
    materials: p.materials,
    dimensions: p.dimensions,
    description: p.description,
    story: p.story,
    featured: p.featured,
    limited: p.limited,
    images: p.images.length
      ? p.images.map((img) => ({ src: img.url, label: img.label, swatch: img.swatch }))
      : undefined,
  };
}

/** The full catalog, in creation order. Small enough (dozens of pieces) to
 * fetch whole and filter/sort in memory rather than adding a query per view. */
export async function getCatalog(): Promise<CatalogProduct[]> {
  const rows = await fetchRows();
  return rows.map(toCatalogProduct);
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const row = await prisma.product.findUnique({ where: { slug }, include });
  return row ? toCatalogProduct(row) : null;
}

export function getRelatedProducts(
  catalog: CatalogProduct[],
  product: CatalogProduct,
  count = 3
) {
  return catalog
    .filter(
      (p) =>
        p.slug !== product.slug &&
        (p.designer === product.designer || p.category === product.category)
    )
    .slice(0, count);
}

export function getCategories(catalog: CatalogProduct[]) {
  return Array.from(new Set(catalog.map((p) => p.category)));
}

export async function getDesigners() {
  return prisma.designer.findMany({ orderBy: { name: "asc" } });
}
