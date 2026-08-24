import "server-only";
import Stripe from "stripe";

// Server-only — this holds the secret key, never import it from a Client
// Component. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (the one safe to expose)
// isn't actually needed anywhere yet: Stripe Checkout is a server-created
// session the browser is just redirected to (session.url), not the
// embedded-Elements flow that would need Stripe.js + the publishable key
// client-side. Kept in env anyway since it's harmless to have on hand.
//
// Lazily constructed (not a top-level `new Stripe(...)`) for the same
// reason src/lib/session.ts reads SESSION_SECRET inside a function rather
// than at module scope — importing this file shouldn't crash unrelated
// code paths at build/import time if the env var happens to be unset.
let client: Stripe | undefined;

export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  client = new Stripe(key);
  return client;
}
