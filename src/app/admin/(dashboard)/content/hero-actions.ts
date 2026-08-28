"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { blobConfigured } from "@/lib/blob";

// Same reasoning and same limit as src/app/admin/(dashboard)/products/image-actions.ts
// — Vercel's serverless body cap, worked around client-side by
// compressImageIfNeeded in HeroImageManager.tsx.
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export type ImageUploadState = { error?: string; success?: boolean };

function revalidateHero() {
  revalidatePath("/admin/content/home");
  revalidatePath("/");
}

export async function uploadHeroImage(_prevState: ImageUploadState, formData: FormData): Promise<ImageUploadState> {
  if (!blobConfigured()) {
    return { error: "Image storage isn't configured yet — add BLOB_READ_WRITE_TOKEN." };
  }

  const file = formData.get("file");
  const alt = String(formData.get("alt") || "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file." };
  }
  if (!alt) {
    return { error: "Give this image a short description (used as its alt text)." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "That file doesn't look like an image." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "That image is still too large after compression — try a smaller photo." };
  }

  const currentCount = await prisma.heroImage.count();

  const blob = await put(`hero/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  await prisma.heroImage.create({
    data: { url: blob.url, alt, sortOrder: currentCount },
  });

  revalidateHero();
  return {};
}

export async function deleteHeroImage(id: string) {
  const image = await prisma.heroImage.findUnique({ where: { id } });
  if (!image) return;

  await prisma.heroImage.delete({ where: { id } });

  if (blobConfigured() && image.url.includes("blob.vercel-storage.com")) {
    try {
      await del(image.url);
    } catch {
      // best-effort, same as image-actions.ts
    }
  }

  revalidateHero();
}

export async function updateHeroImage(
  id: string,
  _prevState: ImageUploadState,
  formData: FormData
): Promise<ImageUploadState> {
  const alt = String(formData.get("alt") || "").trim();
  const file = formData.get("file");

  if (!alt) {
    return { error: "Give this image a short description (used as its alt text)." };
  }

  let newUrl: string | undefined;
  if (file instanceof File && file.size > 0) {
    if (!blobConfigured()) {
      return { error: "Image storage isn't configured yet — add BLOB_READ_WRITE_TOKEN." };
    }
    if (!file.type.startsWith("image/")) {
      return { error: "That file doesn't look like an image." };
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return { error: "That image is still too large after compression — try a smaller photo." };
    }
    const blob = await put(`hero/${Date.now()}-${file.name}`, file, { access: "public", addRandomSuffix: true });
    newUrl = blob.url;
  }

  const existing = await prisma.heroImage.findUnique({ where: { id } });
  if (!existing) return { error: "That image no longer exists." };

  await prisma.heroImage.update({
    where: { id },
    data: { alt, ...(newUrl ? { url: newUrl } : {}) },
  });

  if (newUrl && blobConfigured() && existing.url.includes("blob.vercel-storage.com")) {
    try {
      await del(existing.url);
    } catch {
      // ignore
    }
  }

  revalidateHero();
  return { success: true };
}

export async function moveHeroImage(id: string, direction: "up" | "down") {
  const images = await prisma.heroImage.findMany({ orderBy: { sortOrder: "asc" } });
  const index = images.findIndex((img) => img.id === id);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= images.length) return;

  const a = images[index];
  const b = images[swapWith];

  await prisma.$transaction([
    prisma.heroImage.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
    prisma.heroImage.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
  ]);

  revalidateHero();
}

export type RotateState = { error?: string };

export async function rotateHeroImage(id: string, direction: "cw" | "ccw"): Promise<RotateState> {
  if (!blobConfigured()) {
    return { error: "Image storage isn't configured yet — add BLOB_READ_WRITE_TOKEN." };
  }

  const existing = await prisma.heroImage.findUnique({ where: { id } });
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

  const blob = await put(`hero/${Date.now()}-rotated.jpg`, rotated, {
    access: "public",
    contentType: "image/jpeg",
    addRandomSuffix: true,
  });

  await prisma.heroImage.update({ where: { id }, data: { url: blob.url } });

  if (existing.url.includes("blob.vercel-storage.com")) {
    try {
      await del(existing.url);
    } catch {
      // ignore
    }
  }

  revalidateHero();
  return {};
}
