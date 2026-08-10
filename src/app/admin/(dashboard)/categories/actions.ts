"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const categorySchema = z.object({
  name: z.string().min(1, "Required"),
  slug: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens only"),
});

export type CategoryFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
  });
}

// Categories surface as filter labels/links on /products (and the homepage's
// "Shop the Editions" links), so a rename needs those pages — and every
// product in the category — to pick it up.
async function revalidateCategoryPaths(categoryId?: string) {
  revalidatePath("/admin/categories");
  if (categoryId) {
    const products = await prisma.product.findMany({
      where: { categoryId },
      select: { slug: true },
    });
    revalidatePath("/products");
    revalidatePath("/");
    for (const p of products) revalidatePath(`/products/${p.slug}`);
  }
}

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  const existing = await prisma.category.findFirst({
    where: { OR: [{ name: parsed.data.name }, { slug: parsed.data.slug }] },
  });
  if (existing) {
    const field = existing.name === parsed.data.name ? "name" : "slug";
    return {
      error: "Check the highlighted fields.",
      fieldErrors: { [field]: `That ${field} is already in use.` },
    };
  }

  const category = await prisma.category.create({ data: parsed.data });
  await revalidateCategoryPaths();
  redirect(`/admin/categories/${category.id}/edit`);
}

export async function updateCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing category id." };

  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  const existing = await prisma.category.findFirst({
    where: { OR: [{ name: parsed.data.name }, { slug: parsed.data.slug }], NOT: { id } },
  });
  if (existing) {
    const field = existing.name === parsed.data.name ? "name" : "slug";
    return {
      error: "Check the highlighted fields.",
      fieldErrors: { [field]: `That ${field} is already in use.` },
    };
  }

  await prisma.category.update({ where: { id }, data: parsed.data });
  await revalidateCategoryPaths(id);
  return { success: true };
}

export async function deleteCategory(id: string): Promise<{ error?: string } | void> {
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return {
      error: `Can't delete — ${count} product${count === 1 ? "" : "s"} still use this category.`,
    };
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  redirect("/admin/categories");
}
