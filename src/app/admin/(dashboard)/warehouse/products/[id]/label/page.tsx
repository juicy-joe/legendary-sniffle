import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateBarcodeDataUri } from "@/lib/barcode";
import BarcodeLabelSheet from "@/components/admin/BarcodeLabelSheet";

export const metadata = { title: "Print Label — Admin" };

// ?qty=12 prints 12 copies of the same label on one sheet to cut apart —
// capped well above any realistic single restock batch so a typo in the
// URL can't ask bwip-js to render an unreasonable number of images.
const MAX_QTY = 100;

export default async function ProductLabelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ qty?: string }>;
}) {
  const { id } = await params;
  const { qty } = await searchParams;
  const product = await prisma.product.findUnique({
    where: { id },
    select: { name: true, sku: true, price: true },
  });
  if (!product) notFound();

  const count = Math.min(MAX_QTY, Math.max(1, Number(qty) || 1));
  const imageDataUri = await generateBarcodeDataUri(product.sku);
  const labels = Array.from({ length: count }, () => ({
    key: product.sku,
    name: product.name,
    sku: product.sku,
    price: product.price,
    imageDataUri,
  }));

  return (
    <BarcodeLabelSheet
      title={`Label — ${product.name}`}
      subtitle={`${product.sku} · ${count} label${count === 1 ? "" : "s"}`}
      labels={labels}
    />
  );
}
