"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  // FormData.get() returns null (not undefined) for an absent field —
  // .nullish() accepts both, .optional() alone would reject the null.
  from: z.string().nullish(),
});

export type LoginState = { error?: string; email?: string };

// After this many failed attempts in a row, the account is locked out for
// LOCKOUT_MINUTES — makes password brute-forcing impractical without adding
// any external infrastructure (just two columns on AdminUser).
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  // React resets uncontrolled form fields after a bound action completes —
  // echo the submitted email back so the form can restore it via
  // defaultValue, rather than making the user retype it after a typo'd
  // password.
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

  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    const minutesLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return {
      error: `Too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`,
      email: submittedEmail,
    };
  }

  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !valid) {
    if (user) {
      const failedAttempts = user.failedAttempts + 1;
      await prisma.adminUser.update({
        where: { id: user.id },
        data: {
          failedAttempts,
          lockedUntil:
            failedAttempts >= MAX_ATTEMPTS
              ? new Date(Date.now() + LOCKOUT_MINUTES * 60000)
              : null,
        },
      });
    }
    // Generic error either way — never reveal whether the email exists.
    return { error: "Invalid email or password.", email: submittedEmail };
  }

  if (user.failedAttempts > 0 || user.lockedUntil) {
    await prisma.adminUser.update({
      where: { id: user.id },
      data: { failedAttempts: 0, lockedUntil: null },
    });
  }

  const token = await createSessionToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, token, sessionCookieOptions);

  redirect(from && from.startsWith("/admin") ? from : "/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
