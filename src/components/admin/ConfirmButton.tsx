"use client";

import { Loader2, Trash2 } from "lucide-react";
import type { ActionResult } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { useAction } from "./useAction";

interface ConfirmButtonProps {
  action: () => Promise<ActionResult>;
  confirmText: string;
  label?: string;
  ariaLabel: string;
  className?: string;
}

/** Destructive action guarded by a confirmation prompt. */
export function ConfirmButton({ action, confirmText, label, ariaLabel, className }: ConfirmButtonProps) {
  const { run, pending } = useAction();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={ariaLabel}
      onClick={() => {
        if (window.confirm(confirmText)) void run(action);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-alert-500 transition-colors hover:bg-alert-500/10 disabled:opacity-50",
        className,
      )}
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Trash2 className="size-4" aria-hidden="true" />}
      {label}
    </button>
  );
}
