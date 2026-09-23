// Server-side reads for the singleton content rows (Home/About/Contact) that
// back the admin "Content" editors. Each row is seeded once with a fixed id
// and only ever updated, never created/deleted — see prisma/seed.ts. Falls
// back to the original launch copy if a row is somehow missing (e.g. a
// fresh database that hasn't been seeded yet) so these pages never 500.
import "server-only";
import { prisma } from "./prisma";
import { getContentFields, getLocale, type Locale } from "./i18n";

/** Overlays translated fields onto a content-singleton's English defaults —
 * only keys that already exist on `base` are ever overridden, so a stray
 * ContentTranslation row for a since-removed field is silently ignored
 * rather than leaking an unexpected key onto the object. */
function withTranslations<T extends Record<string, unknown>>(base: T, overrides: Record<string, string>): T {
  const result = { ...base };
  for (const key of Object.keys(overrides)) {
    if (key in base) (result as Record<string, unknown>)[key] = overrides[key];
  }
  return result;
}

const homeDefaults = {
  heroEyebrow: "Est. for Collectors of Light",
  heroHeadline: "Light, Crafted Like",
  heroHeadlineAccent: "Sculpture",
  heroSubtext:
    "Ollerialight curates rare, museum-quality table lamps from the world's most celebrated lighting artisans — hand-finished, individually numbered, made to be inherited.",
  chromaHeadline: "Hand-Blown in Poland, One Sphere at a Time",
  chromaSubtext:
    "Four glass spheres from our partner atelier in Poland — each colourway cast entirely by hand, no two ever quite alike. Custom colourways are genuinely available on this line; ask our design team about commissioning your own.",
  craftHeadline: "Every lamp is quarried, blown, or forged — never molded.",
  craftSubtext:
    "We work with a small circle of designers who treat light as a material in its own right. No piece leaves the atelier until it has been finished entirely by hand, numbered, and signed.",
};

const aboutDefaults = {
  heroHeadline: "We believe light deserves to be treated like sculpture.",
  heroSubtext:
    "Ollerialight exists to give a small circle of master designers the time, materials, and patience their work deserves — and to bring the result into homes that will keep it for generations.",
};

const contactDefaults = {
  email: "johannj@finnbogasondesign.com",
  phone: "+1 (555) 018-2043",
  address: "24 Ateljé Row, New York, NY",
  hours: "Tue-Sat, 11am-6pm, by appointment",
};

// `locale` is optional and meant for the admin editors, which must always
// read/write the canonical English columns regardless of what NEXT_LOCALE
// happens to be set to in the admin's own browser (they share cookies with
// the storefront) — pass "en" explicitly there. The public storefront omits
// it and gets the request's resolved locale via getLocale().
export async function getHomeContent(locale?: Locale) {
  const content = await prisma.homeContent.findUnique({ where: { id: "home" } });
  const base = content ?? homeDefaults;
  const resolvedLocale = locale ?? (await getLocale());
  const overrides = await getContentFields(resolvedLocale, "HomeContent", "home");
  return withTranslations(base, overrides);
}

/** Admin-managed homepage hero rotation, in display order. Empty until the
 * first one is uploaded — the homepage falls back to a product's own
 * photos when this comes back empty (see src/app/(site)/page.tsx). */
export async function getHeroImages() {
  return prisma.heroImage.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getAboutContent(locale?: Locale) {
  const content = await prisma.aboutContent.findUnique({ where: { id: "about" } });
  const base = content ?? aboutDefaults;
  const resolvedLocale = locale ?? (await getLocale());
  const overrides = await getContentFields(resolvedLocale, "AboutContent", "about");
  return withTranslations(base, overrides);
}

// email/phone/address are literal contact data, not language-bearing copy,
// so only `hours` (e.g. "Tue-Sat, 11am-6pm, by appointment") is translated.
export async function getContactInfo(locale?: Locale) {
  const content = await prisma.contactInfo.findUnique({ where: { id: "contact" } });
  const base = content ?? contactDefaults;
  const resolvedLocale = locale ?? (await getLocale());
  const overrides = await getContentFields(resolvedLocale, "ContactInfo", "contact");
  return overrides.hours ? { ...base, hours: overrides.hours } : base;
}
