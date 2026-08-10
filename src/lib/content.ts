// Server-side reads for the singleton content rows (Home/About/Contact) that
// back the admin "Content" editors. Each row is seeded once with a fixed id
// and only ever updated, never created/deleted — see prisma/seed.ts. Falls
// back to the original launch copy if a row is somehow missing (e.g. a
// fresh database that hasn't been seeded yet) so these pages never 500.
import "server-only";
import { prisma } from "./prisma";

const homeDefaults = {
  heroEyebrow: "Est. for Collectors of Light",
  heroHeadline: "Light, Crafted Like",
  heroHeadlineAccent: "Sculpture",
  heroSubtext:
    "SaFaLight curates rare, museum-quality table lamps from the world's most celebrated lighting artisans — hand-finished, individually numbered, made to be inherited.",
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
    "SaFaLight exists to give a small circle of master designers the time, materials, and patience their work deserves — and to bring the result into homes that will keep it for generations.",
};

const contactDefaults = {
  email: "johannj@finnbogasondesign.com",
  phone: "+1 (555) 018-2043",
  address: "24 Ateljé Row, New York, NY",
  hours: "Tue-Sat, 11am-6pm, by appointment",
};

export async function getHomeContent() {
  const content = await prisma.homeContent.findUnique({ where: { id: "home" } });
  return content ?? homeDefaults;
}

export async function getAboutContent() {
  const content = await prisma.aboutContent.findUnique({ where: { id: "about" } });
  return content ?? aboutDefaults;
}

export async function getContactInfo() {
  const content = await prisma.contactInfo.findUnique({ where: { id: "contact" } });
  return content ?? contactDefaults;
}
