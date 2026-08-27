import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { getContactInfo } from "@/lib/content";
import { formatPrice } from "@/lib/format";
import PrintInvoiceButton from "@/components/admin/PrintInvoiceButton";

export const metadata = { title: "Invoice — Admin" };

type OrderItem = { slug: string; name: string; price: number; qty: number };

function parseItems(items: unknown): OrderItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (i): i is OrderItem =>
      typeof i === "object" &&
      i !== null &&
      typeof (i as OrderItem).name === "string" &&
      typeof (i as OrderItem).price === "number" &&
      typeof (i as OrderItem).qty === "number"
  );
}

export default async function OrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings, contact] = await Promise.all([
    prisma.order.findUnique({ where: { id } }),
    getSettings(),
    getContactInfo(),
  ]);
  if (!order) notFound();

  const items = parseItems(order.items);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink/65 hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Order
        </Link>
        <PrintInvoiceButton />
      </div>

      <div className="rounded-[6px] border border-ink/10 bg-paper p-10 print:rounded-none print:border-0 print:p-0">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-ink/10 pb-8">
          <div>
            <p className="font-serif text-2xl font-light text-ink">{settings.siteName}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              {contact.address}
              <br />
              {contact.email}
              <br />
              {contact.phone}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-light uppercase tracking-[0.1em] text-ink">Invoice</p>
            <p className="mt-2 text-sm text-ink/60 font-feature-tabular">{order.orderNumber}</p>
            <p className="text-sm text-ink/60">
              {order.createdAt.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink/50">Billed To</p>
            <p className="text-sm leading-relaxed text-ink/80">
              {order.customerName}
              <br />
              {order.address}
              <br />
              {order.city}
              {order.region ? `, ${order.region}` : ""} {order.postal}
              <br />
              {order.country}
              <br />
              {order.email}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink/50">Payment</p>
            <p className="text-sm text-ink/80">{order.paymentMethod || "Stripe Checkout"}</p>
          </div>
        </div>

        <table className="mt-10 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink/15 text-[11px] uppercase tracking-[0.1em] text-ink/50">
              <th className="pb-2 font-medium">Item</th>
              <th className="pb-2 text-right font-medium">Qty</th>
              <th className="pb-2 text-right font-medium">Price</th>
              <th className="pb-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={`${item.slug}-${i}`} className="border-b border-ink/5">
                <td className="py-3 text-ink/80">{item.name}</td>
                <td className="py-3 text-right font-feature-tabular text-ink/70">{item.qty}</td>
                <td className="py-3 text-right font-feature-tabular text-ink/70">{formatPrice(item.price)}</td>
                <td className="py-3 text-right font-feature-tabular text-ink/80">{formatPrice(item.price * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-ink/60">
              <span>Subtotal</span>
              <span className="font-feature-tabular">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/60">
              <span>Shipping</span>
              <span className="font-feature-tabular">
                {order.shippingCost === 0 ? "Included" : formatPrice(order.shippingCost)}
              </span>
            </div>
            <div className="flex justify-between text-ink/60">
              <span>Tax</span>
              <span className="font-feature-tabular">{formatPrice(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-ink/15 pt-2 font-serif text-lg text-ink">
              <span>Total</span>
              <span className="font-feature-tabular">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <p className="mt-12 border-t border-ink/10 pt-6 text-center text-xs text-ink/40">
          Thank you for your business.
        </p>
      </div>
    </div>
  );
}
