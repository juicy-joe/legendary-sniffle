import type { Metadata } from "next";
import CollectionLanding from "@/components/CollectionLanding";
import { getCatalog } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { jsonLdScriptProps } from "@/lib/json-ld";
import { siteUrl } from "@/lib/site";

const COLLECTION_NAME = "MoodMAX Collection";
const DESCRIPTION =
  "MoodMAX: mouth-blown crystalline glass table lamps with hand-painted gradients, designed by J. J. Finnbogason. Ambient mood lighting, not just brightness.";

export const metadata: Metadata = {
  title: "MoodMAX Collection — Hand-Blown Glass Mood Lamps",
  description: DESCRIPTION,
  alternates: { canonical: "/collections/moodmax" },
};

export default async function MoodMaxCollectionPage() {
  const catalog = await getCatalog();
  const settings = await getSettings();
  const products = catalog.filter((p) => p.collection === COLLECTION_NAME);

  return (
    <>
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
            { "@type": "ListItem", position: 2, name: "Table Lamps", item: `${siteUrl}/table-lamps` },
            { "@type": "ListItem", position: 3, name: "MoodMAX Collection" },
          ],
        })}
      />
      <script
        type="application/ld+json"
        {...jsonLdScriptProps({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "MoodMAX Collection",
          description: DESCRIPTION,
          url: `${siteUrl}/collections/moodmax`,
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
        eyebrow="MoodMAX Collection"
        headline="MoodMAX"
        intro="Mouth-blown crystalline glass table lamps, hand-painted with expressive gradients, made in collaboration with our partner European glass makers. Each sphere is designed to fill a room with atmosphere, not just brightness."
        story={`MoodMAX began with a simple idea: a table lamp should set a mood, not just light a room. Every sphere is mouth-blown from multi-layered crystalline glass, then hand-painted with a gradient — turquoise into purple, red into gold, amber into honey — unique to that one piece.\n\nWhen lit, the layered glass diffuses the light into a soft, atmospheric glow rather than a hard point of brightness, which is what makes MoodMAX work as an ambient mood light rather than a reading lamp. Each colourway is designed by J. J. Finnbogason and produced in small runs with our partner European glass makers.`}
        materials="Mouth-blown crystalline glass"
        dimensions="⌀ 20cm"
        designer="J. J. Finnbogason"
        products={products}
      />
    </>
  );
}
