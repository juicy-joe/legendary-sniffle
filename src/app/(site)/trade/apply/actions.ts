"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWholesaleApplicationReceivedEmail } from "@/lib/email";

const applySchema = z.object({
  businessName: z.string().min(1, "Required"),
  contactName: z.string().min(1, "Required"),
  email: z.string().min(1, "Required").email("Enter a valid email."),
  phone: z.string().optional(),
  vatId: z.string().optional(),
  notes: z.string().optional(),
  // Hidden honeypot — same anti-bot pattern as the general contact form.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type ApplyFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function submitWholesaleApplication(
  _prevState: ApplyFormState,
  formData: FormData
): Promise<ApplyFormState> {
  const parsed = applySchema.safeParse({
    businessName: formData.get("businessName"),
    contactName: formData.get("contactName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    vatId: formData.get("vatId") || undefined,
    notes: formData.get("notes") || undefined,
    company: formData.get("company") || "",
  });

  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "company")) {
      return { error: "Something went wrong. Please try again." };
    }
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  const existing = await prisma.wholesaleAccount.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return {
      error:
        existing.status === "PENDING"
          ? "An application with this email is already under review."
          : existing.status === "APPROVED"
            ? "This email already has an approved trade account — try logging in instead."
            : "An application with this email was previously reviewed. Please contact us directly.",
    };
  }

  await prisma.wholesaleAccount.create({
    data: {
      businessName: parsed.data.businessName,
      contactName: parsed.data.contactName,
      email: parsed.data.email,
      phone: parsed.data.phone ?? null,
      vatId: parsed.data.vatId ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  revalidatePath("/admin/wholesale");

  try {
    await sendWholesaleApplicationReceivedEmail({
      contactName: parsed.data.contactName,
      businessName: parsed.data.businessName,
      email: parsed.data.email,
    });
  } catch (err) {
    console.error("Failed to send wholesale application acknowledgment:", err);
  }

  return { success: true };
}
