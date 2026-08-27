"use client";

import { Printer } from "lucide-react";

export default function PrintInvoiceButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden flex items-center gap-2 rounded-[3px] border border-ink bg-ink px-6 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-paper transition-colors hover:bg-gold-dark hover:border-gold-dark"
    >
      <Printer className="h-4 w-4" /> Print / Save as PDF
    </button>
  );
}
