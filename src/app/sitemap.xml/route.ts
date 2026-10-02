// Hand-rolled XML rather than Next's built-in `sitemap.ts` MetadataRoute
// convention — that convention has no support for the Image sitemap
// extension (<image:image> children), which we want on product URLs since
// this is an image-heavy catalog site. Everything this previously covered
// via sitemap.ts (static routes, legal pages, every product) is preserved
// here; only the output format changed.
import { getCatalog } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type UrlEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
  images?: string[];
};

function renderUrl(entry: UrlEntry): string {
  const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`];
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
  const products = await getCatalog("en");
  const today = new Date().toISOString().slice(0, 10);

  const staticRoutes: UrlEntry[] = [
    "",
    "/products",
    "/about",
    "/contact",
    "/consulting",
    "/trade",
    "/collections/moodmax",
    "/collections/naturesphere",
  ].map((path) => ({
    loc: `${siteUrl}${path}`,
    lastmod: today,
    changefreq: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  // Legal pages change rarely and aren't a discovery priority for search
  // engines, but should still be listed so they're indexable.
  const legalRoutes: UrlEntry[] = ["/privacy", "/terms"].map((path) => ({
    loc: `${siteUrl}${path}`,
    lastmod: today,
    changefreq: "yearly",
    priority: 0.3,
  }));

  // Every product is listed automatically, each with its real photos as
  // Image sitemap entries — a new product's sitemap (and image sitemap)
  // entry needs no extra step beyond creating the product.
  const productRoutes: UrlEntry[] = products.map((p) => ({
    loc: `${siteUrl}/products/${p.slug}`,
    lastmod: p.updatedAt.toISOString().slice(0, 10),
    changefreq: "monthly",
    priority: 0.6,
    images: p.images?.map((img) => img.src) ?? [],
  }));

  const urls = [...staticRoutes, ...legalRoutes, ...productRoutes];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(renderUrl).join("\n")}
</urlset>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
