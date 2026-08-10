"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const settingsSchema = z.object({
  siteName: z.string().min(1, "Required"),
  siteUrl: z.string().min(1, "Required"),
  defaultMetaTitle: z.string().min(1, "Required"),
  defaultMetaDesc: z.string().min(1, "Required"),
});

export type SettingsFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function updateSettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const parsed = settingsSchema.safeParse({
    siteName: formData.get("siteName"),
    siteUrl: formData.get("siteUrl"),
    defaultMetaTitle: formData.get("defaultMetaTitle"),
    defaultMetaDesc: formData.get("defaultMetaDesc"),
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  await prisma.settings.upsert({
    where: { id: "settings" },
    create: { id: "settings", ...parsed.data },
    update: parsed.data,
  });

  // Site name/default title/description feed the root layout's metadata,
  // which every page inherits from.
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { success: true };
}
