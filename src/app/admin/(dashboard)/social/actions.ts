"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Fixed to the three platforms SocialIcons.tsx actually has icons for —
// adding a URL for anything else would have nowhere to render.
const platforms = ["instagram", "facebook", "linkedin"] as const;

const socialSchema = z.object({
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
});

export type SocialFormState = { error?: string; success?: boolean };

export async function updateSocialLinks(
  _prevState: SocialFormState,
  formData: FormData
): Promise<SocialFormState> {
  const parsed = socialSchema.safeParse({
    instagram: formData.get("instagram") || "",
    facebook: formData.get("facebook") || "",
    linkedin: formData.get("linkedin") || "",
  });
  if (!parsed.success) {
    return { error: "Something went wrong — please try again." };
  }

  for (const platform of platforms) {
    const url = parsed.data[platform]?.trim() || "#";
    await prisma.socialLink.upsert({
      where: { id: platform },
      update: { url },
      create: { id: platform, platform, url },
    });
  }

  revalidatePath("/admin/social");
  revalidatePath("/", "layout");
  return { success: true };
}
