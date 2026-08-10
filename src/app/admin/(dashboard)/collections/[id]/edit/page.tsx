import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CollectionForm from "@/components/admin/CollectionForm";

export const metadata = { title: "Edit Collection — Admin" };

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const collection = await prisma.collection.findUnique({ where: { id } });
  if (!collection) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Edit Collection</h1>
      <CollectionForm mode="edit" collection={collection} />
    </div>
  );
}
