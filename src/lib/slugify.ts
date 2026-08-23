// Shared by both server and client code (the products page groups by
// collection on the server for the showcase, and again client-side in
// ProductsExplorer for the grid sections) — kept framework-agnostic so it
// works in both. The admin forms (ProductForm, CollectionForm,
// CategoryForm) each have their own copy for turning a name into a URL
// slug on submit; this one is for generating stable anchor IDs from a
// collection name, a different enough use that it isn't worth threading
// those three call sites onto this instead.
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
