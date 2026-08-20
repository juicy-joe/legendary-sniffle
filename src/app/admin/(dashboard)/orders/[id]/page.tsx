import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import OrderStatusControl from "@/components/admin/OrderStatusControl";
import DeleteEntityButton from "@/components/admin/DeleteEntityButton";
import { deleteOrder } from "../actions";
import type { OrderStatusValue } from "@/lib/order-status";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Order — Admin" };

type OrderItem = { slug: string; name: string; price: number; qty: number };

function parseItems(items: unknown): OrderItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (i): i is OrderItem =>
      typeof i === "object" &&
      i !== null &&
      typeof (i as OrderItem).slug === "string" &&
      typeof (i as OrderItem).name === "string" &&
      typeof (i as OrderItem).price === "number" &&
      typeof (i as OrderItem).qty === "number"
  );
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  const items = parseItems(order.items);

  return (
    <div className="max-w-2xl">
      <Link href="/admin/orders" className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink/65 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
      </Link>

      <div className="rounded-[6px] border border-ink/10 bg-paper p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-light text-ink font-feature-tabular">{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-ink/70">{order.customerName}</p>
            <a href={`mailto:${order.email}`} className="text-sm text-gold-dark hover:underline">
              {order.email}
            </a>
          </div>
          <DeleteEntityButton id={order.id} name={order.orderNumber} action={deleteOrder} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 border-y border-ink/10 py-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink/65">Shipping To</p>
            <p className="text-sm leading-relaxed text-ink/80">
              {order.address}
              <br />
              {order.city}
              {order.region ? `, ${order.region}` : ""} {order.postal}
              <br />
              {order.country}
            </p>
          </div>
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-ink/65">Delivery Method</p>
            <p className="text-sm text-ink/80">{order.shippingMethod}</p>
            <p className="mt-1 text-xs text-ink/60">
              Placed{" "}
              {order.createdAt.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">Items</p>
          <ul className="space-y-3">
            {items.map((item, i) => (
              <li key={`${item.slug}-${i}`} className="flex items-center justify-between text-sm">
                <span className="text-ink/80">
                  {item.name} <span className="text-ink/50">&times; {item.qty}</span>
                </span>
                <span className="text-ink/70 font-feature-tabular">
                  {formatPrice(item.price * item.qty)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-4 text-sm">
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
            <div className="flex justify-between border-t border-ink/10 pt-2 font-serif text-lg text-ink">
              <span>Total</span>
              <span className="font-feature-tabular">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-ink/10 pt-6">
          <p className="mb-3 text-[11px] uppercase tracking-[0.15em] text-ink/65">Status</p>
          <OrderStatusControl id={order.id} status={order.status as OrderStatusValue} />
        </div>
      </div>
    </div>
  );
}
