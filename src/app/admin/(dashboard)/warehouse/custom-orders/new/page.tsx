import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CustomOrderForm from "@/components/admin/CustomOrderForm";

export const metadata = { title: "New Custom Order — Admin" };

export default async function NewCustomOrderPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, sku: true },
  });

  return (
    <div>
      <Link
        href="/admin/warehouse/custom-orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/65 hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Custom Orders
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">New Custom Order</h1>
        <p className="mt-1 text-sm text-ink/65">
          A commissioned production run for a specific customer — tracked through its own lifecycle, separate from
          retail stock. Surplus units can be released into retail stock later, once the run is complete.
        </p>
      </div>

      <CustomOrderForm products={products} />
    </div>
  );
}
