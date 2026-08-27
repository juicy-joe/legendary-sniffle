"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { blobConfigured } from "@/lib/blob";
import { getWholesaleSession } from "@/lib/get-wholesale-session";
import { getApprovedWholesaleAccount } from "@/lib/wholesale";
import { sendSpecialOrderRequestNotification } from "@/lib/email";

// Same ceiling as product-photo uploads (image-actions.ts) and for the
// same reason — Vercel serverless functions cap the request body at
// ~4.5MB, and anything larger comes back as a platform 413 the Server
// Actions client can't parse, crashing the page instead of showing a
// friendly error. Design files can legitimately be bigger than this; the
// form tells people to email large files directly rather than pretending
// this uploader has no limit.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const requestSchema = z.object({
  subject: z.string().min(1, "Required"),
  message: z.string().min(1, "Tell us a bit about what you need."),
  quantity: z.coerce.number().int().positive().optional().or(z.literal("").transform(() => undefined)),
});

export type SpecialOrderRequestState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function submitSpecialOrderRequest(
  _prevState: SpecialOrderRequestState,
  formData: FormData
): Promise<SpecialOrderRequestState> {
  const session = await getWholesaleSession();
  if (!session) return { error: "Your trade session has expired. Please log in again." };

  const account = await getApprovedWholesaleAccount(session.sub);
  if (!account) return { error: "Your trade session has expired. Please log in again." };

  const parsed = requestSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message"),
    quantity: formData.get("quantity"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  let fileUrl: string | undefined;
  let fileName: string | undefined;
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    if (!blobConfigured()) {
      return { error: "File storage isn't configured yet — leave the file out for now, or contact us directly." };
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return { error: "That file is over 4MB — please email it to us directly instead." };
    }
    const blob = await put(`wholesale-requests/${account.id}/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    fileUrl = blob.url;
    fileName = file.name;
  }

  await prisma.specialOrderRequest.create({
    data: {
      wholesaleAccountId: account.id,
      subject: parsed.data.subject,
      message: parsed.data.message,
      quantity: parsed.data.quantity ?? null,
      fileUrl: fileUrl ?? null,
      fileName: fileName ?? null,
    },
  });

  revalidatePath("/admin/wholesale/requests");
  revalidatePath("/trade/portal/requests");

  try {
    // account.businessName/email come from the getApprovedWholesaleAccount
    // summary; the contact name isn't part of that shape, so fetched fresh.
    const full = await prisma.wholesaleAccount.findUnique({
      where: { id: account.id },
      select: { businessName: true, contactName: true, email: true },
    });
    if (full) {
      await sendSpecialOrderRequestNotification({
        businessName: full.businessName,
        contactName: full.contactName,
        contactEmail: full.email,
        subject: parsed.data.subject,
        message: parsed.data.message,
        quantity: parsed.data.quantity ?? null,
        hasFile: !!fileUrl,
      });
    }
  } catch (err) {
    console.error("Failed to send special order request notification:", err);
  }

  return { success: true };
}
