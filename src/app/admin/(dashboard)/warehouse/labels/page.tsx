import { prisma } from "@/lib/prisma";
import { generateBarcodeDataUri } from "@/lib/barcode";
import BarcodeLabelSheet from "@/components/admin/BarcodeLabelSheet";

export const metadata = { title: "Print All Labels — Admin" };

export default async function AllLabelsPage() {
  const products = await prisma.product.findMany({
    orderBy: { sku: "asc" },
    select: { id: true, name: true, sku: true, price: true },
  });

  const labels = await Promise.all(
    products.map(async (p) => ({
      key: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      imageDataUri: await generateBarcodeDataUri(p.sku),
    }))
  );

  return (
    <BarcodeLabelSheet
      title="Print All Labels"
      subtitle={`One label per product · ${products.length} total`}
      labels={labels}
    />
  );
}
