import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Drops the "X-Powered-By: Next.js" response header (minor info-disclosure hardening).
  poweredByHeader: false,
  // Explicit for clarity — this has been the default since Next 13.
  reactStrictMode: true,

  // A stray package-lock.json one directory up (outside this repo) makes
  // Next.js's workspace-root auto-detection guess wrong and warn on every
  // build. Pinning it explicitly silences that without touching anything
  // outside this project.
  turbopack: {
    root: __dirname,
  },

  // Product photos uploaded through the admin dashboard live in Vercel Blob,
  // which serves each store from a random `<id>.public.blob.vercel-storage.com`
  // subdomain — so this has to be a wildcard, not a fixed hostname.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    // Next 16 rejects any `quality` prop not in this allowlist (defaults to
    // just [75]). The homepage hero explicitly requests 92 — it's the
    // single largest image on the site (full-bleed, up to 100vw), so it's
    // worth the extra bytes that the default doesn't budget for.
    qualities: [75, 92],
  },

  // Permanent redirects for products renamed via the admin panel after
  // being indexed under their old slugs, plus one product unpublished
  // (visible: false) rather than renamed — sent to the closest living
  // collection page instead of left as a dead link. Single hop each
  // (A -> C, never A -> B -> C) per the SEO redirect-chain rule.
  async redirects() {
    return [
      { source: "/products/mushroom-lake", destination: "/products/lavaglow", permanent: true },
      { source: "/products/geysir-s", destination: "/products/geyserglow", permanent: true },
      { source: "/products/pine-and-ice", destination: "/collections/naturesphere", permanent: true },
      // Product renamed from "Saturns" to "Sunny Beach" — slug updated to
      // match (see prisma data change in the same commit as this redirect).
      { source: "/products/saturns", destination: "/products/sunny-beach", permanent: true },
      // The listing/hub page moved from /products to /table-lamps; the
      // product detail route (/products/[slug]) is unaffected and unchanged.
      { source: "/products", destination: "/table-lamps", permanent: true },
    ];
  },

  // Note: deliberately not shipping a Content-Security-Policy here.
  // Framer Motion animates via inline `style` attributes, which a strict
  // style-src CSP without 'unsafe-inline' (or per-element nonces) would
  // silently break site-wide. A CSP is worth adding later, but it needs
  // to be built and tested against every animated page first rather than
  // bundled into this pass.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
