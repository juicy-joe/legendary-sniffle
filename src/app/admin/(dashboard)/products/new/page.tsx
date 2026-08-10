import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "New Product — Admin" };

export default async function NewProductPage() {
  const [designers, collections, categories] = await Promise.all([
    prisma.designer.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.collection.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">New Product</h1>
      <ProductForm
        mode="create"
        designers={designers}
        collections={collections}
        categories={categories}
        blobConfigured={false}
      />
    </div>
  );
}
