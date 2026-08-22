"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { blobConfigured } from "@/lib/blob";

export type ImageUploadState = { error?: string; success?: boolean };

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

// The file itself is uploaded client-side straight to Vercel Blob (see
// src/app/api/admin/blob-upload/route.ts) before this ever runs — this
// action only records the resulting blob URL. Keeping this as a real
// Server Action (rather than a plain fetch to some other endpoint) means
// it still gets Next's built-in CSRF-equivalent origin check and can call
// revalidatePath directly.
export async function uploadProductImage(
  productId: string,
  url: string,
  label: string,
  swatch: string
): Promise<ImageUploadState> {
  const trimmedLabel = label.trim();
  if (!trimmedLabel) {
    return { error: "Give this image a label (e.g. the room or setting)." };
  }

  const currentCount = await prisma.productImage.count({ where: { productId } });

  await prisma.productImage.create({
    data: {
      productId,
      url,
      label: trimmedLabel,
      swatch: swatch.trim() || "#a3854f",
      sortOrder: currentCount,
    },
  });

  await revalidateProductImagePaths(productId);
  return { success: true };
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
  label: string,
  swatch: string,
  // Set only when the admin picked a replacement file — that file was
  // already uploaded client-side to Blob (same reasoning as
  // uploadProductImage above) before this runs.
  newUrl?: string
): Promise<ImageUploadState> {
  const trimmedLabel = label.trim();
  if (!trimmedLabel) {
    return { error: "Give this image a label (e.g. the room or setting)." };
  }

  const existing = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!existing) return { error: "That image no longer exists." };

  await prisma.productImage.update({
    where: { id: imageId },
    data: { label: trimmedLabel, swatch: swatch.trim() || existing.swatch, ...(newUrl ? { url: newUrl } : {}) },
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
