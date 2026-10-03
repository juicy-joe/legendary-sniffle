"use client";

// Google Ads Enhanced Conversions requires first-party data (email, phone,
// address) to be SHA-256 hashed before it ever leaves the browser — this is
// the one function that does that. Per Google's spec: lowercase and trim
// the value first (email addresses especially — "Jane@X.com" and
// "jane@x.com " must hash identically for Google to match them).
export async function hashSha256(value: string): Promise<string> {
  const normalized = value.trim().toLowerCase();
  const data = new TextEncoder().encode(normalized);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
