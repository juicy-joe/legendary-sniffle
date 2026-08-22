"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { Trash2, ImagePlus, Pencil, ArrowUp, ArrowDown, RotateCcw, RotateCw, Check, X } from "lucide-react";
import {
  uploadProductImage,
  updateProductImage,
  deleteProductImage,
  moveProductImage,
  rotateProductImage,
  type ImageUploadState,
} from "@/app/admin/(dashboard)/products/image-actions";

type ProductImage = {
  id: string;
  url: string;
  label: string;
  swatch: string;
  sortOrder: number;
};

export default function ProductImageManager({
  productId,
  images,
  blobConfigured,
}: {
  productId: string;
  images: ProductImage[];
  blobConfigured: boolean;
}) {
  const boundUpload = uploadProductImage.bind(null, productId);
  const [state, formAction, pending] = useActionState<ImageUploadState, FormData>(boundUpload, {});

  return (
    <div className="space-y-6">
      {images.length > 0 && (
        <>
          {/* The first image here is what the storefront's product cards and
              the homepage fallback use — reordering matters, not just which
              photos exist. */}
          <p className="text-xs text-ink/60">
            The first photo is used on product cards and the homepage. Use the arrows to reorder.
          </p>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {images.map((img, i) => (
              <ProductImageCard
                key={img.id}
                image={img}
                productId={productId}
                isFirst={i === 0}
                isLast={i === images.length - 1}
              />
            ))}
          </ul>
        </>
      )}

      {!blobConfigured ? (
        <p className="rounded-[3px] border border-dashed border-ink/20 px-4 py-6 text-center text-xs text-ink/60">
          Image storage isn&apos;t configured yet. Add{" "}
          <code className="rounded bg-ink/5 px-1 py-0.5">BLOB_READ_WRITE_TOKEN</code> to enable uploads —
          everything else on this product can be edited now.
        </p>
      ) : (
        <form action={formAction} className="flex flex-wrap items-end gap-3 border-t border-ink/10 pt-5">
          <div className="flex-1 min-w-[10rem]">
            <label htmlFor="file" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
              Image
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/*"
              required
              className="w-full text-xs text-ink/70 file:mr-3 file:rounded-[3px] file:border file:border-ink/20 file:bg-transparent file:px-3 file:py-1.5 file:text-xs file:text-ink"
            />
          </div>
          <div className="min-w-[8rem] flex-1">
            <label htmlFor="label" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
              Label
            </label>
            <input
              id="label"
              name="label"
              placeholder="Living room"
              required
              className="w-full rounded-[3px] border border-ink/20 bg-transparent px-3 py-1.5 text-sm text-ink outline-none focus:border-gold-dark"
            />
          </div>
          <div>
            <label htmlFor="swatch" className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
              Swatch
            </label>
            <input
              id="swatch"
              name="swatch"
              type="color"
              defaultValue="#a3854f"
              className="h-[34px] w-12 rounded-[3px] border border-ink/20 bg-transparent p-0.5"
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

function ProductImageCard({
  image,
  productId,
  isFirst,
  isLast,
}: {
  image: ProductImage;
  productId: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [isMoving, startMove] = useTransition();
  const [isDeleting, startDelete] = useTransition();
  const [isSaving, startSave] = useTransition();
  const [saveError, setSaveError] = useState<string | undefined>();
  const [isRotating, startRotate] = useTransition();
  const [rotateError, setRotateError] = useState<string | undefined>();

  const rotate = (direction: "cw" | "ccw") =>
    startRotate(async () => {
      const result = await rotateProductImage(image.id, productId, direction);
      setRotateError(result.error);
    });

  // Calling updateProductImage directly (rather than through
  // useActionState) means the result is available right where the submit
  // happens, so the editor can close itself only once a save actually
  // succeeds — no separate effect needed to react to a state change.
  const save = (formData: FormData) => {
    startSave(async () => {
      const result = await updateProductImage(image.id, productId, {}, formData);
      if (result.error) {
        setSaveError(result.error);
      } else {
        setSaveError(undefined);
        setEditing(false);
      }
    });
  };

  // Server Actions like moveProductImage/deleteProductImage return void, so
  // they're called directly inside startTransition rather than through
  // useActionState.
  const move = (direction: "up" | "down") =>
    startMove(() => moveProductImage(image.id, productId, direction));

  if (editing) {
    return (
      <li className="col-span-2 space-y-3 rounded-[3px] border border-gold-dark/40 bg-paper-warm p-3 sm:col-span-1">
        <div className="relative aspect-square overflow-hidden rounded-[3px] bg-white">
          <Image src={image.url} alt={image.label} fill sizes="200px" className="object-cover" />
        </div>
        <form action={save} className="space-y-2">
          <input
            name="label"
            defaultValue={image.label}
            required
            placeholder="Label"
            className="w-full rounded-[3px] border border-ink/20 bg-white px-2 py-1.5 text-xs text-ink outline-none focus:border-gold-dark"
          />
          <div className="flex items-center gap-2">
            <input
              name="swatch"
              type="color"
              defaultValue={image.swatch}
              className="h-8 w-10 shrink-0 rounded-[3px] border border-ink/20 bg-white p-0.5"
            />
            <input
              name="file"
              type="file"
              accept="image/*"
              title="Replace this photo (optional)"
              className="min-w-0 flex-1 text-[11px] text-ink/70 file:mr-2 file:rounded-[3px] file:border file:border-ink/20 file:bg-transparent file:px-2 file:py-1 file:text-[10px] file:text-ink"
            />
          </div>
          {saveError && (
            <p role="alert" className="text-[11px] text-red-700">
              {saveError}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1 rounded-[3px] bg-ink px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-paper transition-colors hover:bg-gold-dark disabled:opacity-60"
            >
              <Check className="h-3 w-3" /> {isSaving ? "Saving..." : "Save"}
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
      <div className="relative aspect-square bg-paper-warm">
        <Image src={image.url} alt={image.label} fill sizes="200px" className="object-cover" />
        <div className="absolute left-1 top-1 flex flex-col gap-1 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            disabled={isFirst || isMoving}
            onClick={() => move("up")}
            aria-label={`Move ${image.label} earlier`}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={isLast || isMoving}
            onClick={() => move("down")}
            aria-label={`Move ${image.label} later`}
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
            aria-label={`Rotate ${image.label} counterclockwise`}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-30"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={isRotating}
            onClick={() => rotate("cw")}
            aria-label={`Rotate ${image.label} clockwise`}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition-colors hover:text-gold-dark disabled:cursor-not-allowed disabled:opacity-30"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 bg-white px-2 py-1.5">
        <span className="flex items-center gap-1.5 truncate text-xs text-ink/70">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full border border-ink/10"
            style={{ backgroundColor: image.swatch }}
          />
          {image.label}
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={`Edit ${image.label}`}
            className="text-ink/40 transition-colors hover:text-gold-dark"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => startDelete(() => deleteProductImage(image.id, productId))}
            aria-label={`Delete ${image.label}`}
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
