import "server-only";
import bcrypt from "bcryptjs";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export {
  WHOLESALE_SESSION_COOKIE,
  createWholesaleSessionToken,
  verifyWholesaleSessionToken,
  wholesaleSessionCookieOptions,
  type WholesaleSessionPayload,
} from "./wholesale-session";
