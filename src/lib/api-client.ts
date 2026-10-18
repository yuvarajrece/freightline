"use client";

import { useCallback, useState, type FormEvent } from "react";

export interface ApiResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

interface ApiErrorBody {
  ok?: boolean;
  error?: { message?: string; fields?: Record<string, string[]> };
}

export async function postJson(url: string, payload: unknown): Promise<ApiResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;

    if (response.ok && body?.ok) return { ok: true };
    return {
      ok: false,
      message: body?.error?.message ?? "We could not send that. Please try again.",
      fieldErrors: body?.error?.fields,
    };
  } catch {
    return { ok: false, message: "We could not reach the server. Check your connection and try again." };
  }
}

interface SubmitState {
  pending: boolean;
  success: boolean;
  message?: string;
  fieldErrors: Record<string, string[]>;
}

/** Submits a native form as JSON and tracks pending, success and per-field errors. */
export function useFormSubmit(url: string) {
  const [state, setState] = useState<SubmitState>({ pending: false, success: false, fieldErrors: {} });

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const form = event.currentTarget;
      const payload = Object.fromEntries(new FormData(form).entries());

      setState({ pending: true, success: false, fieldErrors: {} });
      const result = await postJson(url, payload);

      if (result.ok) {
        form.reset();
        setState({ pending: false, success: true, fieldErrors: {} });
      } else {
        setState({ pending: false, success: false, message: result.message, fieldErrors: result.fieldErrors ?? {} });
      }
    },
    [url],
  );

  const reset = useCallback(() => setState({ pending: false, success: false, fieldErrors: {} }), []);
  const errorFor = (name: string): string | undefined => state.fieldErrors[name]?.[0];

  return { ...state, onSubmit, reset, errorFor };
}
