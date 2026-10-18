"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import type { ActionResult } from "@/app/admin/actions";
import { useToast } from "./Toaster";

/**
 * Runs a server action, shows a toast with the outcome and refreshes server data.
 * Returns the raw result so forms can also display field-level errors.
 */
export function useAction() {
  const router = useRouter();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  const run = useCallback(
    (work: () => Promise<ActionResult>, options: { silent?: boolean } = {}): Promise<ActionResult> =>
      new Promise((resolve) => {
        startTransition(async () => {
          let result: ActionResult;
          try {
            result = await work();
          } catch {
            result = { ok: false, message: "We could not reach the server. Check your connection and try again." };
          }

          if (result.ok) {
            if (result.message && !options.silent) toast.success(result.message);
            router.refresh();
          } else if (result.message) {
            toast.error(result.message);
          }
          resolve(result);
        });
      }),
    [router, toast],
  );

  return { run, pending };
}
