import Link from "next/link";
import { CircleCheck, CircleAlert, CircleX } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getStockLevels } from "@/lib/stock-levels";

export const metadata = { title: "Product Data Quality — Admin" };

type Severity = "PASS" | "WARNING" | "ERROR";
type Check = { label: string; severity: Severity; detail: string };

// Mirrors the field checklist in the Merchant Center / GA4 readiness spec —
// run against every product before it's treated as "ready," not just at
// creation time, since stock, images, and GTIN can all change afterward.
// Nothing here blocks publication by itself (per the spec, an optional
// field being absent is a WARNING, never an ERROR) — it's a worklist, not
// a gate.
function runChecks(
  product: {
    name: string;
    sku: string;
    gtin: string | null;
    description: string;
    price: number;
    images: unknown[];
    materials: string;
    metaTitle: string | null;
  },
  available: number
): Check[] {
  const checks: Check[] = [];

  checks.push(
    product.name.trim()
      ? { label: "Product Name", severity: "PASS", detail: product.name }
      : { label: "Product Name", severity: "ERROR", detail: "Missing" }
  );
  checks.push(
    product.sku.trim()
      ? { label: "SKU / Product ID", severity: "PASS", detail: product.sku }
      : { label: "SKU / Product ID", severity: "ERROR", detail: "Missing" }
  );
  // MPN always mirrors SKU by design — see Product.sku's doc comment in
  // schema.prisma — so this can never fail independently of the SKU check.
  checks.push({ label: "MPN", severity: "PASS", detail: `= ${product.sku}` });
  checks.push(
    product.gtin
      ? { label: "GTIN / EAN", severity: "PASS", detail: product.gtin }
      : { label: "GTIN / EAN", severity: "WARNING", detail: "Not set (optional — only add a genuine one)" }
  );
  checks.push({ label: "Brand", severity: "PASS", detail: "Ollerialight" });
  checks.push(
    product.description.trim()
      ? { label: "Description", severity: "PASS", detail: `${product.description.length} characters` }
      : { label: "Description", severity: "ERROR", detail: "Missing" }
  );
  checks.push(
    product.price > 0
      ? { label: "Price", severity: "PASS", detail: `€${product.price}` }
      : { label: "Price", severity: "ERROR", detail: "Missing or zero" }
  );
  checks.push({ label: "Currency", severity: "PASS", detail: "EUR" });
  checks.push(
    available > 0
      ? { label: "Availability", severity: "PASS", detail: `InStock (${available} available)` }
      : { label: "Availability", severity: "WARNING", detail: "OutOfStock" }
  );
  checks.push({ label: "Condition", severity: "PASS", detail: "NewCondition" });
  checks.push(
    product.images.length > 0
      ? { label: "Main Image", severity: "PASS", detail: "Present" }
      : { label: "Main Image", severity: "ERROR", detail: "No images uploaded" }
  );
  checks.push(
    product.images.length > 1
      ? { label: "Additional Images", severity: "PASS", detail: `${product.images.length - 1} more` }
      : { label: "Additional Images", severity: "WARNING", detail: "Only one photo — more helps Merchant Center and conversion" }
  );
  checks.push({ label: "Product URL / Canonical", severity: "PASS", detail: "Auto-generated from slug" });
  checks.push({ label: "Product JSON-LD", severity: "PASS", detail: "Auto-generated (src/lib/seo.ts)" });
  checks.push({ label: "Category / Collection", severity: "PASS", detail: "Required fields, always set" });
  checks.push(
    product.materials.trim()
      ? { label: "Materials", severity: "PASS", detail: product.materials }
      : { label: "Materials", severity: "ERROR", detail: "Missing" }
  );
  checks.push({
    label: "SEO Title / Meta Description",
    severity: "PASS",
    detail: product.metaTitle ? "Custom override set" : "Auto-generated",
  });
  checks.push({ label: "Shipping Information", severity: "PASS", detail: "Site-wide (Admin → Settings)" });
  checks.push({ label: "Returns Information", severity: "PASS", detail: "Site-wide (Terms page)" });

  return checks;
}

const severityOrder: Record<Severity, number> = { ERROR: 0, WARNING: 1, PASS: 2 };

export default async function ProductQualityPage() {
  const [products, stockLevels] = await Promise.all([
    prisma.product.findMany({
      orderBy: { name: "asc" },
      include: { images: true },
    }),
    getStockLevels(),
  ]);

  const rows = products.map((p) => {
    const available = stockLevels.get(p.id)?.available ?? 0;
    const checks = runChecks(p, available).sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    const errors = checks.filter((c) => c.severity === "ERROR").length;
    const warnings = checks.filter((c) => c.severity === "WARNING").length;
    return { product: p, checks, errors, warnings };
  });

  const totalErrors = rows.reduce((sum, r) => sum + r.errors, 0);
  const totalWarnings = rows.reduce((sum, r) => sum + r.warnings, 0);

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl font-light text-ink">Product Data Quality</h1>
      <p className="mb-8 max-w-2xl text-sm text-ink/65">
        Checks every product against what Google Merchant Center, GA4, and structured data
        actually need — an optional field being empty (like GTIN) is a warning, never an error.
        Nothing here is blocked from publishing; it&rsquo;s a worklist.
      </p>

      <div className="mb-8 flex flex-wrap gap-6 rounded-[6px] border border-ink/10 bg-paper-dim p-5 text-sm">
        <span className="flex items-center gap-2">
          <CircleX className="h-4 w-4 text-red-600" /> {totalErrors} error{totalErrors === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-2">
          <CircleAlert className="h-4 w-4 text-amber-600" /> {totalWarnings} warning{totalWarnings === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-2 text-ink/60">{products.length} products checked</span>
      </div>

      <div className="space-y-4">
        {rows.map(({ product, checks, errors, warnings }) => (
          <details
            key={product.id}
            open={errors > 0}
            className="rounded-[6px] border border-ink/10 bg-paper"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                {errors > 0 ? (
                  <CircleX className="h-4 w-4 shrink-0 text-red-600" />
                ) : warnings > 0 ? (
                  <CircleAlert className="h-4 w-4 shrink-0 text-amber-600" />
                ) : (
                  <CircleCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                )}
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="font-medium text-ink hover:text-gold-dark"
                  onClick={(e) => e.stopPropagation()}
                >
                  {product.name}
                </Link>
                <span className="font-feature-tabular text-xs text-ink/50">{product.sku}</span>
              </div>
              <span className="text-xs text-ink/50">
                {errors > 0 ? `${errors} error${errors === 1 ? "" : "s"}` : warnings > 0 ? `${warnings} warning${warnings === 1 ? "" : "s"}` : "All checks pass"}
              </span>
            </summary>
            <div className="border-t border-ink/10 px-5 py-4">
              <table className="w-full text-sm">
                <tbody>
                  {checks.map((c) => (
                    <tr key={c.label} className="border-b border-ink/5 last:border-0">
                      <td className="py-2 pr-4 text-ink/70">{c.label}</td>
                      <td className="py-2 pr-4">
                        <span
                          className={
                            c.severity === "ERROR"
                              ? "text-red-600"
                              : c.severity === "WARNING"
                                ? "text-amber-600"
                                : "text-emerald-600"
                          }
                        >
                          {c.severity}
                        </span>
                      </td>
                      <td className="py-2 text-ink/60">{c.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
