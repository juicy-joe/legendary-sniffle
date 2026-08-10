"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions";

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2 text-xs">
        <span className="text-ink/70">Delete &ldquo;{name}&rdquo;?</span>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => deleteProduct(id))}
          className="font-medium text-red-700 hover:underline disabled:opacity-60"
        >
          {pending ? "Deleting..." : "Confirm"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="text-ink/50 hover:text-ink">
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Delete ${name}`}
      className="text-ink/40 transition-colors hover:text-red-700"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
