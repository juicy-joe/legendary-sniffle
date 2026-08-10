import { notFound } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import StaffForm from "@/components/admin/StaffForm";

export const metadata = { title: "Edit Staff Account — Admin" };

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (session?.role !== "OWNER") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[6px] border border-dashed border-ink/20 px-6 py-16 text-center">
        <ShieldAlert className="h-8 w-8 text-ink/30" strokeWidth={1.5} />
        <h1 className="font-serif text-2xl font-light text-ink">Owners Only</h1>
        <p className="max-w-sm text-sm text-ink/65">
          Staff accounts can only be managed by an Owner.
        </p>
      </div>
    );
  }

  const { id } = await params;
  const staff = await prisma.adminUser.findUnique({ where: { id } });
  if (!staff) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl font-light text-ink">Edit Staff Account</h1>
      <StaffForm mode="edit" staff={staff} />
    </div>
  );
}
