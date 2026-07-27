// Central source of truth for the site's canonical URL. Set
// NEXT_PUBLIC_SITE_URL in the environment (Vercel sets this per
// preview/production deployment) — falls back to the production domain
// so local dev and unset environments still produce valid absolute URLs.
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.safalight.com";
