import "server-only";
import { Resend } from "resend";

// Lazily constructed, same reasoning as src/lib/stripe.ts — importing this
// file shouldn't crash unrelated code paths at build/import time if
// RESEND_API_KEY happens to be unset (e.g. before it's configured).
let client: Resend | undefined;

export function getResend(): Resend {
  if (client) return client;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not set");
  }
  client = new Resend(key);
  return client;
}

// Sent from safalight.com (verified as a Resend sending domain), but with
// reply-to pointed at the real inbox the business actually monitors — a
// customer hitting "reply" shouldn't land on an unmonitored address just
// because the storefront's domain and the business's email domain differ.
export const EMAIL_FROM = "SaFaLight <orders@safalight.com>";
export const EMAIL_REPLY_TO = "info@finnbogasondesign.com";
