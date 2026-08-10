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
};

export async function getSettings() {
  const settings = await prisma.settings.findUnique({ where: { id: "settings" } });
  return {
    siteName: settings?.siteName || defaults.siteName,
    siteUrl: settings?.siteUrl || defaults.siteUrl,
    defaultMetaTitle: settings?.defaultMetaTitle || defaults.defaultMetaTitle,
    defaultMetaDesc: settings?.defaultMetaDesc || defaults.defaultMetaDesc,
  };
}
