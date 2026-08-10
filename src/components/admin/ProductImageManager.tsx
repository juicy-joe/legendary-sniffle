"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { Trash2, ImagePlus } from "lucide-react";
import {
  uploadProductImage,
  deleteProductImage,
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
  const [isDeleting, startDelete] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((img) => (
            <li key={img.id} className="group relative overflow-hidden rounded-[3px] border border-ink/10">
              <div className="relative aspect-square bg-paper-warm">
                <Image src={img.url} alt={img.label} fill sizes="200px" className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-2 bg-white px-2 py-1.5">
                <span className="flex items-center gap-1.5 truncate text-xs text-ink/70">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full border border-ink/10"
                    style={{ backgroundColor: img.swatch }}
                  />
                  {img.label}
                </span>
                <button
                  type="button"
                  disabled={isDeleting && deletingId === img.id}
                  onClick={() => {
                    setDeletingId(img.id);
                    startDelete(async () => {
                      await deleteProductImage(img.id, productId);
                    });
                  }}
                  aria-label={`Delete ${img.label}`}
                  className="shrink-0 text-ink/40 transition-colors hover:text-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
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
