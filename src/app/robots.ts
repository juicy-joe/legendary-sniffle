import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // These already carry their own noindex meta, but still leaving them
      // crawlable wastes crawl budget on routes that are either pure API
      // surface or session-gated (always redirect an unauthenticated
      // crawler straight to /trade/login). /trade/login and /trade/apply
      // stay crawlable — they're real lead-gen pages, and Google's own
      // guidance prefers a noindex meta tag over a robots disallow for a
      // page you want evaluated but excluded, not blocked outright.
      disallow: ["/admin", "/api/", "/checkout", "/trade/portal"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
