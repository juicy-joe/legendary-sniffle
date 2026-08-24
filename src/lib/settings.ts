// Server-side read for the site-wide Settings singleton. Falls back to the
// original launch values if the row is somehow missing, same pattern as
// content.ts, so metadata generation never 500s.
import "server-only";
import { prisma } from "./prisma";

const defaults = {
  siteName: "SaFaLight",
  siteUrl: "https://www.safalight.com",
  defaultMetaTitle: "SaFaLight | Luxury Designer Table Lamps",
  defaultMetaDesc:
    "SaFaLight curates rare, museum-quality designer table lamps from the world's most celebrated lighting artisans — hand-finished, individually numbered, made to be inherited.",
  euRegularShippingPrice: 0,
  euExpressShippingPrice: 50,
  nonEuRegularShippingPrice: 450,
  nonEuExpressShippingPrice: 650,
};

export async function getSettings() {
  const settings = await prisma.settings.findUnique({ where: { id: "settings" } });
  return {
    siteName: settings?.siteName || defaults.siteName,
    siteUrl: settings?.siteUrl || defaults.siteUrl,
    defaultMetaTitle: settings?.defaultMetaTitle || defaults.defaultMetaTitle,
    defaultMetaDesc: settings?.defaultMetaDesc || defaults.defaultMetaDesc,
    euRegularShippingPrice: settings?.euRegularShippingPrice ?? defaults.euRegularShippingPrice,
    euExpressShippingPrice: settings?.euExpressShippingPrice ?? defaults.euExpressShippingPrice,
    nonEuRegularShippingPrice: settings?.nonEuRegularShippingPrice ?? defaults.nonEuRegularShippingPrice,
    nonEuExpressShippingPrice: settings?.nonEuExpressShippingPrice ?? defaults.nonEuExpressShippingPrice,
  };
}

/** Just the four shipping prices, shaped for src/lib/shipping.ts's getShippingPrice(). */
export async function getShippingRates() {
  const settings = await getSettings();
  return {
    euRegular: settings.euRegularShippingPrice,
    euExpress: settings.euExpressShippingPrice,
    nonEuRegular: settings.nonEuRegularShippingPrice,
    nonEuExpress: settings.nonEuExpressShippingPrice,
  };
}
