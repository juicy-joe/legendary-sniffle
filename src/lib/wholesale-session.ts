// JWT session helpers for wholesale (trade) accounts — deliberately a
// complete parallel to src/lib/session.ts rather than sharing a session
// type with admin auth. Different kind of user (a customer, not staff),
// so a bug in one auth path can't cross over into the other. Edge-safe
// (jose only, no bcrypt) so this is safe to import from proxy.ts.
import { SignJWT, jwtVerify } from "jose";

export const WHOLESALE_SESSION_COOKIE = "safalight_wholesale_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 30; // 30 days — trade accounts are expected to stay logged in across repeat ordering, not re-auth every week like an admin

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  // Same secret as admin sessions, different cookie name/payload shape —
  // fine to share, since a wholesale JWT and an admin JWT are still only
  // ever accepted by the code path that expects that exact payload shape.
  return new TextEncoder().encode(secret);
}

export type WholesaleSessionPayload = {
  sub: string; // WholesaleAccount id
  businessName: string;
  email: string;
};

export async function createWholesaleSessionToken(payload: WholesaleSessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyWholesaleSessionToken(
  token: string
): Promise<WholesaleSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.sub === "string" &&
      typeof payload.businessName === "string" &&
      typeof payload.email === "string"
    ) {
      return { sub: payload.sub, businessName: payload.businessName, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
}

export const wholesaleSessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_DURATION_SECONDS,
};
