"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export type ContentFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

function fieldErrorsFrom(issues: z.ZodError["issues"]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) fieldErrors[String(issue.path[0])] = issue.message;
  return fieldErrors;
}

const homeSchema = z.object({
  heroEyebrow: z.string().min(1, "Required"),
  heroHeadline: z.string().min(1, "Required"),
  heroHeadlineAccent: z.string().min(1, "Required"),
  heroSubtext: z.string().min(1, "Required"),
  chromaHeadline: z.string().min(1, "Required"),
  chromaSubtext: z.string().min(1, "Required"),
  craftHeadline: z.string().min(1, "Required"),
  craftSubtext: z.string().min(1, "Required"),
});

export async function updateHomeContent(
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  const parsed = homeSchema.safeParse({
    heroEyebrow: formData.get("heroEyebrow"),
    heroHeadline: formData.get("heroHeadline"),
    heroHeadlineAccent: formData.get("heroHeadlineAccent"),
    heroSubtext: formData.get("heroSubtext"),
    chromaHeadline: formData.get("chromaHeadline"),
    chromaSubtext: formData.get("chromaSubtext"),
    craftHeadline: formData.get("craftHeadline"),
    craftSubtext: formData.get("craftSubtext"),
  });
  if (!parsed.success) {
    return { error: "Check the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  await prisma.homeContent.upsert({
    where: { id: "home" },
    create: { id: "home", ...parsed.data },
    update: parsed.data,
  });
  revalidatePath("/");
  revalidatePath("/admin/content/home");
  return { success: true };
}

const aboutSchema = z.object({
  heroHeadline: z.string().min(1, "Required"),
  heroSubtext: z.string().min(1, "Required"),
});

export async function updateAboutContent(
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  const parsed = aboutSchema.safeParse({
    heroHeadline: formData.get("heroHeadline"),
    heroSubtext: formData.get("heroSubtext"),
  });
  if (!parsed.success) {
    return { error: "Check the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  await prisma.aboutContent.upsert({
    where: { id: "about" },
    create: { id: "about", ...parsed.data },
    update: parsed.data,
  });
  revalidatePath("/about");
  revalidatePath("/admin/content/about");
  return { success: true };
}

const contactSchema = z.object({
  email: z.string().min(1, "Required").email("Enter a valid email"),
  phone: z.string().min(1, "Required"),
  address: z.string().min(1, "Required"),
  hours: z.string().min(1, "Required"),
});

export async function updateContactInfo(
  _prevState: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  const parsed = contactSchema.safeParse({
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    hours: formData.get("hours"),
  });
  if (!parsed.success) {
    return { error: "Check the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error.issues) };
  }

  await prisma.contactInfo.upsert({
    where: { id: "contact" },
    create: { id: "contact", ...parsed.data },
    update: parsed.data,
  });
  // The footer's Contact column reads the same data on every page, not just /contact.
  revalidatePath("/contact");
  revalidatePath("/", "layout");
  revalidatePath("/admin/content/contact");
  return { success: true };
}
