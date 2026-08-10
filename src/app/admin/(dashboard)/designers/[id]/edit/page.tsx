import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DesignerForm from "@/components/admin/DesignerForm";

export const metadata = { title: "Edit Designer — Admin" };

export default async function EditDesignerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const designer = await prisma.designer.findUnique({ where: { id } });
  if (!designer) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Edit Designer</h1>
      <DesignerForm mode="edit" designer={designer} />
    </div>
  );
}
