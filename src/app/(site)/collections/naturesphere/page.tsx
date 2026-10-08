import type { Metadata } from "next";
import CollectionLanding from "@/components/CollectionLanding";
import { getCatalog } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { jsonLdScriptProps } from "@/lib/json-ld";
import { siteUrl } from "@/lib/site";
import TrackViewItemList from "@/components/analytics/TrackViewItemList";
import { getLocale, getContentFields } from "@/lib/i18n";

const COLLECTION_NAME = "NatureSPHERE's";
const INTRO_EN =
  "Hand-blown crystalline glass spheres, coloured through during melting so each carries the colours of the Icelandic landscape — moss, volcanic rock, geothermal mist — in real depth, not just on the surface. Every piece is individually shaped, so no two are ever quite alike.";
const STORY_EN = `NatureSPHERE's takes its colour and texture directly from Iceland: the cream and moss-green of geothermal valleys, the amber and ember-red of volcanic rock, the frost-white of a winter coastline. Each sphere is mouth-blown from multi-layered crystalline glass, its colour introduced directly into the molten glass during melting rather than applied afterward, so the pattern running through the glass is genuinely one-of-a-kind — no two pieces distribute colour the same way.\n\nAt 30cm in diameter, these are the larger of our two glass collections, designed to read as a sculptural object on a console or sideboard as much as a light source. Every piece is designed by J. J. Finnbogason and produced in small runs with our partner European glass makers.`;
const DESCRIPTION =
  "NatureSPHERE's: hand-blown crystalline glass spheres coloured through during melting, inspired by the Icelandic landscape — each one a unique, one-of-a-kind piece designed by J. J. Finnbogason.";

export const metadata: Metadata = {
  title: "NatureSPHERE's Collection — Hand-Blown Glass Lamps",
  description: DESCRIPTION,
  alternates: { canonical: "/collections/naturesphere" },
};

export default async function NatureSphereCollectionPage() {
  const locale = await getLocale();
  const [catalog, settings, translations] = await Promise.all([
    getCatalog(),
    getSettings(),
    getContentFields(locale, "CollectionPage", "naturesphere"),
  ]);
  const products = catalog.filter((p) => p.collection === COLLECTION_NAME);
  const intro = translations.intro ?? INTRO_EN;
  const story = translations.story ?? STORY_EN;
  const materials = translations.materials ?? "Mouth-blown crystalline glass";

  return (
    <>
      <TrackViewItemList products={products} listName="NatureSPHERE's Collection" />
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Table Lamps", item: `${siteUrl}/table-lamps` },
            { "@type": "ListItem", position: 3, name: "NatureSPHERE's Collection" },
          ],
        })}
      />
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "NatureSPHERE's Collection",
          description: DESCRIPTION,
          url: `${siteUrl}/collections/naturesphere`,
          isPartOf: { "@type": "WebSite", name: settings.siteName, url: siteUrl },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: products.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${siteUrl}/products/${p.slug}`,
              name: p.name,
            })),
          },
        })}
      />
      <CollectionLanding
        listName="NatureSPHERE's Collection"
        eyebrow="NatureSPHERE's Collection"
        headline="NatureSPHERE's"
        intro={intro}
        story={story}
        materials={materials}
        dimensions="⌀ 30cm"
        designer="J. J. Finnbogason"
        products={products}
      />
    </>
  );
}
