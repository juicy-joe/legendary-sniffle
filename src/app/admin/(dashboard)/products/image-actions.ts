"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { blobConfigured } from "@/lib/blob";

export type ImageUploadState = { error?: string; success?: boolean };

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

export async function updateProductImage(
  imageId: string,
  productId: string,
  _prevState: ImageUploadState,
  formData: FormData
): Promise<ImageUploadState> {
  const label = String(formData.get("label") || "").trim();
  const swatch = String(formData.get("swatch") || "").trim();
  const file = formData.get("file");

  if (!label) {
    return { error: "Give this image a label (e.g. the room or setting)." };
  }

  let newUrl: string | undefined;
  // Replacing the photo itself is optional — the field is only filled in
  // when the admin actually chose a new file, so label/swatch-only edits
  // don't require re-selecting an image.
  if (file instanceof File && file.size > 0) {
    if (!blobConfigured()) {
      return { error: "Image storage isn't configured yet — add BLOB_READ_WRITE_TOKEN." };
    }
    if (!file.type.startsWith("image/")) {
      return { error: "That file doesn't look like an image." };
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return { error: "That image is too large — please keep uploads under 10MB." };
    }
    const blob = await put(`products/${productId}/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    newUrl = blob.url;
  }

  const existing = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!existing) return { error: "That image no longer exists." };

  await prisma.productImage.update({
    where: { id: imageId },
    data: { label, swatch: swatch || existing.swatch, ...(newUrl ? { url: newUrl } : {}) },
  });

  // Old blob is only replaced, not deleted automatically — best-effort
  // cleanup, same reasoning as deleteProductImage below.
  if (newUrl && blobConfigured() && existing.url.includes("blob.vercel-storage.com")) {
    try {
      await del(existing.url);
    } catch {
      // ignore
    }
  }

  await revalidateProductImagePaths(productId);
  return { success: true };
}

// Swaps sortOrder with the adjacent image so admins can reorder without
// deleting and re-uploading — the first image is what the storefront's
// product cards and homepage fallback show, so ordering matters.
export async function moveProductImage(imageId: string, productId: string, direction: "up" | "down") {
  const images = await prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: "asc" },
  });
  const index = images.findIndex((img) => img.id === imageId);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= images.length) return;

  const a = images[index];
  const b = images[swapWith];

  await prisma.$transaction([
    prisma.productImage.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.productImage.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);

  await revalidateProductImagePaths(productId);
}

export type RotateState = { error?: string };

// Rotates the actual pixel data (via sharp) rather than storing a CSS
// transform — a stored rotation value would need to be reapplied
// consistently everywhere the photo renders (admin thumbnail, product
// card, product detail viewer, homepage fallback) and a 90°/270° rotation
// doesn't fit its own bounding box under object-cover anyway. Re-encoding
// once here means every consumer just displays the image normally.
export async function rotateProductImage(
  imageId: string,
  productId: string,
  direction: "cw" | "ccw"
): Promise<RotateState> {
  if (!blobConfigured()) {
    return { error: "Image storage isn't configured yet — add BLOB_READ_WRITE_TOKEN." };
  }

  const existing = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!existing) return { error: "That image no longer exists." };

  let rotated: Buffer;
  try {
    const res = await fetch(existing.url);
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    const original = Buffer.from(await res.arrayBuffer());
    rotated = await sharp(original)
      .rotate(direction === "cw" ? 90 : -90)
      .jpeg({ quality: 90 })
      .toBuffer();
  } catch {
    return { error: "Couldn't rotate that image — try again." };
  }

  const blob = await put(`products/${productId}/${Date.now()}-rotated.jpg`, rotated, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: true,
  });

  await prisma.productImage.update({ where: { id: imageId }, data: { url: blob.url } });

  if (existing.url.includes("blob.vercel-storage.com")) {
    try {
      await del(existing.url);
    } catch {
      // ignore — best-effort cleanup, same as elsewhere in this file
    }
  }

  await revalidateProductImagePaths(productId);
  return {};
}
