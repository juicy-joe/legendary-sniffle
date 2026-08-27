"use client";

import { useState, useTransition } from "react";
import { updateLowStockThreshold } from "@/app/admin/(dashboard)/warehouse/actions";

export default function StockThresholdInput({
  productId,
  initialValue,
}: {
  productId: string;
  initialValue: number;
}) {
  const [value, setValue] = useState(initialValue);
  const [pending, startTransition] = useTransition();

  return (
    <input
      type="number"
      min={0}
      step={1}
      value={value}
      disabled={pending}
      onChange={(e) => setValue(Number(e.target.value))}
      onBlur={() => {
        if (value !== initialValue) {
          startTransition(async () => {
            await updateLowStockThreshold(productId, value);
          });
        }
      }}
      className="w-16 rounded-[3px] border border-ink/20 bg-transparent px-2 py-1 text-sm text-ink outline-none transition-colors focus:border-gold-dark disabled:opacity-60"
      aria-label="Low stock threshold"
    />
  );
}
