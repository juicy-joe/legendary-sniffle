// Server-side reads for navbar/footer links and social icons — rendered on
// every page (Navbar, Footer), so these are fetched once per request from
// the (site) root layout / Footer component, not per-page.
import "server-only";
import { prisma } from "./prisma";
import { getContentFieldsForModel, getLocale } from "./i18n";

export async function getMenuItems(location: string) {
  const items = await prisma.menuItem.findMany({ where: { location }, orderBy: { sortOrder: "asc" } });
  const locale = await getLocale();
  const translations = await getContentFieldsForModel(locale, "MenuItem", items.map((i) => i.id));
  return items.map((item) => ({
    ...item,
    label: translations[item.id]?.label ?? item.label,
  }));
}

export async function getSocialLinks() {
  return prisma.socialLink.findMany();
}
