// Migrates the existing static catalog (src/lib/products.ts) into the
// database, plus seeds sensible defaults for the singleton content tables,
// menus, footer, and social links so the site has real data to manage
// through the admin from day one.
//
// Run with: npx prisma db seed

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { designers as staticDesigners, products as staticProducts } from "../src/lib/products";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Combining Diacritical Marks block is U+0300-U+036F. Built from char codes
// (not typed literally) so there's no ambiguity about which characters this
// regex actually contains.
const DIACRITICS_RE = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  "g"
);

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_RE, "") // strip diacritics, e.g. "é" -> "e"
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding designers...");
  const designerMap = new Map<string, string>(); // name -> id
  for (const d of staticDesigners) {
    const record = await prisma.designer.upsert({
      where: { id: slugify(d.name) },
      update: { origin: d.origin, bio: d.bio },
      create: { id: slugify(d.name), name: d.name, origin: d.origin, bio: d.bio },
    });
    designerMap.set(d.name, record.id);
  }

  console.log("Seeding collections...");
  const collectionNames = Array.from(new Set(staticProducts.map((p) => p.collection)));
  const collectionMap = new Map<string, string>();
  for (const name of collectionNames) {
    const slug = slugify(name);
    const record = await prisma.collection.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    collectionMap.set(name, record.id);
  }

  console.log("Seeding categories...");
  const categoryNames = Array.from(new Set(staticProducts.map((p) => p.category)));
  const categoryMap = new Map<string, string>();
  for (const name of categoryNames) {
    const slug = slugify(name);
    const record = await prisma.category.upsert({
      where: { slug },
      update: { name },
      create: { name, slug },
    });
    categoryMap.set(name, record.id);
  }

  console.log("Seeding products...");
  for (const p of staticProducts) {
    const designerId = designerMap.get(p.designer);
    const collectionId = collectionMap.get(p.collection);
    const categoryId = categoryMap.get(p.category);
    if (!designerId || !collectionId || !categoryId) {
      throw new Error(`Missing relation for product ${p.slug}`);
    }

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        price: p.price,
        materials: p.materials,
        dimensions: p.dimensions,
        description: p.description,
        story: p.story,
        featured: p.featured ?? false,
        limited: p.limited ?? false,
        palette: p.palette,
        shade: p.shade,
        base: p.base,
        designerId,
        collectionId,
        categoryId,
        images: p.images
          ? {
              create: p.images.map((img, i) => ({
                url: img.src,
                label: img.label,
                swatch: img.swatch,
                sortOrder: i,
              })),
            }
          : undefined,
      },
    });
  }

  console.log("Seeding home/about/contact content...");
  await prisma.homeContent.upsert({
    where: { id: "home" },
    update: {},
    create: {
      id: "home",
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
    },
  });

  await prisma.aboutContent.upsert({
    where: { id: "about" },
    update: {},
    create: {
      id: "about",
      heroHeadline: "We believe light deserves to be treated like sculpture.",
      heroSubtext:
        "SaFaLight exists to give a small circle of master designers the time, materials, and patience their work deserves — and to bring the result into homes that will keep it for generations.",
    },
  });

  await prisma.contactInfo.upsert({
    where: { id: "contact" },
    update: {},
    create: {
      id: "contact",
      email: "johannj@finnbogasondesign.com",
      phone: "+1 (555) 018-2043",
      address: "24 Ateljé Row, New York, NY",
      hours: "Tue-Sat, 11am-6pm, by appointment",
    },
  });

  await prisma.settings.upsert({
    where: { id: "settings" },
    update: {},
    create: { id: "settings" },
  });

  console.log("Seeding menus...");
  const menus: { location: string; label: string; href: string }[] = [
    { location: "navbar", label: "Home", href: "/" },
    { location: "navbar", label: "Products", href: "/products" },
    { location: "navbar", label: "About Us", href: "/about" },
    { location: "navbar", label: "Contact", href: "/contact" },
    { location: "footer-explore", label: "Home", href: "/" },
    { location: "footer-explore", label: "Products", href: "/products" },
    { location: "footer-explore", label: "About Us", href: "/about" },
    { location: "footer-explore", label: "Contact", href: "/contact" },
    { location: "footer-collections", label: "Marble", href: "/products?category=Marble" },
    { location: "footer-collections", label: "Brass", href: "/products?category=Brass" },
    { location: "footer-collections", label: "Alabaster", href: "/products?category=Alabaster" },
    { location: "footer-collections", label: "The Chroma Editions", href: "/products?category=Glass" },
  ];
  const sortCounters: Record<string, number> = {};
  for (const link of menus) {
    const sortOrder = sortCounters[link.location] ?? 0;
    sortCounters[link.location] = sortOrder + 1;
    await prisma.menuItem.upsert({
      where: { id: `${link.location}-${slugify(link.label)}` },
      update: {},
      create: {
        id: `${link.location}-${slugify(link.label)}`,
        label: link.label,
        href: link.href,
        location: link.location,
        sortOrder,
      },
    });
  }

  console.log("Seeding social links...");
  const socials = [
    { platform: "instagram", url: "#" },
    { platform: "facebook", url: "#" },
    { platform: "linkedin", url: "#" },
  ];
  for (const s of socials) {
    await prisma.socialLink.upsert({
      where: { id: s.platform },
      update: {},
      create: { id: s.platform, platform: s.platform, url: s.url },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
