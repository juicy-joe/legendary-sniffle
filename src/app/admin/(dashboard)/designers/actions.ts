"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const designerSchema = z.object({
  name: z.string().min(1, "Required"),
  origin: z.string().min(1, "Required"),
  bio: z.string().min(1, "Required"),
});

export type DesignerFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

function parseDesignerForm(formData: FormData) {
  return designerSchema.safeParse({
    name: formData.get("name"),
    origin: formData.get("origin"),
    bio: formData.get("bio"),
  });
}

// The About page lists every designer (even ones with no products yet), and
// each product detail/card shows its designer's name, so both need to stay
// in sync with edits here.
async function revalidateDesignerPaths(designerId?: string) {
  revalidatePath("/admin/designers");
  revalidatePath("/about");
  if (designerId) {
    const products = await prisma.product.findMany({
      where: { designerId },
      select: { slug: true },
    });
    if (products.length) {
      revalidatePath("/products");
      revalidatePath("/");
      for (const p of products) revalidatePath(`/products/${p.slug}`);
    }
  }
}

export async function createDesigner(
  _prevState: DesignerFormState,
  formData: FormData
): Promise<DesignerFormState> {
  const parsed = parseDesignerForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  const designer = await prisma.designer.create({ data: parsed.data });
  await revalidateDesignerPaths();
  redirect(`/admin/designers/${designer.id}/edit`);
}

export async function updateDesigner(
  _prevState: DesignerFormState,
  formData: FormData
): Promise<DesignerFormState> {
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing designer id." };

  const parsed = parseDesignerForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  await prisma.designer.update({ where: { id }, data: parsed.data });
  await revalidateDesignerPaths(id);
  return { success: true };
}

export async function deleteDesigner(id: string): Promise<{ error?: string } | void> {
  const count = await prisma.product.count({ where: { designerId: id } });
  if (count > 0) {
    return {
      error: `Can't delete — ${count} product${count === 1 ? "" : "s"} still use this designer.`,
    };
  }

  await prisma.designer.delete({ where: { id } });
  revalidatePath("/admin/designers");
  revalidatePath("/about");
  redirect("/admin/designers");
}
