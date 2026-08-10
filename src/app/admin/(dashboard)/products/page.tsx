import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const metadata = { title: "Products — Admin" };

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
    include: {
      designer: true,
      collection: true,
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">Products</h1>
          <p className="mt-1 text-sm text-ink/65">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-[3px] border border-ink bg-ink px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-gold-dark hover:border-gold-dark"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-[3px] border border-dashed border-ink/20 px-6 py-12 text-center text-sm text-ink/60">
          No products yet. Add your first one to get started.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[3px] border border-ink/10">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-[11px] uppercase tracking-[0.12em] text-ink/50">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Designer</th>
                <th className="px-4 py-3 font-medium">Collection</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-ink/5 last:border-0 hover:bg-paper-warm/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="flex items-center gap-3">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-[3px] bg-paper-warm">
                        {p.images[0] && (
                          <Image src={p.images[0].url} alt="" fill sizes="44px" className="object-cover" />
                        )}
                      </div>
                      <span className="font-medium text-ink hover:text-gold-dark">{p.name}</span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{p.designer.name}</td>
                  <td className="px-4 py-3 text-ink/70">{p.collection.name}</td>
                  <td className="px-4 py-3 text-ink/70">${p.price.toLocaleString("en-US")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5">
                      {p.featured && (
                        <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold-dark">
                          Featured
                        </span>
                      )}
                      {p.limited && (
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink/70">
                          Limited
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link href={`/admin/products/${p.id}/edit`} className="text-xs text-ink/65 hover:text-ink">
                        Edit
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
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
