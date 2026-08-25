"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEnquiryAutoReplyEmail } from "@/lib/email";

const enquirySchema = z.object({
  name: z.string().min(1, "Please share your name."),
  email: z.string().min(1, "Please enter a valid email.").email("Please enter a valid email."),
  interest: z.string().min(1, "Required"),
  message: z.string().min(1, "Tell us a little about what you need."),
  // Hidden honeypot field — real visitors never see or fill it (off-screen,
  // not tab-reachable), so anything landing here is almost certainly a bot.
  company: z.string().max(0).optional().or(z.literal("")),
});

export type EnquiryFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function submitEnquiry(
  _prevState: EnquiryFormState,
  formData: FormData
): Promise<EnquiryFormState> {
  const parsed = enquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    interest: formData.get("interest"),
    message: formData.get("message"),
    company: formData.get("company") || "",
  });

  if (!parsed.success) {
    // A filled honeypot fails the "company" field's max(0) rule — reported
    // back as a generic error rather than tipping off that it was detected.
    if (parsed.error.issues.some((i) => i.path[0] === "company")) {
      return { error: "Something went wrong. Please try again." };
    }
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  await prisma.enquiry.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      interest: parsed.data.interest,
      message: parsed.data.message,
    },
  });

  revalidatePath("/admin/enquiries");

  // Best-effort — a flaky email provider shouldn't turn a successfully
  // saved enquiry into a failed submission from the visitor's perspective.
  try {
    await sendEnquiryAutoReplyEmail({
      name: parsed.data.name,
      email: parsed.data.email,
      message: parsed.data.message,
    });
  } catch (err) {
    console.error("Failed to send enquiry auto-reply:", err);
  }

  return { success: true };
}
