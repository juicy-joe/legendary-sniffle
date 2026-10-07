import Link from "next/link";
import clsx from "clsx";
import { prisma } from "@/lib/prisma";
import { locales, localeNames, type Locale } from "@/lib/i18n";
import { uiKeySections } from "@/lib/i18n-keys";
import {
  getHomeContent,
  getAboutContent,
  getProductsContent,
  getConsultingContent,
  getTradeContent,
  getContactInfo,
} from "@/lib/content";
import { getCatalog, getDesigners, getCollections } from "@/lib/catalog";
import UiTranslationsEditor from "@/components/admin/UiTranslationsEditor";
import ContentTranslationsEditor, {
  type ContentField,
} from "@/components/admin/ContentTranslationsEditor";

export const metadata = { title: "Translations — Admin" };

function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

export default async function AdminTranslationsPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const locale: Locale = isLocale(params.locale) ? params.locale : locales[0];
  const tab = params.tab === "content" ? "content" : "interface";

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-light text-ink">Translations</h1>
      <p className="mb-8 max-w-2xl text-sm text-ink/65">
        English is the site&rsquo;s base language and is edited on each page&rsquo;s own admin form (Products,
        Designers, Content, Menus) — this page only holds the overrides shown to visitors of every other language.
        Leaving a field blank shows the English text instead.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {locales.map((l) => (
          <Link
            key={l}
            href={`/admin/translations?locale=${l}&tab=${tab}`}
            className={clsx(
              "rounded-[3px] border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors",
              l === locale
                ? "border-gold-dark bg-gold-dark/10 text-gold-dark"
                : "border-ink/20 text-ink/60 hover:border-ink"
            )}
          >
            {localeNames[l]}
          </Link>
        ))}
      </div>

      <div className="mb-8 flex gap-6 border-b border-ink/10">
        <TabLink locale={locale} tab="interface" active={tab === "interface"}>
          Interface Text
        </TabLink>
        <TabLink locale={locale} tab="content" active={tab === "content"}>
          Page Content
        </TabLink>
      </div>

      {tab === "interface" ? (
        <InterfaceTab locale={locale} />
      ) : (
        <ContentTab locale={locale} />
      )}
    </div>
  );
}

function TabLink({
  locale,
  tab,
  active,
  children,
}: {
  locale: Locale;
  tab: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/admin/translations?locale=${locale}&tab=${tab}`}
      className={clsx(
        "-mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
        active ? "border-gold-dark text-ink" : "border-transparent text-ink/55 hover:text-ink"
      )}
    >
      {children}
    </Link>
  );
}

async function InterfaceTab({ locale }: { locale: Locale }) {
  const rows = await prisma.uiTranslation.findMany({ where: { locale }, select: { key: true, value: true } });
  const values: Record<string, string> = {};
  for (const row of rows) values[row.key] = row.value;

  return <UiTranslationsEditor locale={locale} sections={uiKeySections} values={values} />;
}

async function ContentTab({ locale }: { locale: Locale }) {
  const [products, designers, collections, home, about, productsPage, consulting, trade, contact, menuItems] =
    await Promise.all([
      getCatalog("en"),
      getDesigners("en"),
      getCollections("en"),
      getHomeContent("en"),
      getAboutContent("en"),
      getProductsContent("en"),
      getConsultingContent("en"),
      getTradeContent("en"),
      getContactInfo("en"),
      prisma.menuItem.findMany({ orderBy: [{ location: "asc" }, { sortOrder: "asc" }] }),
    ]);

  const recordIds = [
    ...products.map((p) => p.id),
    ...designers.map((d) => d.id),
    ...collections.map((c) => c.id),
    ...menuItems.map((m) => m.id),
    "home",
    "about",
    "products",
    "consulting",
    "trade",
    "contact",
    "moodmax",
    "naturesphere",
  ];
  const overrideRows = await prisma.contentTranslation.findMany({
    where: { locale, recordId: { in: recordIds } },
    select: { model: true, recordId: true, field: true, value: true },
  });
  const overrides = new Map<string, string>();
  for (const row of overrideRows) overrides.set(`${row.model}:${row.recordId}:${row.field}`, row.value);
  const value = (model: string, recordId: string, field: string) => overrides.get(`${model}:${recordId}:${field}`) ?? "";

  const siteContentFields: ContentField[] = [
    { model: "HomeContent", recordId: "home", field: "heroEyebrow", label: "Home — Hero eyebrow", english: home.heroEyebrow, value: value("HomeContent", "home", "heroEyebrow") },
    { model: "HomeContent", recordId: "home", field: "heroHeadline", label: "Home — Hero headline", english: home.heroHeadline, value: value("HomeContent", "home", "heroHeadline") },
    { model: "HomeContent", recordId: "home", field: "heroHeadlineAccent", label: "Home — Hero headline accent", english: home.heroHeadlineAccent, value: value("HomeContent", "home", "heroHeadlineAccent") },
    { model: "HomeContent", recordId: "home", field: "heroSubtext", label: "Home — Hero subtext", english: home.heroSubtext, value: value("HomeContent", "home", "heroSubtext"), multiline: true },
    { model: "HomeContent", recordId: "home", field: "chromaHeadline", label: "Home — Featured collection headline", english: home.chromaHeadline, value: value("HomeContent", "home", "chromaHeadline") },
    { model: "HomeContent", recordId: "home", field: "chromaSubtext", label: "Home — Featured collection subtext", english: home.chromaSubtext, value: value("HomeContent", "home", "chromaSubtext"), multiline: true },
    { model: "HomeContent", recordId: "home", field: "craftHeadline", label: "Home — Craft section headline", english: home.craftHeadline, value: value("HomeContent", "home", "craftHeadline") },
    { model: "HomeContent", recordId: "home", field: "craftSubtext", label: "Home — Craft section subtext", english: home.craftSubtext, value: value("HomeContent", "home", "craftSubtext"), multiline: true },
    { model: "AboutContent", recordId: "about", field: "heroHeadline", label: "About — Hero headline", english: about.heroHeadline, value: value("AboutContent", "about", "heroHeadline") },
    { model: "AboutContent", recordId: "about", field: "heroSubtext", label: "About — Hero subtext", english: about.heroSubtext, value: value("AboutContent", "about", "heroSubtext"), multiline: true },
    { model: "ProductsContent", recordId: "products", field: "heroEyebrow", label: "Products — Eyebrow", english: productsPage.heroEyebrow, value: value("ProductsContent", "products", "heroEyebrow") },
    { model: "ProductsContent", recordId: "products", field: "heroHeadline", label: "Products — Headline", english: productsPage.heroHeadline, value: value("ProductsContent", "products", "heroHeadline") },
    { model: "ProductsContent", recordId: "products", field: "intro", label: "Products — Intro", english: productsPage.intro, value: value("ProductsContent", "products", "intro"), multiline: true },
    { model: "ConsultingContent", recordId: "consulting", field: "heroEyebrow", label: "Consulting — Eyebrow", english: consulting.heroEyebrow, value: value("ConsultingContent", "consulting", "heroEyebrow") },
    { model: "ConsultingContent", recordId: "consulting", field: "heroHeadline", label: "Consulting — Headline", english: consulting.heroHeadline, value: value("ConsultingContent", "consulting", "heroHeadline") },
    { model: "ConsultingContent", recordId: "consulting", field: "heroSubtext", label: "Consulting — Subtext", english: consulting.heroSubtext, value: value("ConsultingContent", "consulting", "heroSubtext"), multiline: true },
    { model: "TradeContent", recordId: "trade", field: "heroEyebrow", label: "B2B — Eyebrow", english: trade.heroEyebrow, value: value("TradeContent", "trade", "heroEyebrow") },
    { model: "TradeContent", recordId: "trade", field: "heroHeadline", label: "B2B — Headline", english: trade.heroHeadline, value: value("TradeContent", "trade", "heroHeadline") },
    { model: "TradeContent", recordId: "trade", field: "heroSubtext", label: "B2B — Subtext", english: trade.heroSubtext, value: value("TradeContent", "trade", "heroSubtext"), multiline: true },
    { model: "ContactInfo", recordId: "contact", field: "hours", label: "Contact — Hours", english: contact.hours, value: value("ContactInfo", "contact", "hours") },
  ];

  const navFields: ContentField[] = menuItems.map((m) => ({
    model: "MenuItem",
    recordId: m.id,
    field: "label",
    label: `${m.location} — ${m.label}`,
    english: m.label,
    value: value("MenuItem", m.id, "label"),
  }));

  const collectionPageFields: ContentField[] = [
    {
      model: "CollectionPage",
      recordId: "moodmax",
      field: "intro",
      label: "MoodMAX Page — Intro",
      english:
        "Mouth-blown crystalline glass table lamps, hand-painted with expressive gradients, made in collaboration with our partner European glass makers. Each sphere is designed to fill a room with atmosphere, not just brightness.",
      value: value("CollectionPage", "moodmax", "intro"),
      multiline: true,
    },
    {
      model: "CollectionPage",
      recordId: "moodmax",
      field: "story",
      label: "MoodMAX Page — Story",
      english:
        "MoodMAX began with a simple idea: a table lamp should set a mood, not just light a room. Every sphere is mouth-blown from multi-layered crystalline glass, then hand-painted with a gradient — turquoise into purple, red into gold, amber into honey — unique to that one piece.\n\nWhen lit, the layered glass diffuses the light into a soft, atmospheric glow rather than a hard point of brightness, which is what makes MoodMAX work as an ambient mood light rather than a reading lamp. Each colourway is designed by J. J. Finnbogason and produced in small runs with our partner European glass makers.",
      value: value("CollectionPage", "moodmax", "story"),
      multiline: true,
    },
    {
      model: "CollectionPage",
      recordId: "moodmax",
      field: "materials",
      label: "MoodMAX Page — Materials",
      english: "Mouth-blown crystalline glass",
      value: value("CollectionPage", "moodmax", "materials"),
    },
    {
      model: "CollectionPage",
      recordId: "naturesphere",
      field: "intro",
      label: "NatureSPHERE's Page — Intro",
      english:
        "Hand-blown crystalline glass spheres, coloured through during melting so each carries the colours of the Icelandic landscape — moss, volcanic rock, geothermal mist — in real depth, not just on the surface. Every piece is individually shaped, so no two are ever quite alike.",
      value: value("CollectionPage", "naturesphere", "intro"),
      multiline: true,
    },
    {
      model: "CollectionPage",
      recordId: "naturesphere",
      field: "story",
      label: "NatureSPHERE's Page — Story",
      english:
        "NatureSPHERE's takes its colour and texture directly from Iceland: the cream and moss-green of geothermal valleys, the amber and ember-red of volcanic rock, the frost-white of a winter coastline. Each sphere is mouth-blown from multi-layered crystalline glass, its colour introduced directly into the molten glass during melting rather than applied afterward, so the pattern running through the glass is genuinely one-of-a-kind — no two pieces distribute colour the same way.\n\nAt 30cm in diameter, these are the larger of our two glass collections, designed to read as a sculptural object on a console or sideboard as much as a light source. Every piece is designed by J. J. Finnbogason and produced in small runs with our partner European glass makers.",
      value: value("CollectionPage", "naturesphere", "story"),
      multiline: true,
    },
    {
      model: "CollectionPage",
      recordId: "naturesphere",
      field: "materials",
      label: "NatureSPHERE's Page — Materials",
      english: "Mouth-blown crystalline glass",
      value: value("CollectionPage", "naturesphere", "materials"),
    },
  ];

  const collectionFields: ContentField[] = collections
    .filter((c) => c.description)
    .map((c) => ({
      model: "Collection",
      recordId: c.id,
      field: "description",
      label: `${c.name} — Description`,
      english: c.description ?? "",
      value: value("Collection", c.id, "description"),
      multiline: true,
    }));

  const designerFields: ContentField[] = designers.map((d) => ({
    model: "Designer",
    recordId: d.id,
    field: "bio",
    label: `${d.name} — Bio`,
    english: d.bio,
    value: value("Designer", d.id, "bio"),
    multiline: true,
  }));

  const productFields: ContentField[] = products.flatMap((p) => [
    {
      model: "Product",
      recordId: p.id,
      field: "description",
      label: `${p.name} — Description`,
      english: p.description,
      value: value("Product", p.id, "description"),
      multiline: true,
    },
    {
      model: "Product",
      recordId: p.id,
      field: "story",
      label: `${p.name} — Story`,
      english: p.story,
      value: value("Product", p.id, "story"),
      multiline: true,
    },
    {
      model: "Product",
      recordId: p.id,
      field: "materials",
      label: `${p.name} — Materials`,
      english: p.materials,
      value: value("Product", p.id, "materials"),
    },
    {
      model: "Product",
      recordId: p.id,
      field: "dimensions",
      label: `${p.name} — Dimensions`,
      english: p.dimensions,
      value: value("Product", p.id, "dimensions"),
    },
  ]);

  return (
    <div className="space-y-12">
      <ContentTranslationsEditor locale={locale} heading="Site Content" fields={siteContentFields} />
      <ContentTranslationsEditor locale={locale} heading="Navigation Labels" fields={navFields} />
      <ContentTranslationsEditor locale={locale} heading="Collections" fields={collectionFields} />
      <ContentTranslationsEditor locale={locale} heading="Collection Landing Pages" fields={collectionPageFields} />
      <ContentTranslationsEditor locale={locale} heading="Designers" fields={designerFields} collapsible />
      <ContentTranslationsEditor locale={locale} heading="Products" fields={productFields} collapsible groupEvery={3} />
    </div>
  );
}
