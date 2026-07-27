"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ShoppingBag } from "lucide-react";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";
import { getProduct } from "@/lib/products";
import { shippingMethods } from "@/lib/shipping";
import { EASE } from "@/lib/motion";
import LampIllustration from "./LampIllustration";
import ProductPhoto from "./ProductPhoto";

type Step = "shipping" | "method" | "review" | "done";

const steps: { id: Step; label: string }[] = [
  { id: "shipping", label: "Shipping Address" },
  { id: "method", label: "Delivery Method" },
  { id: "review", label: "Review & Place Order" },
];

type Address = {
  name: string;
  email: string;
  address: string;
  city: string;
  region: string;
  postal: string;
  country: string;
};

const emptyAddress: Address = {
  name: "",
  email: "",
  address: "",
  city: "",
  region: "",
  postal: "",
  country: "",
};

export default function CheckoutFlow() {
  const { lines, subtotal, clear } = useCart();
  const [step, setStep] = useState<Step>("shipping");
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [methodId, setMethodId] = useState(shippingMethods[0].id);
  const [placing, setPlacing] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const method = shippingMethods.find((m) => m.id === methodId)!;
  const total = subtotal + method.price;

  const lineItems = useMemo(
    () =>
      lines
        .map((l) => ({ line: l, product: getProduct(l.slug) }))
        .filter((x) => x.product),
    [lines]
  );

  if (lines.length === 0 && step !== "done") {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <ShoppingBag className="h-10 w-10 text-ink/20" strokeWidth={1} />
        <p className="text-ink/60">Your cart is empty.</p>
        <Link
          href="/products"
          className="rounded-[3px] bg-ink px-6 py-3.5 text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-gold-dark"
        >
          Browse the Collection
        </Link>
      </div>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Address = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      address: String(data.get("address") || "").trim(),
      city: String(data.get("city") || "").trim(),
      region: String(data.get("region") || "").trim(),
      postal: String(data.get("postal") || "").trim(),
      country: String(data.get("country") || "").trim(),
    };
    const nextErrors: Record<string, string> = {};
    if (!next.name) nextErrors.name = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email))
      nextErrors.email = "Enter a valid email";
    if (!next.address) nextErrors.address = "Required";
    if (!next.city) nextErrors.city = "Required";
    if (!next.postal) nextErrors.postal = "Required";
    if (!next.country) nextErrors.country = "Required";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setAddress(next);
    setStep("method");
  };

  const handlePlaceOrder = () => {
    setPlacing(true);
    window.setTimeout(() => {
      setOrderNumber(`SFL-${Math.floor(100000 + Math.random() * 900000)}`);
      setPlacing(false);
      setStep("done");
      clear();
    }, 1400);
  };

  if (step === "done") {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl py-16 text-center"
      >
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-gold-dark text-paper">
          <Check className="h-6 w-6" />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-gold-dark">
          Order Confirmed
        </p>
        <h1 className="mt-3 font-serif text-4xl font-light text-ink">
          Thank You, {address.name.split(" ")[0] || "Collector"}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-ink/60">
          Your order{" "}
          <span className="font-medium text-ink font-feature-tabular">
            {orderNumber}
          </span>{" "}
          has been received. A member of our atelier team will confirm final
          production details by email at {address.email} within one business
          day.
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink/50">
          Estimated delivery: {method.eta}
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center gap-2 rounded-[3px] bg-ink px-9 py-4 text-[11px] uppercase tracking-[0.18em] text-paper transition-colors hover:bg-gold-dark"
        >
          Continue Browsing
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-14 lg:grid-cols-5 lg:gap-16">
      <div className="lg:col-span-3">
        {/* Stepper */}
        <ol className="mb-10 flex flex-wrap items-center gap-x-8 gap-y-3">
          {steps.map((s, i) => {
            const idx = steps.findIndex((x) => x.id === step);
            const state = i < idx ? "done" : i === idx ? "active" : "upcoming";
            return (
              <li key={s.id} className="flex items-center gap-2">
                <span
                  className={clsx(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    state === "done" && "bg-gold-dark text-paper",
                    state === "active" && "border border-gold-dark text-gold-dark",
                    state === "upcoming" && "border border-ink/20 text-ink/30"
                  )}
                >
                  {state === "done" ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span
                  className={clsx(
                    "text-sm",
                    state === "upcoming" ? "text-ink/30" : "text-ink/80"
                  )}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>

        <AnimatePresence mode="wait">
          {step === "shipping" && (
            <motion.form
              key="shipping"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
              onSubmit={handleShippingSubmit}
              className="space-y-6"
              noValidate
            >
              <Field label="Full Name" name="name" defaultValue={address.name} error={errors.name} />
              <Field label="Email Address" name="email" type="email" defaultValue={address.email} error={errors.email} />
              <Field label="Street Address" name="address" defaultValue={address.address} error={errors.address} />
              <div className="grid grid-cols-2 gap-6">
                <Field label="City" name="city" defaultValue={address.city} error={errors.city} />
                <Field label="State / Region" name="region" defaultValue={address.region} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Field label="Postal Code" name="postal" defaultValue={address.postal} error={errors.postal} />
                <Field label="Country" name="country" defaultValue={address.country} error={errors.country} />
              </div>
              <button
                type="submit"
                className="rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark"
              >
                Continue to Delivery
              </button>
            </motion.form>
          )}

          {step === "method" && (
            <motion.div
              key="method"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="space-y-4"
            >
              <fieldset className="space-y-4">
                <legend className="sr-only">Delivery method</legend>
                {shippingMethods.map((m) => (
                  <label
                    key={m.id}
                    className={clsx(
                      "flex cursor-pointer items-start justify-between gap-4 rounded-[6px] border p-5 transition-colors duration-300",
                      methodId === m.id
                        ? "border-gold-dark bg-gold-dark/5"
                        : "border-ink/15 hover:border-ink/35"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="shipping-method"
                        className="mt-1 accent-[#6f5a34]"
                        checked={methodId === m.id}
                        onChange={() => setMethodId(m.id)}
                      />
                      <div>
                        <p className="font-medium text-ink">{m.label}</p>
                        <p className="mt-1 text-sm text-ink/55">{m.detail}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.1em] text-ink/40">
                          {m.eta}
                        </p>
                      </div>
                    </div>
                    <p className="whitespace-nowrap font-serif text-lg text-gold-dark font-feature-tabular">
                      {m.price === 0 ? "Included" : `$${m.price.toLocaleString()}`}
                    </p>
                  </label>
                ))}
              </fieldset>

              <div className="flex items-center gap-6 pt-2">
                <button
                  type="button"
                  onClick={() => setStep("shipping")}
                  className="inline-flex items-center gap-1 text-sm text-ink/60 transition-colors hover:text-ink"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep("review")}
                  className="rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark"
                >
                  Review Order
                </button>
              </div>
            </motion.div>
          )}

          {step === "review" && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="space-y-8"
            >
              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.15em] text-ink/40">
                  Shipping To
                </p>
                <p className="text-sm leading-relaxed text-ink/75">
                  {address.name}
                  <br />
                  {address.address}
                  <br />
                  {address.city}
                  {address.region ? `, ${address.region}` : ""} {address.postal}
                  <br />
                  {address.country}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-[0.15em] text-ink/40">
                  Delivery Method
                </p>
                <p className="text-sm text-ink/75">
                  {method.label} &middot;{" "}
                  {method.price === 0 ? "Included" : `$${method.price.toLocaleString()}`}
                </p>
              </div>

              <p className="max-w-md text-xs text-ink/40">
                This is a preview checkout &mdash; placing your order will not
                charge a card. Our team will follow up by email to confirm
                payment and final production details.
              </p>

              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setStep("method")}
                  className="inline-flex items-center gap-1 text-sm text-ink/60 transition-colors hover:text-ink"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
                >
                  {placing ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Order summary */}
      <div className="lg:col-span-2">
        <div className="rounded-[6px] border border-ink/10 bg-paper-dim p-6">
          <h2 className="mb-5 font-serif text-xl font-light text-ink">
            Order Summary
          </h2>
          <ul className="space-y-4">
            {lineItems.map(({ line, product }) => (
              <li key={line.slug} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[4px] border border-ink/10 bg-paper">
                  {product!.images?.length ? (
                    <ProductPhoto images={product!.images} alt={product!.name} showSelector={false} />
                  ) : (
                    <div className="p-2">
                      <LampIllustration product={product!} animated={false} className="h-full w-full" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-ink">{product!.name}</p>
                  <p className="text-xs text-ink/40">Qty {line.qty}</p>
                </div>
                <p className="text-sm text-ink/70 font-feature-tabular">
                  ${(product!.price * line.qty).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between text-ink/60">
              <span>Subtotal</span>
              <span className="font-feature-tabular">${subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-ink/60">
              <span>Shipping</span>
              <span className="font-feature-tabular">
                {method.price === 0 ? "Included" : `$${method.price.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-2 font-serif text-lg text-ink">
              <span>Total</span>
              <span className="font-feature-tabular">${total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  error?: string;
}) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/50"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark"
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
