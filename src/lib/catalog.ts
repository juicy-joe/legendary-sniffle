// Server-side data access for the public storefront. Replaces the old
// static src/lib/products.ts as the thing pages actually render from — that
// file now only feeds prisma/seed.ts as historical seed data. Every product
// shown on the site comes from here, which means admin edits go live the
// next time a page is requested (Next.js revalidation permitting).
import "server-only";
import { prisma } from "./prisma";
import { getContentFields, getContentFieldsForModel, getLocale, type Locale } from "./i18n";
import { getStockLevels } from "./stock-levels";

export type LampPalette = "gold" | "ivory" | "onyx" | "bronze" | "smoke";
export type LampShade = "dome" | "drum" | "cone" | "sphere" | "pleated";
export type LampBase = "urn" | "column" | "sculpted" | "orb" | "disc";

export type ProductPhoto = { src: string; label: string; swatch: string };

export type CatalogProduct = {
  id: string;
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
  /** Warehouse-assigned identifier — doubles as schema.org Product.sku. */
  sku: string;
  /** Manual SEO overrides from the admin "SEO (optional)" fields — null
   * unless someone deliberately typed something; see src/lib/seo.ts for the
   * automatic fallback used everywhere else. */
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: Date;
  /** Stock on hand minus quantity already committed to open orders — see
   * src/lib/stock-levels.ts. Ordering beyond this is allowed (these are
   * made-to-order glass pieces), the storefront just warns about the
   * longer lead time rather than blocking the sale. */
  availableStock: number;
};

const include = {
  designer: true,
  collection: true,
  category: true,
  images: { orderBy: { sortOrder: "asc" as const } },
} as const;

async function fetchRows() {
  return prisma.product.findMany({
    where: { visible: true },
    include,
    orderBy: { createdAt: "asc" as const },
  });
}

type ProductRow = Awaited<ReturnType<typeof fetchRows>>[number];

function toCatalogProduct(
  p: ProductRow,
  translations?: Record<string, string>,
  availableStock = 0
): CatalogProduct {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    // Product-facing pages show the designer's short form (e.g. "J. J.
    // Finnbogason") when one's set — the About page's own designer cards
    // use the full name directly (see getDesigners()), not this.
    designer: p.designer.shortName || p.designer.name,
    collection: p.collection.name,
    price: p.price,
    category: p.category.name,
    palette: p.palette,
    shade: p.shade,
    base: p.base,
    materials: translations?.materials ?? p.materials,
    dimensions: p.dimensions,
    description: translations?.description ?? p.description,
    story: translations?.story ?? p.story,
    featured: p.featured,
    limited: p.limited,
    images: p.images.length
      ? p.images.map((img) => ({ src: img.url, label: img.label, swatch: img.swatch }))
      : undefined,
    sku: p.sku,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    updatedAt: p.updatedAt,
    availableStock,
  };
}

/** The full catalog, in creation order. Small enough (dozens of pieces) to
 * fetch whole and filter/sort in memory rather than adding a query per view.
 * `locale` is optional and meant for admin/internal callers (invoices, admin
 * product lookups) that must see the canonical English columns regardless
 * of the NEXT_LOCALE cookie in the admin's own browser — pass "en" there. */
export async function getCatalog(locale?: Locale): Promise<CatalogProduct[]> {
  const rows = await fetchRows();
  const resolvedLocale = locale ?? (await getLocale());
  const [translations, stockLevels] = await Promise.all([
    getContentFieldsForModel(resolvedLocale, "Product", rows.map((r) => r.id)),
    getStockLevels(),
  ]);
  return rows.map((r) => toCatalogProduct(r, translations[r.id], stockLevels.get(r.id)?.available ?? 0));
}

export async function getProductBySlug(slug: string, locale?: Locale): Promise<CatalogProduct | null> {
  // findFirst, not findUnique — findUnique's `where` can only take unique
  // fields, and visible isn't one. A hidden product's direct URL 404s
  // (this returning null is what makes the [slug] page call notFound()),
  // same as a slug that never existed.
  const row = await prisma.product.findFirst({ where: { slug, visible: true }, include });
  if (!row) return null;
  const resolvedLocale = locale ?? (await getLocale());
  const [translations, stockLevels] = await Promise.all([
    getContentFields(resolvedLocale, "Product", row.id),
    getStockLevels(),
  ]);
  return toCatalogProduct(row, translations, stockLevels.get(row.id)?.available ?? 0);
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

// bio is translated; name/shortName/origin are proper nouns/places and stay
// as-authored in every locale.
export async function getDesigners(locale?: Locale) {
  const rows = await prisma.designer.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  const resolvedLocale = locale ?? (await getLocale());
  const translations = await getContentFieldsForModel(resolvedLocale, "Designer", rows.map((r) => r.id));
  return rows.map((r) => ({ ...r, bio: translations[r.id]?.bio ?? r.bio }));
}

// description is translated; name (the collection name, excluded by design
// from translation) is not.
export async function getCollections(locale?: Locale) {
  const rows = await prisma.collection.findMany({ orderBy: { name: "asc" } });
  const resolvedLocale = locale ?? (await getLocale());
  const translations = await getContentFieldsForModel(resolvedLocale, "Collection", rows.map((r) => r.id));
  return rows.map((r) => ({ ...r, description: translations[r.id]?.description ?? r.description }));
}
