// Server-side reads for navbar/footer links and social icons — rendered on
// every page (Navbar, Footer), so these are fetched once per request from
// the (site) root layout / Footer component, not per-page.
import "server-only";
import { prisma } from "./prisma";

export async function getMenuItems(location: string) {
  return prisma.menuItem.findMany({ where: { location }, orderBy: { sortOrder: "asc" } });
}

export async function getSocialLinks() {
  return prisma.socialLink.findMany();
}
