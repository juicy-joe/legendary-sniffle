// Derives every piece of per-product SEO metadata (title, description, OG
// image, image alt text, structured data) straight from a CatalogProduct —
// no separate "generate" step and no extra admin data entry required, so
// every existing product gets this automatically and every new product
// gets it the moment it's created. The admin's optional "SEO" fields
// (metaTitle/metaDescription) are a manual override, checked first; when
// left blank (the default, and the expected case for most products) these
// functions build a sensible version from the product's own name,
// designer, materials, and description instead.
import type { CatalogProduct } from "./catalog";
import { siteUrl } from "./site";
import type { Locale } from "./i18n-shared";

type SeoProduct = Pick<
  CatalogProduct,
  | "name"
  | "designer"
  | "collection"
  | "category"
  | "materials"
  | "description"
  | "slug"
  | "sku"
  | "gtin"
  | "price"
  | "metaTitle"
  | "metaDescription"
  | "images"
>;

function truncate(text: string, max: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > 40 ? cut.slice(0, lastSpace) : cut}…`;
}

/** <title> text for the product page — wrapped in " | <site name>" by the
 * root layout's title template, so this only needs the product-specific
 * part. Kept under ~60 chars where possible so it doesn't get truncated in
 * search results once the brand suffix is added. */
export function productSeoTitle(product: SeoProduct): string {
  const manual = product.metaTitle?.trim();
  if (manual) return manual;
  return `${product.name} — Designer Table Lamp by ${product.designer}`;
}

/** Meta description — distinct from the on-page description shown to
 * customers, this is a search-result-length (~155 char) summary built from
 * the product's designer, materials, and collection. `siteName` comes from
 * the admin-editable Settings singleton so a rebrand never leaves a stale
 * brand name baked into generated descriptions. */
export function productSeoDescription(product: SeoProduct, siteName: string): string {
  const manual = product.metaDescription?.trim();
  if (manual) return truncate(manual, 160);
  const summary = `${product.name} by ${product.designer} — ${product.materials}. Hand-finished, part of ${siteName}'s ${product.collection} collection.`;
  return truncate(summary, 160);
}

/** The product's own first photo, when one exists — a real product shot
 * makes a far better social-share preview than the generic branded image,
 * which is used as the fallback for products with no photography yet. */
export function productOgImage(product: SeoProduct, siteName: string): { url: string; alt: string } {
  const first = product.images?.[0];
  if (first) return { url: first.src, alt: `${product.name} by ${product.designer}` };
  return { url: `${siteUrl}/opengraph-image`, alt: `${siteName} — Luxury Designer Table Lamps` };
}

/** Shared base alt text for a product's photo gallery — ProductPhoto
 * appends the specific photo's own label (e.g. "Gold Finish") to this, so
 * each individual <img> ends up with a distinct, descriptive alt
 * automatically (no per-image admin data entry beyond the label every
 * photo already needs for its swatch selector). */
export function productPhotoAlt(product: Pick<CatalogProduct, "name" | "designer">): string {
  return `${product.name} table lamp by ${product.designer}`;
}

/** schema.org Product structured data — includes real photos (falling back
 * to the branded OG image when a product has none yet), the warehouse SKU,
 * and an absolute canonical URL, all derived without any manual input.
 * mpn intentionally mirrors sku (see Product.sku's doc comment in
 * schema.prisma) rather than being a second stored value that could drift
 * out of sync with it. gtin is only ever included when a genuine one has
 * been entered — never derived from sku/barcode, never invented. */
export function productJsonLd(product: SeoProduct, siteName: string, inStock: boolean, locale: Locale) {
  const url = `${siteUrl}/${locale}/products/${product.slug}`;
  const images = product.images?.length
    ? product.images.map((img) => img.src)
    : [`${siteUrl}/opengraph-image`];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku,
    mpn: product.sku,
    ...(product.gtin ? { gtin: product.gtin } : {}),
    category: product.category,
    material: product.materials,
    image: images,
    url,
    brand: { "@type": "Brand", name: siteName },
    offers: {
      "@type": "Offer",
      url,
      price: product.price,
      priceCurrency: "EUR",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}
