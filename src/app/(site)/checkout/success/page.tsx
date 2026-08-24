import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import RevealOnScroll from "@/components/RevealOnScroll";
import ClearCartOnMount from "@/components/ClearCartOnMount";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false, follow: false },
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId) notFound();

  // Fetched fresh from Stripe rather than trusted from the URL — a
  // session_id is only ever useful if Stripe itself confirms it exists and
  // was actually paid, not because the query string says so.
  const session = await getStripe()
    .checkout.sessions.retrieve(sessionId, { expand: ["line_items"] })
    .catch(() => null);

  if (!session || session.payment_status !== "paid") notFound();

  // The webhook (the only thing that actually creates the Order row) is
  // usually near-instant but isn't guaranteed to have landed before the
  // browser gets here — the page still confirms the real charge either
  // way, just without our friendly SFL-###### order number until it has.
  const order = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });

  const lineItems = session.line_items?.data ?? [];

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center md:px-10 md:py-28">
      <ClearCartOnMount />
      <RevealOnScroll>
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold-dark">
          <Check className="h-6 w-6" />
        </div>
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold-dark">
          Thank You
        </p>
        <h1 className="font-serif text-4xl font-light text-ink md:text-5xl">
          Order Confirmed
        </h1>
        <p className="mx-auto mt-4 max-w-md text-ink/60">
          {order
            ? <>Order <span className="font-medium text-ink">{order.orderNumber}</span> is confirmed — a receipt has been sent to {session.customer_details?.email}.</>
            : <>Your payment went through — a receipt has been sent to {session.customer_details?.email}. Your order is being recorded now.</>}
        </p>

        <div className="mt-10 space-y-4 rounded-[6px] border border-ink/10 bg-paper-dim p-6 text-left">
          <ul className="space-y-3">
            {lineItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-ink/80">
                  {item.description} <span className="text-ink/50">&times; {item.quantity}</span>
                </span>
                <span className="text-ink/70 font-feature-tabular">
                  {formatPrice((item.amount_total ?? 0) / 100)}
                </span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between text-ink/60">
              <span>Subtotal</span>
              <span className="font-feature-tabular">{formatPrice((session.amount_subtotal ?? 0) / 100)}</span>
            </div>
            <div className="flex justify-between text-ink/60">
              <span>Shipping</span>
              <span className="font-feature-tabular">
                {formatPrice((session.shipping_cost?.amount_total ?? 0) / 100)}
              </span>
            </div>
            <div className="flex justify-between text-ink/60">
              <span>Tax</span>
              <span className="font-feature-tabular">
                {formatPrice((session.total_details?.amount_tax ?? 0) / 100)}
              </span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-2 font-serif text-lg text-ink">
              <span>Total</span>
              <span className="font-feature-tabular">{formatPrice((session.amount_total ?? 0) / 100)}</span>
            </div>
          </div>
        </div>

        <Link
          href="/products"
          className="mt-10 inline-flex items-center gap-2 border-b border-ink/40 pb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-ink transition-colors hover:border-ink"
        >
          Continue Browsing
        </Link>
      </RevealOnScroll>
    </div>
  );
}
