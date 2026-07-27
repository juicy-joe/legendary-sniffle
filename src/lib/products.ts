export type LampPalette = "gold" | "ivory" | "onyx" | "bronze" | "smoke";

// One photo per lifestyle/room setting. `swatch` should match the glass's
// true colour — it's used as a graceful placeholder while a file isn't on
// disk yet, so drop the image at `src` (relative to /public) and it takes
// over automatically.
export type ProductPhoto = {
  src: string;
  label: string;
  swatch: string;
};

export type Product = {
  slug: string;
  name: string;
  designer: string;
  collection: string;
  price: number;
  category: "Marble" | "Brass" | "Alabaster" | "Ceramic" | "Crystal" | "Glass";
  palette: LampPalette;
  shade: "dome" | "drum" | "cone" | "sphere" | "pleated";
  base: "urn" | "column" | "sculpted" | "orb" | "disc";
  materials: string;
  dimensions: string;
  description: string;
  story: string;
  featured?: boolean;
  limited?: boolean;
  /** Real photography, when available. Falls back to the SVG study when absent. */
  images?: ProductPhoto[];
};

export const designers = [
  {
    name: "Étienne Voss",
    origin: "Geneva, Switzerland",
    bio: "A former sculptor trained in Carrara, Étienne Voss brings stone-carving precision to light. His pieces are quarried, not manufactured.",
  },
  {
    name: "Nadia Kessler",
    origin: "Vienna, Austria",
    bio: "Nadia Kessler studied under master glassblowers in Murano before founding her own atelier, known for gradient crystal work.",
  },
  {
    name: "Otto Reyne",
    origin: "Copenhagen, Denmark",
    bio: "Otto Reyne's minimalist brass forms have been exhibited at the Milan Design Triennale. He designs light the way others design silence.",
  },
  {
    name: "Marchetti & Lin",
    origin: "Milan, Italy / Kyoto, Japan",
    bio: "A cross-continental studio blending Italian maximalism with Japanese restraint, producing lamps that read as functional sculpture.",
  },
];

export const products: Product[] = [
  {
    slug: "aurelia-marble-dome",
    name: "Aurelia",
    designer: "Étienne Voss",
    collection: "The Quarry Collection",
    price: 4200,
    category: "Marble",
    palette: "ivory",
    shade: "dome",
    base: "urn",
    materials: "Honed Calacatta marble, brushed 24k gold-plated brass",
    dimensions: "H 58cm × ⌀ 32cm",
    description:
      "A single block of Calacatta marble, hand-turned into an urn base that carries light like a held breath.",
    story:
      "Each Aurelia base is cut from one continuous slab, so the veining flows unbroken from foot to shoulder — no two lamps are ever alike.",
    featured: true,
  },
  {
    slug: "solstice-brass-column",
    name: "Solstice",
    designer: "Otto Reyne",
    collection: "The Meridian Series",
    price: 2850,
    category: "Brass",
    palette: "gold",
    shade: "cone",
    base: "column",
    materials: "Solid brass, hand-patinated, linen-blend shade",
    dimensions: "H 71cm × ⌀ 26cm",
    description:
      "An architectural column in solid brass, finished by hand to develop a living patina that deepens with age.",
    story:
      "Reyne designed Solstice after a year studying Copenhagen's harbor cranes — the taper mimics their counterweighted grace.",
    featured: true,
  },
  {
    slug: "nocturne-crystal-sphere",
    name: "Nocturne",
    designer: "Nadia Kessler",
    collection: "The Murano Editions",
    price: 5600,
    category: "Crystal",
    palette: "smoke",
    shade: "sphere",
    base: "orb",
    materials: "Smoked hand-blown crystal, sterling silver fittings",
    dimensions: "H 46cm × ⌀ 30cm",
    description:
      "A smoked crystal orb suspended in silver, refracting light into a hundred quiet fractures across the room.",
    story:
      "Blown in a single breath by Kessler's Murano collaborators, each orb takes four attempts on average before one survives cooling.",
    featured: true,
    limited: true,
  },
  {
    slug: "kioku-alabaster-pleat",
    name: "Kioku",
    designer: "Marchetti & Lin",
    collection: "Studio Editions",
    price: 3950,
    category: "Alabaster",
    palette: "ivory",
    shade: "pleated",
    base: "sculpted",
    materials: "Translucent Persian alabaster, oxidized bronze",
    dimensions: "H 52cm × ⌀ 28cm",
    description:
      "Pleated alabaster panels diffuse light into a soft amber glow reminiscent of paper lanterns and stone lanterns alike.",
    story:
      "\"Kioku\" means memory — the pleats are cut to echo the folded paper lamps Lin's grandmother kept by her tea room.",
    featured: true,
  },
  {
    slug: "obsidian-ceramic-drum",
    name: "Obsidian",
    designer: "Étienne Voss",
    collection: "The Quarry Collection",
    price: 1980,
    category: "Ceramic",
    palette: "onyx",
    shade: "drum",
    base: "disc",
    materials: "Matte black stoneware, gold-leaf interior glaze",
    dimensions: "H 44cm × ⌀ 24cm",
    description:
      "A matte black stoneware drum, glazed in gold leaf on the interior so the light itself appears gilded.",
    story:
      "Voss fires each Obsidian shade twice — once for form, once to seal the interior gold leaf permanently into the clay.",
  },
  {
    slug: "meridian-glass-cone",
    name: "Meridian",
    designer: "Otto Reyne",
    collection: "The Meridian Series",
    price: 2400,
    category: "Glass",
    palette: "bronze",
    shade: "cone",
    base: "column",
    materials: "Bronze-toned mouth-blown glass, oak base",
    dimensions: "H 63cm × ⌀ 22cm",
    description:
      "A bronze-toned glass cone balanced on Danish oak — Reyne's study in warmth without ornament.",
    story:
      "The oak is sourced from the same Jutland forest that supplied Reyne's very first commission in 2009.",
  },
  {
    slug: "vesper-brass-orb",
    name: "Vesper",
    designer: "Nadia Kessler",
    collection: "The Murano Editions",
    price: 3300,
    category: "Brass",
    palette: "gold",
    shade: "sphere",
    base: "orb",
    materials: "Hand-hammered brass, opal glass diffuser",
    dimensions: "H 40cm × ⌀ 27cm",
    description:
      "A hammered brass sphere cradling an opal glass core — light glows through thousands of tiny facets.",
    story:
      "Named for the evening star, Vesper is designed to be the last light switched on and the first seen at dusk.",
  },
  {
    slug: "atelier-marble-disc",
    name: "Atelier",
    designer: "Marchetti & Lin",
    collection: "Studio Editions",
    price: 4750,
    category: "Marble",
    palette: "onyx",
    shade: "drum",
    base: "disc",
    materials: "Nero Marquina marble, brushed nickel",
    dimensions: "H 49cm × ⌀ 30cm",
    description:
      "A disc of Nero Marquina marble, its white veining left exposed like a signature across matte black stone.",
    story:
      "Atelier was designed as a pair with Obsidian — collectors often place the two on opposing ends of a console.",
    limited: true,
  },

  // ---------------------------------------------------------------------
  // The Chroma Editions — hand-blown glass spheres produced in partnership
  // with a family-run glassblowing atelier in Poland. Special colourways
  // and custom commissions are genuinely available on this line — see the
  // "story" copy below and the Contact page's "Request a Commission" option.
  // Names, prices, and designer credit are placeholders — edit freely.
  // Photos live in /public/products/<slug>/.
  // ---------------------------------------------------------------------
  {
    slug: "glacier-crackle-sphere",
    name: "Glacier",
    designer: "Nadia Kessler",
    collection: "The Chroma Editions",
    price: 2100,
    category: "Glass",
    palette: "smoke",
    shade: "sphere",
    base: "orb",
    materials: "Hand-blown crackled glass, brushed oak base",
    dimensions: "H 34cm × ⌀ 30cm",
    description:
      "A sphere of hand-blown crackled glass, its fractured blue veining catching light like sea ice at dusk.",
    story:
      "Glacier is blown at our partner atelier in Poland, where the glass is shocked mid-cool to fracture into its signature ice-vein pattern — every sphere cracks differently, and every crack is final.",
    images: [
      { src: "/products/glacier/IMG-20260203-WA0012.jpg", label: "Evening Study", swatch: "#4c6a86" },
      { src: "/products/glacier/IMG-20260203-WA0032.jpg", label: "Daylight", swatch: "#4c6a86" },
      { src: "/products/glacier/IMG-20260613-WA0003.jpg", label: "Living Room", swatch: "#4c6a86" },
    ],
  },
  {
    slug: "carnevale-confetti-sphere",
    name: "Carnevale",
    designer: "Nadia Kessler",
    collection: "The Chroma Editions",
    price: 3400,
    category: "Glass",
    palette: "gold",
    shade: "sphere",
    base: "orb",
    materials: "Hand-blown Murano-technique confetti glass, oak base",
    dimensions: "H 32cm × ⌀ 30cm",
    description:
      "A riot of hand-blown glass confetti suspended mid-swirl — emerald, amber, and garnet fused into a single casting, no two ever alike.",
    story:
      "Named for the Venetian carnival, Carnevale is hand-blown by our partner atelier in Poland using confetti techniques passed down from Murano. It's a piece we're glad to commission in a custom colourway — ask our design team.",
    images: [
      { src: "/products/carnevale/IMG-20260203-WA0008.jpg", label: "Evening", swatch: "#4f7a3a" },
      { src: "/products/carnevale/IMG-20260203-WA0009.jpg", label: "Study", swatch: "#4f7a3a" },
      { src: "/products/carnevale/IMG-20260613-WA0005.jpg", label: "Garden Terrace", swatch: "#4f7a3a" },
      { src: "/products/carnevale/IMG-20260613-WA0006.jpg", label: "Botanical Lounge", swatch: "#4f7a3a" },
    ],
  },
  {
    slug: "halo-chroma-sphere",
    name: "Halo",
    designer: "Nadia Kessler",
    collection: "The Chroma Editions",
    price: 2600,
    category: "Glass",
    palette: "bronze",
    shade: "sphere",
    base: "orb",
    materials: "Hand-blown ombré glass, walnut base",
    dimensions: "H 30cm × ⌀ 28cm",
    description:
      "A single sphere of hand-blown glass, gradient-cast from warm white to deep ember red — like a sunset caught mid-fall.",
    story:
      "Halo is the quiet answer to Carnevale: one uninterrupted gradient, so the colour itself becomes the ornament. Alternate gradients — dusk blue, rose quartz, verdigris — are in development at the atelier; ask our design team about commissioning one early.",
    images: [
      { src: "/products/halo/IMG-20260204-WA0025.jpg", label: "Dusk", swatch: "#d1401f" },
      { src: "/products/halo/IMG-20260204-WA0026.jpg", label: "Studio", swatch: "#d1401f" },
      { src: "/products/halo/IMG-20260613-WA0002.jpg", label: "Evening Lounge", swatch: "#d1401f" },
    ],
  },
  {
    slug: "ember-amber-sphere",
    name: "Ember",
    designer: "Nadia Kessler",
    collection: "The Chroma Editions",
    price: 1900,
    category: "Glass",
    palette: "bronze",
    shade: "sphere",
    base: "orb",
    materials: "Hand-blown amber inclusion glass, oak base",
    dimensions: "H 30cm × ⌀ 28cm",
    description:
      "Deep amber and garnet inclusions suspended in hand-blown glass, glowing like coals held inside a sphere of honey.",
    story:
      "Ember shares its glass recipe with Carnevale but is blown in a single warm colourway — a quieter, more concentrated piece for a smaller room. Like every Chroma piece, it can be commissioned in an alternate palette.",
    limited: true,
    images: [
      { src: "/products/ember/IMG-20260203-WA0024.jpg", label: "Evening", swatch: "#c9601f" },
      { src: "/products/ember/IMG-20260203-WA0026.jpg", label: "Daylight", swatch: "#c9601f" },
      { src: "/products/ember/IMG-20260613-WA0004.jpg", label: "Fireside", swatch: "#c9601f" },
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: Product, count = 3) {
  return products
    .filter(
      (p) =>
        p.slug !== product.slug &&
        (p.designer === product.designer || p.category === product.category)
    )
    .slice(0, count);
}

export const categories = Array.from(
  new Set(products.map((p) => p.category))
);
