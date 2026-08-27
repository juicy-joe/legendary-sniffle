import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ManualOrderForm from "@/components/admin/ManualOrderForm";

export const metadata = { title: "New Manual Order — Admin" };

export default async function NewManualOrderPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: { id: true, slug: true, name: true, price: true },
  });

  return (
    <div>
      <Link href="/admin/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/65 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-ink">New Manual Order</h1>
        <p className="mt-1 text-sm text-ink/65">
          For orders taken by phone and paid straight into the bank account. This creates a real order — same
          list, same shipping/tracking flow — and sends the customer the same confirmation email a Stripe order
          would.
        </p>
      </div>

      <ManualOrderForm products={products} />
    </div>
  );
}
