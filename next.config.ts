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
