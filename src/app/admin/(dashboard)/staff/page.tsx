import Link from "next/link";
import { Plus, ShieldAlert } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/get-session";
import DeleteEntityButton from "@/components/admin/DeleteEntityButton";
import { deleteStaff } from "./actions";

export const metadata = { title: "Staff — Admin" };

export default async function AdminStaffPage() {
  const session = await getSession();

  if (session?.role !== "OWNER") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[6px] border border-dashed border-ink/20 px-6 py-16 text-center">
        <ShieldAlert className="h-8 w-8 text-ink/30" strokeWidth={1.5} />
        <h1 className="font-serif text-2xl font-light text-ink">Owners Only</h1>
        <p className="max-w-sm text-sm text-ink/65">
          Staff accounts can only be managed by an Owner. Ask an owner on your
          team if you need access changed.
        </p>
      </div>
    );
  }

  const staff = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">Staff</h1>
          <p className="mt-1 text-sm text-ink/65">
            {staff.length} account{staff.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/staff/new"
          className="flex items-center gap-2 rounded-[3px] border border-ink bg-ink px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-gold-dark hover:border-gold-dark"
        >
          <Plus className="h-4 w-4" /> Add Account
        </Link>
      </div>

      <div className="overflow-x-auto rounded-[3px] border border-ink/10">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-[11px] uppercase tracking-[0.12em] text-ink/50">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} className="border-b border-ink/5 last:border-0 hover:bg-paper-warm/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/staff/${s.id}/edit`} className="font-medium text-ink hover:text-gold-dark">
                    {s.name}
                  </Link>
                  {s.id === session.sub && <span className="ml-2 text-xs text-ink/50">(you)</span>}
                </td>
                <td className="px-4 py-3 text-ink/70">{s.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wide ${
                      s.role === "OWNER" ? "bg-gold/15 text-gold-dark" : "bg-ink/10 text-ink/70"
                    }`}
                  >
                    {s.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`/admin/staff/${s.id}/edit`} className="text-xs text-ink/65 hover:text-ink">
                      Edit
                    </Link>
                    <DeleteEntityButton id={s.id} name={s.name} action={deleteStaff} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
