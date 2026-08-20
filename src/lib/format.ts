// Single source of truth for how prices render across the storefront and
// admin — was previously duplicated as `${amount.toLocaleString()}` (or
// `.toLocaleString("en-US")`) at ~10 call sites, hardcoding a "$" prefix
// even though the business prices in EUR. Centralizing it here means a
// future currency change is a one-line fix instead of a repo-wide grep.
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}
