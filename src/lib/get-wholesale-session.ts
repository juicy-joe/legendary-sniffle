import "server-only";
import { cookies } from "next/headers";
import { WHOLESALE_SESSION_COOKIE, verifyWholesaleSessionToken } from "./wholesale-session";

export async function getWholesaleSession() {
  const store = await cookies();
  const token = store.get(WHOLESALE_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyWholesaleSessionToken(token);
}
