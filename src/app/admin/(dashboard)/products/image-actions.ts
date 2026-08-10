"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { blobConfigured } from "@/lib/blob";

export type ImageUploadState = { error?: string };

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB

// A product's photos also appear on its live storefront page (and drive
// whether the homepage/cards show a photo or the SVG fallback), so both
// need to be revalidated alongside the admin edit screen.
async function revalidateProductImagePaths(productId: string) {
  revalidatePath(`/admin/products/${productId}/edit`);
  const product = await prisma.product.findUnique({ where: { id: productId }, select: { slug: true } });
  if (product) {
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/");
    revalidatePath("/products");
  }
}

export async function uploadProductImage(
  productId: string,
  _prevState: ImageUploadState,
  formData: FormData
): Promise<ImageUploadState> {
  if (!blobConfigured()) {
    return { error: "Image storage isn't configured yet — add BLOB_READ_WRITE_TOKEN." };
  }

  const file = formData.get("file");
  const label = String(formData.get("label") || "").trim();
  const swatch = String(formData.get("swatch") || "#a3854f").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file." };
  }
  if (!label) {
    return { error: "Give this image a label (e.g. the room or setting)." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "That file doesn't look like an image." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "That image is too large — please keep uploads under 10MB." };
  }

  const currentCount = await prisma.productImage.count({ where: { productId } });

  const blob = await put(`products/${productId}/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  await prisma.productImage.create({
    data: {
      productId,
      url: blob.url,
      label,
      swatch,
      sortOrder: currentCount,
    },
  });

  await revalidateProductImagePaths(productId);
  return {};
}

export async function deleteProductImage(imageId: string, productId: string) {
  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) return;

  await prisma.productImage.delete({ where: { id: imageId } });

  // Best-effort — don't fail the request if the blob is already gone or
  // storage isn't configured (e.g. deleting a legacy record).
  if (blobConfigured() && image.url.includes("blob.vercel-storage.com")) {
    try {
      await del(image.url);
    } catch {
      // ignore
    }
  }

  await revalidateProductImagePaths(productId);
}
