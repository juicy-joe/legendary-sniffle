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

// Sent from and replied-to at the same address — J.J.F@ollerialight.com is
// both the verified Resend sending address and the inbox actually monitored.
export const EMAIL_FROM = "Ollerialight <J.J.F@ollerialight.com>";
export const EMAIL_REPLY_TO = "J.J.F@ollerialight.com";
