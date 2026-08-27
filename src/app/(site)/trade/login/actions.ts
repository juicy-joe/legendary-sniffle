"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/wholesale-auth";
import {
  createWholesaleSessionToken,
  WHOLESALE_SESSION_COOKIE,
  wholesaleSessionCookieOptions,
} from "@/lib/wholesale-session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  from: z.string().nullish(),
});

export type WholesaleLoginState = { error?: string; email?: string };

// No brute-force lockout yet, unlike admin login (AdminUser.failedAttempts/
// lockedUntil) — trade accounts are hand-approved one at a time, so the
// account count and attack surface are both much smaller for now. Worth
// adding the same protection here if this portal grows.
export async function wholesaleLogin(
  _prevState: WholesaleLoginState,
  formData: FormData
): Promise<WholesaleLoginState> {
  const submittedEmail = String(formData.get("email") ?? "");

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    from: formData.get("from"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password.", email: submittedEmail };
  }

  const { email, password, from } = parsed.data;
  const account = await prisma.wholesaleAccount.findUnique({ where: { email: email.toLowerCase() } });

  // Same generic error whether the email doesn't exist, isn't approved
  // yet, or the password's wrong — never reveal which.
  const genericError = { error: "Invalid email or password.", email: submittedEmail };
  if (!account || account.status !== "APPROVED" || !account.passwordHash) {
    return genericError;
  }

  const valid = await verifyPassword(password, account.passwordHash);
  if (!valid) return genericError;

  const token = await createWholesaleSessionToken({
    sub: account.id,
    businessName: account.businessName,
    email: account.email,
  });

  const store = await cookies();
  store.set(WHOLESALE_SESSION_COOKIE, token, wholesaleSessionCookieOptions);

  redirect(from && from.startsWith("/trade") ? from : "/trade/portal");
}

export async function wholesaleLogout() {
  const store = await cookies();
  store.delete(WHOLESALE_SESSION_COOKIE);
  redirect("/trade/login");
}
