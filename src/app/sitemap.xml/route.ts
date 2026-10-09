// Hand-rolled XML rather than Next's built-in `sitemap.ts` MetadataRoute
// convention — that convention has no support for the Image sitemap
// extension (<image:image> children) or hreflang <xhtml:link> annotations,
// both of which this site needs (image-heavy catalog, four URL locales).
// Everything this previously covered via sitemap.ts (static routes, legal
// pages, every product) is preserved here; only the output format changed.
import { getCatalog, getDesigners } from "@/lib/catalog";
import { slugify } from "@/lib/slugify";
import { siteUrl } from "@/lib/site";
import { routableLocales, defaultLocale, type Locale } from "@/lib/i18n-shared";

// See the matching comment in src/app/product-feed.xml/route.ts — same
// reasoning (deliberately locale-fixed to avoid cookies()-based dynamic
// rendering, which otherwise risks this being eligible for a cached
// build-time snapshot rather than always reflecting current products).
export const dynamic = "force-dynamic";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type UrlEntry = {
  // Locale-agnostic — "" for the homepage, "/table-lamps", "/products/foo",
  // etc. Every locale's actual URL is derived from this at render time, so
  // a route's four locale variants can never drift out of sync with each
  // other the way they would if each were listed by hand.
  path: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  images?: string[];
};

// One <url> entry per locale per route, cross-linked via hreflang
// <xhtml:link> to its three siblings — this is Google's documented pattern
// for a sitemap covering translated pages (the alternative, a single URL
// annotated some other way, doesn't exist; hreflang is only ever expressed
// either in <head> or in the sitemap, and this site already does the
// former per-page too — see localeAlternates in src/lib/i18n.ts — so this
// is deliberately redundant with that, not a replacement for it).
function renderUrl(entry: UrlEntry, locale: Locale): string {
  const loc = `${siteUrl}/${locale}${entry.path}`;
  const parts = [`    <loc>${escapeXml(loc)}</loc>`];
  for (const l of routableLocales) {
    parts.push(
      `    <xhtml:link rel="alternate" hreflang="${l}" href="${escapeXml(`${siteUrl}/${l}${entry.path}`)}" />`
    );
  }
  parts.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(`${siteUrl}/${defaultLocale}${entry.path}`)}" />`
  );
  if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
  if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  if (entry.priority !== undefined) parts.push(`    <priority>${entry.priority}</priority>`);
  for (const img of entry.images ?? []) {
    parts.push(`    <image:image>\n      <image:loc>${escapeXml(img)}</image:loc>\n    </image:image>`);
  }
  return `  <url>\n${parts.join("\n")}\n  </url>`;
}

export async function GET() {
  // Only slugs/images are needed here — pass a fixed locale to skip
  // getLocale()'s cookies() lookup, which isn't available if this ever
  // runs at build time.
  const [products, designers] = await Promise.all([getCatalog("en"), getDesigners("en")]);
  const today = new Date().toISOString().slice(0, 10);

  const staticRoutes: UrlEntry[] = [
    "",
    "/table-lamps",
    "/about",
    "/contact",
    "/consulting",
    "/trade",
    "/collections/moodmax",
    "/collections/naturesphere",
    "/designers",
    "/hand-blown-glass",
  ].map((path) => ({
    path,
    lastmod: today,
    changefreq: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  // Legal pages change rarely and aren't a discovery priority for search
  // engines, but should still be listed so they're indexable.
  const legalRoutes: UrlEntry[] = ["/privacy", "/terms"].map((path) => ({
    path,
    lastmod: today,
    changefreq: "yearly",
    priority: 0.3,
  }));

  // Every product is listed automatically, each with its real photos as
  // Image sitemap entries — a new product's sitemap (and image sitemap)
  // entry needs no extra step beyond creating the product.
  const productRoutes: UrlEntry[] = products.map((p) => ({
    path: `/products/${p.slug}`,
    lastmod: p.updatedAt.toISOString().slice(0, 10),
    changefreq: "monthly",
    priority: 0.6,
    images: p.images?.map((img) => img.src) ?? [],
  }));

  const designerRoutes: UrlEntry[] = designers.map((d) => ({
    path: `/designers/${slugify(d.shortName || d.name)}`,
    lastmod: today,
    changefreq: "monthly",
    priority: 0.5,
  }));

  const routes = [...staticRoutes, ...legalRoutes, ...productRoutes, ...designerRoutes];
  const urls = routes.flatMap((entry) => routableLocales.map((locale) => renderUrl(entry, locale)));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
