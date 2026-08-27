"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/wholesale-auth";
import {
  createWholesaleSessionToken,
  WHOLESALE_SESSION_COOKIE,
  wholesaleSessionCookieOptions,
} from "@/lib/wholesale-session";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "At least 8 characters."),
  confirmPassword: z.string().min(1, "Required"),
});

export type SetPasswordState = { error?: string; fieldErrors?: Record<string, string> };

export async function setWholesalePassword(
  _prevState: SetPasswordState,
  formData: FormData
): Promise<SetPasswordState> {
  const parsed = schema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }
  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { error: "Passwords don't match.", fieldErrors: { confirmPassword: "Passwords don't match." } };
  }

  const account = await prisma.wholesaleAccount.findUnique({ where: { inviteToken: parsed.data.token } });
  if (
    !account ||
    account.status !== "APPROVED" ||
    !account.inviteTokenExpiresAt ||
    account.inviteTokenExpiresAt < new Date()
  ) {
    return { error: "This link is invalid or has expired. Contact us for a new one." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.wholesaleAccount.update({
    where: { id: account.id },
    data: { passwordHash, inviteToken: null, inviteTokenExpiresAt: null },
  });

  const token = await createWholesaleSessionToken({
    sub: account.id,
    businessName: account.businessName,
    email: account.email,
  });
  const store = await cookies();
  store.set(WHOLESALE_SESSION_COOKIE, token, wholesaleSessionCookieOptions);

  redirect("/trade/portal");
}
