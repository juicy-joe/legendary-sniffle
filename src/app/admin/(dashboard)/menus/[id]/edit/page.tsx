import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MenuItemForm from "@/components/admin/MenuItemForm";

export const metadata = { title: "Edit Link — Admin" };

export default async function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.menuItem.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Edit Link</h1>
      <MenuItemForm mode="edit" item={item} />
    </div>
  );
}
