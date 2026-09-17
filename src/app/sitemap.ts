import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Only slugs are needed here — pass a fixed locale to skip getLocale()'s
  // cookies() lookup, which isn't available if this ever runs at build time.
  const products = await getCatalog("en");

  const staticRoutes = ["", "/products", "/about", "/contact"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  // Legal pages change rarely and aren't a discovery priority for search
  // engines, but should still be listed so they're indexable.
  const legalRoutes = ["/privacy", "/terms"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  // Every product is listed automatically — a new product's sitemap entry
  // needs no extra step beyond creating the product. lastModified reflects
  // the product's own updatedAt so search engines see accurate freshness
  // instead of every entry looking newly changed on every build.
  const productRoutes = products.map((p) => ({
    url: `${siteUrl}/products/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...legalRoutes, ...productRoutes];
}
