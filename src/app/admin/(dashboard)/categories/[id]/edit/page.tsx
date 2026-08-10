import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CategoryForm from "@/components/admin/CategoryForm";

export const metadata = { title: "Edit Category — Admin" };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Edit Category</h1>
      <CategoryForm mode="edit" category={category} />
    </div>
  );
}
