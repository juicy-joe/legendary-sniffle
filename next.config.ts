import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Drops the "X-Powered-By: Next.js" response header (minor info-disclosure hardening).
  poweredByHeader: false,
  // Explicit for clarity — this has been the default since Next 13.
  reactStrictMode: true,
};

export default nextConfig;
