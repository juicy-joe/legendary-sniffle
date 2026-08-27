import PrintInvoiceButton from "@/components/admin/PrintInvoiceButton";
import { formatPrice } from "@/lib/format";

export type LabelData = { key: string; name: string; sku: string; price: number; imageDataUri: string };

// Shared by the single-product label page (one SKU, N copies to cut apart)
// and the bulk "print all" sheet (every product, one copy each) — both are
// just this grid with a different list of labels. print:grid-cols-3 keeps
// three per row on a printed page regardless of the on-screen column count.
export default function BarcodeLabelSheet({
  title,
  subtitle,
  labels,
}: {
  title: string;
  subtitle: string;
  labels: LabelData[];
}) {
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-serif text-2xl font-light text-ink">{title}</h1>
          <p className="mt-1 text-sm text-ink/65">{subtitle}</p>
        </div>
        <PrintInvoiceButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 print:grid-cols-3 print:gap-3">
        {labels.map((label, i) => (
          <div
            key={`${label.key}-${i}`}
            className="flex flex-col items-center gap-2 rounded-[3px] border border-ink/15 bg-white p-4 text-center print:break-inside-avoid"
          >
            <p className="text-xs font-medium text-ink">{label.name}</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- server-generated data URI, not a static asset next/image can optimize */}
            <img src={label.imageDataUri} alt={`Barcode ${label.sku}`} className="h-auto w-full max-w-[200px]" />
            <p className="font-feature-tabular text-xs text-ink/60">{formatPrice(label.price)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
