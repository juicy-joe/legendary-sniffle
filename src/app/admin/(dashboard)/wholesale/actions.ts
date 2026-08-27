"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWholesaleApprovedEmail } from "@/lib/email";
import { siteUrl } from "@/lib/site";

const INVITE_TOKEN_VALID_DAYS = 7;

export async function approveWholesaleAccount(id: string): Promise<{ error?: string } | void> {
  const account = await prisma.wholesaleAccount.findUnique({ where: { id } });
  if (!account) return { error: "Application not found." };

  const inviteToken = crypto.randomBytes(32).toString("hex");
  const inviteTokenExpiresAt = new Date(Date.now() + INVITE_TOKEN_VALID_DAYS * 24 * 60 * 60 * 1000);

  await prisma.wholesaleAccount.update({
    where: { id },
    data: { status: "APPROVED", inviteToken, inviteTokenExpiresAt },
  });

  try {
    await sendWholesaleApprovedEmail({
      contactName: account.contactName,
      businessName: account.businessName,
      email: account.email,
      setPasswordUrl: `${siteUrl}/trade/set-password?token=${inviteToken}`,
    });
  } catch (err) {
    console.error("Failed to send wholesale approval email:", err);
  }

  revalidatePath("/admin/wholesale");
}

export async function rejectWholesaleAccount(id: string): Promise<void> {
  await prisma.wholesaleAccount.update({ where: { id }, data: { status: "REJECTED" } });
  revalidatePath("/admin/wholesale");
}

export async function updateWholesaleDiscount(
  id: string,
  formData: FormData
): Promise<{ error?: string }> {
  const raw = String(formData.get("discountPercent") ?? "").trim();
  if (raw === "") {
    await prisma.wholesaleAccount.update({ where: { id }, data: { discountPercent: null } });
    revalidatePath(`/admin/wholesale/${id}`);
    return {};
  }

  const parsed = z.coerce.number().int().min(0).max(100).safeParse(raw);
  if (!parsed.success) return { error: "Enter a whole number between 0 and 100, or leave blank." };

  await prisma.wholesaleAccount.update({ where: { id }, data: { discountPercent: parsed.data } });
  revalidatePath(`/admin/wholesale/${id}`);
  return {};
}

const productPriceSchema = z.object({
  productId: z.string().min(1),
  price: z.coerce.number().int().positive("Must be greater than 0."),
});

export async function setWholesaleProductPrice(
  accountId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const parsed = productPriceSchema.safeParse({
    productId: formData.get("productId"),
    price: formData.get("price"),
  });
  if (!parsed.success) return { error: "Select a product and enter a valid price." };

  await prisma.wholesaleProductPrice.upsert({
    where: {
      wholesaleAccountId_productId: { wholesaleAccountId: accountId, productId: parsed.data.productId },
    },
    create: { wholesaleAccountId: accountId, productId: parsed.data.productId, price: parsed.data.price },
    update: { price: parsed.data.price },
  });
  revalidatePath(`/admin/wholesale/${accountId}`);
  return {};
}

export async function removeWholesaleProductPrice(id: string, accountId: string): Promise<void> {
  await prisma.wholesaleProductPrice.delete({ where: { id } });
  revalidatePath(`/admin/wholesale/${accountId}`);
}

export async function deleteWholesaleAccount(id: string): Promise<void> {
  await prisma.wholesaleAccount.delete({ where: { id } });
  revalidatePath("/admin/wholesale");
  redirect("/admin/wholesale");
}
