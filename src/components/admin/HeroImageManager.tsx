"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { Trash2, ImagePlus, Pencil, ArrowUp, ArrowDown, RotateCcw, RotateCw, Check, X } from "lucide-react";
import {
  uploadHeroImage,
  updateHeroImage,
  deleteHeroImage,
  moveHeroImage,
  rotateHeroImage,
  type ImageUploadState,
} from "@/app/admin/(dashboard)/content/hero-actions";

type HeroImage = { id: string; url: string; alt: string; sortOrder: number };

// Same compression helper as ProductImageManager.tsx — kept as a separate
// copy rather than a shared import since the two managers otherwise share
// no code and a shared util for one six-line function isn't worth the
// indirection.
const COMPRESS_THRESHOLD_BYTES = 1.5 * 1024 * 1024;
const COMPRESS_MAX_DIMENSION = 2400;

async function compressImageIfNeeded(file: File): Promise<File> {
  if (file.size <= COMPRESS_THRESHOLD_BYTES || !file.type.startsWith("image/")) {
    return file;
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, COMPRESS_MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let quality = 0.85;
  let blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  while (blob && blob.size > COMPRESS_THRESHOLD_BYTES && quality > 0.5) {
    quality -= 0.1;
    blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  }
  if (!blob) return file;
  const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

export default function HeroImageManager({
  images,
  blobConfigured,
}: {
  images: HeroImage[];
  blobConfigured: boolean;
}) {
  const [state, rawFormAction, pending] = useActionState<ImageUploadState, FormData>(uploadHeroImage, {});

  const formAction = async (formData: FormData) => {
    const file = formData.get("file");
    if (file instanceof File) {
      formData.set("file", await compressImageIfNeeded(file));
    }
    rawFormAction(formData);
  };

  return (
    <div className="space-y-6">
      <p className="text-xs text-ink/60">
        These rotate through the homepage hero, in this order, crossfading every few seconds. With none uploaded,
        the hero falls back to a product&apos;s own photos automatically.
      </p>

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((img, i) => (
            <HeroImageCard key={img.id} image={img} isFirst={i === 0} isLast={i === images.length - 1} />
          ))}
        </ul>
      )}

      {!blobConfigured ? (
        <p className="rounded-[3px] border border-dashed border-ink/20 px-4 py-6 text-center text-xs text-ink/60">
          Image storage isn&apos;t configured yet. Add{" "}
          <code className="rounded bg-ink/5 px-1 py-0.5">BLOB_READ_WRITE_TOKEN</code> to enable uploads.
        </p>
      ) : (
        <form action={formAction} className="flex flex-wrap items-end gap-3 border-t border-ink/10 pt-5">
          <div className="flex-1 min-w-[10rem]">
            <label htmlFor="hero-file" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
              Image
            </label>
            <input
              id="hero-file"
              name="file"
              type="file"
              accept="image/*"
              required
              className="w-full text-xs text-ink/70 file:mr-3 file:rounded-[3px] file:border file:border-ink/20 file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:text-ink"
            />
          </div>
          <div className="min-w-[10rem] flex-1">
            <label htmlFor="hero-alt" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
              Description
            </label>
            <input
              id="hero-alt"
              name="alt"
              placeholder="Deep table lamp on a bedroom nightstand"
              required
              className="w-full rounded-[3px] border border-ink/20 bg-transparent px-3 py-1.5 text-sm text-ink outline-none focus:border-gold-dark"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="flex items-center gap-1.5 rounded-[3px] border border-ink px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-60"
          >
            <ImagePlus className="h-3.5 w-3.5" />
            {pending ? "Uploading..." : "Upload"}
          </button>
        </form>
      )}

      {state.error && (
        <p role="alert" className="text-xs text-red-700">
          {state.error}
        </p>
      )}
    </div>
  );
}

function HeroImageCard({ image, isFirst, isLast }: { image: HeroImage; isFirst: boolean; isLast: boolean }) {
  const [editing, setEditing] = useState(false);
  const [isMoving, startMove] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isRotating, startRotate] = useTransition();
  const [rotateError, setRotateError] = useState<string | undefined>();

  const boundUpdate = updateHeroImage.bind(null, image.id);
  const [state, rawFormAction, pending] = useActionState<ImageUploadState, FormData>(boundUpdate, {});

  const save = async (formData: FormData) => {
    const file = formData.get("file");
    if (file instanceof File && file.size > 0) {
      formData.set("file", await compressImageIfNeeded(file));
    }
    rawFormAction(formData);
  };

  if (state.success && editing) {
    setEditing(false);
  }

  const rotate = (direction: "cw" | "ccw") =>
    startRotate(async () => {
      const result = await rotateHeroImage(image.id, direction);
      setRotateError(result.error);
    });

  const move = (direction: "up" | "down") => startMove(() => moveHeroImage(image.id, direction));

  if (editing) {
    return (
      <li className="col-span-2 space-y-3 rounded-[3px] border border-gold-dark/40 bg-paper-warm p-3 sm:col-span-1">
        <div className="relative aspect-video overflow-hidden rounded-[3px] bg-white">
          <Image src={image.url} alt={image.alt} fill sizes="240px" className="object-cover" />
        </div>
        <form action={save} className="space-y-2">
          <input
            name="alt"
            defaultValue={image.alt}
            required
            placeholder="Description"
            className="w-full rounded-[3px] border border-ink/20 bg-white px-2 py-1.5 text-xs text-ink outline-none focus:border-gold-dark"
          />
          <input
            name="file"
            type="file"
            accept="image/*"
            title="Replace this photo (optional)"
            className="w-full text-[11px] text-ink/70 file:mr-2 file:rounded-[3px] file:border file:border-ink/20 file:bg-transparent file:px-2 file:py-1 file:text-[10px] file:text-ink"
          />
          {state.error && (
            <p role="alert" className="text-[11px] text-red-700">
              {state.error}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-1 rounded-[3px] bg-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-paper transition-colors hover:bg-gold-dark disabled:opacity-60"
            >
              <Check className="h-3 w-3" /> {pending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex items-center gap-1 text-[11px] uppercase tracking-[0.1em] text-ink/60 hover:text-ink"
            >
              <X className="h-3 w-3" /> Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="group relative overflow-hidden rounded-[3px] border border-ink/10">
      <div className="relative aspect-video bg-paper-warm">
        <Image src={image.url} alt={image.alt} fill sizes="240px" className="object-cover" />
        <div className="absolute left-1 top-1 flex flex-col gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            disabled={isFirst || isMoving}
            onClick={() => move("up")}
            aria-label={`Move ${image.alt} earlier`}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={isLast || isMoving}
            onClick={() => move("down")}
            aria-label={`Move ${image.alt} later`}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="absolute right-1 top-1 flex flex-col gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            disabled={isRotating}
            onClick={() => rotate("ccw")}
            aria-label={`Rotate ${image.alt} counterclockwise`}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-30"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={isRotating}
            onClick={() => rotate("cw")}
            aria-label={`Rotate ${image.alt} clockwise`}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-30"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 bg-white px-2 py-1.5">
        <span className="truncate text-xs text-ink/70">{image.alt}</span>
        <span className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${image.alt}`}
            className="text-ink/40 transition-colors hover:text-gold-dark"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => startDelete(() => deleteHeroImage(image.id))}
            aria-label={`Delete ${image.alt}`}
            className="text-ink/40 transition-colors hover:text-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>
      {rotateError && (
        <p role="alert" className="bg-white px-2 pb-1.5 text-[11px] text-red-700">
          {rotateError}
        </p>
      )}
    </li>
  );
}
