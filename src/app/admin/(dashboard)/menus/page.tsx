import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteEntityButton from "@/components/admin/DeleteEntityButton";
import { deleteMenuItem } from "./actions";

export const metadata = { title: "Menus — Admin" };

const sections = [
  { location: "navbar", title: "Navbar" },
  { location: "footer-explore", title: "Footer — Explore" },
  { location: "footer-collections", title: "Footer — Collections" },
];

export default async function AdminMenusPage() {
  const items = await prisma.menuItem.findMany({ orderBy: [{ location: "asc" }, { sortOrder: "asc" }] });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">Menus</h1>
          <p className="mt-1 text-sm text-ink/65">Navbar and footer navigation links.</p>
        </div>
        <Link
          href="/admin/menus/new"
          className="flex items-center gap-2 rounded-[3px] border border-ink bg-ink px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-gold-dark hover:border-gold-dark"
        >
          <Plus className="h-4 w-4" /> Add Link
        </Link>
      </div>

      <div className="space-y-10">
        {sections.map((section) => {
          const sectionItems = items.filter((i) => i.location === section.location);
          return (
            <div key={section.location}>
              <h2 className="mb-3 font-serif text-lg font-light text-ink">{section.title}</h2>
              {sectionItems.length === 0 ? (
                <p className="rounded-[3px] border border-dashed border-ink/20 px-4 py-6 text-center text-sm text-ink/60">
                  No links yet.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-[3px] border border-ink/10">
                  <table className="w-full min-w-[520px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-ink/10 text-left text-[11px] uppercase tracking-[0.12em] text-ink/50">
                        <th className="px-4 py-3 font-medium">Label</th>
                        <th className="px-4 py-3 font-medium">Link</th>
                        <th className="px-4 py-3 font-medium">Order</th>
                        <th className="px-4 py-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionItems.map((item) => (
                        <tr key={item.id} className="border-b border-ink/5 last:border-0 hover:bg-paper-warm/50">
                          <td className="px-4 py-3">
                            <Link href={`/admin/menus/${item.id}/edit`} className="font-medium text-ink hover:text-gold-dark">
                              {item.label}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-ink/70">{item.href}</td>
                          <td className="px-4 py-3 text-ink/70">{item.sortOrder}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-4">
                              <Link href={`/admin/menus/${item.id}/edit`} className="text-xs text-ink/65 hover:text-ink">
                                Edit
                              </Link>
                              <DeleteEntityButton id={item.id} name={item.label} action={deleteMenuItem} />
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
        })}
      </div>
    </div>
  );
}
