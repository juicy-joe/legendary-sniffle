import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteEntityButton from "@/components/admin/DeleteEntityButton";
import { deleteDesigner } from "./actions";

export const metadata = { title: "Designers — Admin" };

export default async function AdminDesignersPage() {
  const designers = await prisma.designer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">Designers</h1>
          <p className="mt-1 text-sm text-ink/65">
            {designers.length} designer{designers.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/designers/new"
          className="flex items-center gap-2 rounded-[3px] border border-ink bg-ink px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-gold-dark hover:border-gold-dark"
        >
          <Plus className="h-4 w-4" /> Add Designer
        </Link>
      </div>

      {designers.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-ink/20 px-6 py-12 text-center text-sm text-ink/60">
          No designers yet. Add your first one to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[3px] border border-ink/10">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-[11px] uppercase tracking-[0.12em] text-ink/50">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Origin</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {designers.map((d) => (
                <tr key={d.id} className="border-b border-ink/5 last:border-0 hover:bg-paper-warm/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/designers/${d.id}/edit`} className="font-medium text-ink hover:text-gold-dark">
                      {d.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{d.origin}</td>
                  <td className="px-4 py-3 text-ink/70">{d._count.products}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link href={`/admin/designers/${d.id}/edit`} className="text-xs text-ink/65 hover:text-ink">
                        Edit
                      </Link>
                      <DeleteEntityButton id={d.id} name={d.name} action={deleteDesigner} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
