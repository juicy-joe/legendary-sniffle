"use client";

import { useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { setProductVisibility } from "@/app/admin/(dashboard)/products/actions";

export default function ToggleProductVisibilityButton({
  id,
  visible,
}: {
  id: string;
  visible: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => setProductVisibility(id, !visible))}
      aria-label={visible ? "Hide from website" : "Show on website"}
      title={visible ? "Visible on website — click to hide" : "Hidden from website — click to show"}
      className="text-xs text-ink/65 transition-colors hover:text-ink disabled:opacity-60"
    >
      <span className="inline-flex items-center gap-1.5">
        {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5 text-ink/40" />}
        {visible ? "Visible" : "Hidden"}
      </span>
    </button>
  );
}
