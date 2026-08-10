"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().min(1, "Required"),
  slug: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens only"),
  price: z.coerce.number().int("Whole numbers only").positive("Must be greater than 0"),
  materials: z.string().min(1, "Required"),
  dimensions: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  story: z.string().min(1, "Required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  palette: z.enum(["gold", "ivory", "onyx", "bronze", "smoke"]),
  shade: z.enum(["dome", "drum", "cone", "sphere", "pleated"]),
  base: z.enum(["urn", "column", "sculpted", "orb", "disc"]),
  designerId: z.string().min(1, "Required"),
  collectionId: z.string().min(1, "Required"),
  categoryId: z.string().min(1, "Required"),
});

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

function parseProductForm(formData: FormData) {
  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    price: formData.get("price"),
    materials: formData.get("materials"),
    dimensions: formData.get("dimensions"),
    description: formData.get("description"),
    story: formData.get("story"),
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
    palette: formData.get("palette"),
    shade: formData.get("shade"),
    base: formData.get("base"),
    designerId: formData.get("designerId"),
    collectionId: formData.get("collectionId"),
    categoryId: formData.get("categoryId"),
  };
  const parsed = productSchema.safeParse(raw);
  const featured = formData.get("featured") === "on";
  const limited = formData.get("limited") === "on";
  return { parsed, featured, limited };
}

// The storefront reads live from Prisma (see src/lib/catalog.ts), but the
// homepage, /products, and each product detail page are still cached —
// without this, an edit here wouldn't appear on the public site until the
// next deploy. Pass every slug that changed (a product's old slug too, if
// it was renamed, so the stale URL revalidates to a 404 instead of serving
// cached content forever).
function revalidateProductPaths(...slugs: string[]) {
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/sitemap.xml");
  for (const slug of slugs) {
    if (slug) revalidatePath(`/products/${slug}`);
  }
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const { parsed, featured, limited } = parseProductForm(formData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return {
      error: "Check the highlighted fields.",
      fieldErrors: { slug: "That slug is already in use." },
    };
  }

  const product = await prisma.product.create({
    data: { ...parsed.data, featured, limited },
  });

  revalidateProductPaths(product.slug);
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing product id." };

  const { parsed, featured, limited } = parseProductForm(formData);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { error: "Check the highlighted fields.", fieldErrors };
  }

  const current = await prisma.product.findUnique({ where: { id }, select: { slug: true } });
  if (!current) return { error: "That product no longer exists." };

  const slugOwner = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (slugOwner && slugOwner.id !== id) {
    return {
      error: "Check the highlighted fields.",
      fieldErrors: { slug: "That slug is already in use." },
    };
  }

  await prisma.product.update({
    where: { id },
    data: { ...parsed.data, featured, limited },
  });

  revalidateProductPaths(current.slug, parsed.data.slug);
  return { success: true };
}

export async function deleteProduct(id: string) {
  const deleted = await prisma.product.delete({ where: { id } });
  revalidateProductPaths(deleted.slug);
  redirect("/admin/products");
}
