// Shipping is priced on two independent axes, chosen by the customer on our
// own /checkout page (not Stripe's) before a Checkout Session is ever
// created — see the comment in checkout/actions.ts for why: Stripe Checkout
// has no way to show/hide a shipping option based on the address someone
// types into its own hosted page, so the destination has to be known
// upfront in order to charge the right, single, non-negotiable price.
//
//   - Region: free within the EU, a flat rate for everywhere else.
//   - Speed: Regular (included) or Express (a fixed surcharge).

export type ShippingSpeed = "regular" | "express";

export const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR",
  "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK",
  "SI", "ES", "SE",
]);

// Every destination the storefront will actually collect an address for —
// the 27 EU member states plus a curated set of nearby/major non-EU markets
// (EEA/EFTA, UK, North America, a handful of other developed markets).
// Not the full ~240 ISO list; easy to extend if the business starts
// shipping somewhere new.
export const SHIPPABLE_COUNTRIES: { code: string; name: string }[] = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "AD", name: "Andorra" },
  { code: "MC", name: "Monaco" },
  { code: "NO", name: "Norway" },
  { code: "CH", name: "Switzerland" },
  { code: "IS", name: "Iceland" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "NZ", name: "New Zealand" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
];

const SHIPPABLE_COUNTRY_CODES = new Set(SHIPPABLE_COUNTRIES.map((c) => c.code));

export function isShippableCountry(code: string): boolean {
  return SHIPPABLE_COUNTRY_CODES.has(code);
}

export function isEuCountry(code: string): boolean {
  return EU_COUNTRIES.has(code);
}

export type ShippingRates = {
  euRegular: number;
  euExpress: number;
  nonEuRegular: number;
  nonEuExpress: number;
};

// Used only if the Settings row is somehow missing — src/lib/settings.ts's
// getShippingRates() has its own matching defaults and is the actual
// source of truth (admin-editable via Admin → Settings).
export const DEFAULT_SHIPPING_RATES: ShippingRates = {
  euRegular: 0,
  euExpress: 50,
  nonEuRegular: 450,
  nonEuExpress: 650,
};

/** Euros, not cents — matches how prices are stored elsewhere in the app. */
export function getShippingPrice(rates: ShippingRates, countryCode: string, speed: ShippingSpeed): number {
  const eu = isEuCountry(countryCode);
  if (eu) return speed === "express" ? rates.euExpress : rates.euRegular;
  return speed === "express" ? rates.nonEuExpress : rates.nonEuRegular;
}

export function getShippingLabel(speed: ShippingSpeed): string {
  return speed === "express" ? "Express Shipping" : "Regular Shipping";
}
