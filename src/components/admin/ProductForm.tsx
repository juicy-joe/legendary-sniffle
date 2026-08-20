"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { createProduct, updateProduct } from "@/app/admin/(dashboard)/products/actions";
import ProductImageManager from "./ProductImageManager";

type Option = { id: string; name: string };

type ProductForData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  materials: string;
  dimensions: string;
  description: string;
  story: string;
  metaTitle: string | null;
  metaDescription: string | null;
  featured: boolean;
  limited: boolean;
  palette: string;
  shade: string;
  base: string;
  designerId: string;
  collectionId: string;
  categoryId: string;
  images: { id: string; url: string; label: string; swatch: string; sortOrder: number }[];
};

const palettes = ["gold", "ivory", "onyx", "bronze", "smoke"];
const shades = ["dome", "drum", "cone", "sphere", "pleated"];
const bases = ["urn", "column", "sculpted", "orb", "disc"];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProductForm({
  mode,
  product,
  designers,
  collections,
  categories,
  blobConfigured,
}: {
  mode: "create" | "edit";
  product?: ProductForData;
  designers: Option[];
  collections: Option[];
  categories: Option[];
  blobConfigured: boolean;
}) {
  const router = useRouter();
  // Imported directly (not passed as a prop) — a Server Action reference
  // handed down as a prop while another unrelated action (logout, in the
  // dashboard layout) is bound in the same page tree confused Next's client
  // runtime into invoking the wrong action on submit. Importing it straight
  // into the Client Component sidesteps that.
  const [state, formAction, pending] = useActionState(mode === "create" ? createProduct : updateProduct, {});
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");

  const err = (field: string) => state.fieldErrors?.[field];

  return (
    <>
    <form action={formAction} className="max-w-3xl space-y-10">
      {mode === "edit" && <input type="hidden" name="id" value={product!.id} />}

      <section className="space-y-6">
        <h2 className="font-serif text-xl font-light text-ink">Basics</h2>

        <Field label="Name" name="name" error={err("name")}>
          <input
            id="name"
            name="name"
            defaultValue={product?.name}
            onChange={(e) => {
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className={inputClass}
          />
        </Field>

        <Field label="Slug (URL)" name="slug" error={err("slug")}>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className={inputClass}
          />
        </Field>

        <Field label="Price (EUR, whole euros)" name="price" error={err("price")}>
          <input
            id="price"
            name="price"
            type="number"
            min={1}
            step={1}
            defaultValue={product?.price}
            className={inputClass}
          />
        </Field>

        <div className="flex gap-8">
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured}
              className="h-4 w-4 accent-[#6f5a34]"
            />
            Featured on homepage
          </label>
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input
              type="checkbox"
              name="limited"
              defaultChecked={product?.limited}
              className="h-4 w-4 accent-[#6f5a34]"
            />
            Limited edition
          </label>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-xl font-light text-ink">Classification</h2>

        <Field label="Designer" name="designerId" error={err("designerId")}>
          <select
            id="designerId"
            name="designerId"
            defaultValue={product?.designerId}
            className={inputClass}
          >
            <option value="" disabled>
              Select a designer
            </option>
            {designers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Collection" name="collectionId" error={err("collectionId")}>
          <select
            id="collectionId"
            name="collectionId"
            defaultValue={product?.collectionId}
            className={inputClass}
          >
            <option value="" disabled>
              Select a collection
            </option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Category" name="categoryId" error={err("categoryId")}>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product?.categoryId}
            className={inputClass}
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-xl font-light text-ink">Copy</h2>

        <Field label="Materials" name="materials" error={err("materials")}>
          <input id="materials" name="materials" defaultValue={product?.materials} className={inputClass} />
        </Field>

        <Field label="Dimensions" name="dimensions" error={err("dimensions")}>
          <input
            id="dimensions"
            name="dimensions"
            placeholder="H 58cm × ⌀ 32cm"
            defaultValue={product?.dimensions}
            className={inputClass}
          />
        </Field>

        <Field label="Description (card + detail page)" name="description" error={err("description")}>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={product?.description}
            className={inputClass}
          />
        </Field>

        <Field label="Story (the italic quote on the detail page)" name="story" error={err("story")}>
          <textarea id="story" name="story" rows={3} defaultValue={product?.story} className={inputClass} />
        </Field>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-xl font-light text-ink">
          Illustration Fallback
        </h2>
        <p className="text-xs text-ink/65">
          Used only when this product has no photos — an auto-generated line
          illustration in this finish/shape.
        </p>

        <Field label="Finish" name="palette">
          <select id="palette" name="palette" defaultValue={product?.palette ?? "gold"} className={inputClass}>
            {palettes.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Shade" name="shade">
          <select id="shade" name="shade" defaultValue={product?.shade ?? "dome"} className={inputClass}>
            {shades.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Base" name="base">
          <select id="base" name="base" defaultValue={product?.base ?? "urn"} className={inputClass}>
            {bases.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
      </section>

      <section className="space-y-6">
        <h2 className="font-serif text-xl font-light text-ink">SEO (optional)</h2>
        <Field label="Meta Title" name="metaTitle">
          <input id="metaTitle" name="metaTitle" defaultValue={product?.metaTitle ?? ""} className={inputClass} />
        </Field>
        <Field label="Meta Description" name="metaDescription">
          <textarea
            id="metaDescription"
            name="metaDescription"
            rows={2}
            defaultValue={product?.metaDescription ?? ""}
            className={inputClass}
          />
        </Field>
      </section>

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="flex items-center gap-2 text-sm text-emerald-700">
          <Check className="h-4 w-4" /> Saved.
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[3px] border border-ink bg-ink px-9 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-paper transition-colors duration-300 hover:bg-gold-dark hover:border-gold-dark disabled:opacity-60"
        >
          {pending ? "Saving..." : mode === "create" ? "Create Product" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="text-sm text-ink/65 hover:text-ink"
        >
          Back to Products
        </button>
      </div>
    </form>

    {/* Deliberately a sibling of the form above, not nested inside it —
        nested <form> elements are invalid HTML and silently break the
        inner form's submission (its own upload form needs an independent
        <form>). */}
    {mode === "edit" && product && (
      <section className="mt-10 max-w-3xl space-y-6 border-t border-ink/10 pt-8">
        <h2 className="font-serif text-xl font-light text-ink">Images</h2>
        <ProductImageManager
          productId={product.id}
          images={product.images}
          blobConfigured={blobConfigured}
        />
      </section>
    )}
    </>
  );
}

const inputClass =
  "w-full rounded-[3px] border border-ink/20 bg-transparent px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-gold-dark";

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-[11px] uppercase tracking-[0.15em] text-ink/65">
        {label}
      </label>
      {children}
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
