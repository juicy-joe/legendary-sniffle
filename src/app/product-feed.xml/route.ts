// A Google Merchant Center product feed (RSS 2.0 + the "g:" Shopping
// namespace). g:id is the stable Olleria SKU (TL####) — the same
// identifier used in Product JSON-LD, GA4 ecommerce events, and order
// records, per the single-product-identity principle. mpn mirrors that
// same SKU. gtin is only included when a genuine one has been entered on
// the product; otherwise g:identifier_exists=no is set instead of
// fabricating one, per Google's own guidance for goods with no
// real-world identifier.
import { getCatalog } from "@/lib/catalog";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/site";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export async function GET() {
  const [products, settings] = await Promise.all([getCatalog("en"), getSettings()]);

  const items = products
    // A product with no photography yet has nothing Merchant Center can
    // actually show or validate against — skip it rather than submit a
    // guaranteed-to-be-rejected item.
    .filter((p) => p.images && p.images.length > 0)
    .map((p) => {
      const url = `${siteUrl}/products/${p.slug}`;
      const images = p.images!;
      const additionalImages = images
        .slice(1, 11)
        .map((img) => `      <g:additional_image_link>${escapeXml(img.src)}</g:additional_image_link>`)
        .join("\n");

      return `  <item>
    <g:id>${escapeXml(p.sku)}</g:id>
    <title>${cdata(`${p.name} — Designer Table Lamp`)}</title>
    <description>${cdata(p.description)}</description>
    <link>${escapeXml(url)}</link>
    <g:image_link>${escapeXml(images[0].src)}</g:image_link>
${additionalImages}
    <g:availability>${p.availableStock > 0 ? "in stock" : "out of stock"}</g:availability>
    <g:price>${p.price}.00 EUR</g:price>
    <g:brand>${escapeXml(settings.siteName)}</g:brand>
    <g:condition>new</g:condition>
    <g:product_type>${escapeXml(`${p.category} > ${p.collection}`)}</g:product_type>
    <g:mpn>${escapeXml(p.sku)}</g:mpn>
${p.gtin ? `    <g:gtin>${escapeXml(p.gtin)}</g:gtin>` : `    <g:identifier_exists>no</g:identifier_exists>`}
    <g:shipping>
      <g:country>ES</g:country>
      <g:service>Standard</g:service>
      <g:price>${settings.euRegularShippingPrice}.00 EUR</g:price>
    </g:shipping>
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${escapeXml(settings.siteName)} Product Feed</title>
  <link>${siteUrl}</link>
  <description>${escapeXml(settings.defaultMetaDesc ?? "")}</description>
${items}
</channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
