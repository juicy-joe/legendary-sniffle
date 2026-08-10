"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const collectionSchema = z.object({
  name: z.string().min(1, "Required"),
  slug: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().optional(),
});

export type CollectionFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

function parseCollectionForm(formData: FormData) {
  return collectionSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
  });
}

// Collections aren't listed anywhere on their own — they only ever surface
// through the products that belong to them (cards, detail pages, the
// homepage sections), so only products actually need revalidating.
async function revalidateCollectionPaths(collectionId?: string) {
  revalidatePath("/admin/collections");
  if (collectionId) {
    const products = await prisma.product.findMany({
      where: { collectionId },
      select: { slug: true },
    });
    if (products.length) {
      revalidatePath("/products");
      revalidatePath("/");
      for (const p of products) revalidatePath(`/products/${p.slug}`);
    }
  }
}

export async function createCollection(
  _prevState: CollectionFormState,
  formData: FormData
): Promise<CollectionFormState> {
  const parsed = parseCollectionForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  const existing = await prisma.collection.findFirst({
    where: { OR: [{ name: parsed.data.name }, { slug: parsed.data.slug }] },
  });
  if (existing) {
    const field = existing.name === parsed.data.name ? "name" : "slug";
    return {
      error: "Check the highlighted fields.",
      fieldErrors: { [field]: `That ${field} is already in use.` },
    };
  }

  const collection = await prisma.collection.create({ data: parsed.data });
  await revalidateCollectionPaths();
  redirect(`/admin/collections/${collection.id}/edit`);
}

export async function updateCollection(
  _prevState: CollectionFormState,
  formData: FormData
): Promise<CollectionFormState> {
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing collection id." };

  const parsed = parseCollectionForm(formData);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] = issue.message;
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  const existing = await prisma.collection.findFirst({
    where: { OR: [{ name: parsed.data.name }, { slug: parsed.data.slug }], NOT: { id } },
  });
  if (existing) {
    const field = existing.name === parsed.data.name ? "name" : "slug";
    return {
      error: "Check the highlighted fields.",
      fieldErrors: { [field]: `That ${field} is already in use.` },
    };
  }

  await prisma.collection.update({ where: { id }, data: parsed.data });
  await revalidateCollectionPaths(id);
  return { success: true };
}

export async function deleteCollection(id: string): Promise<{ error?: string } | void> {
  const count = await prisma.product.count({ where: { collectionId: id } });
  if (count > 0) {
    return {
      error: `Can't delete — ${count} product${count === 1 ? "" : "s"} still use this collection.`,
    };
  }

  await prisma.collection.delete({ where: { id } });
  revalidatePath("/admin/collections");
  redirect("/admin/collections");
}
