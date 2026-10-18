"use client";

import { Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { FieldConfig, ResourceKey, SelectOption } from "@/core/config/resources";
import { toLocalInputValue } from "@/lib/utils";
import { FieldInput, type FieldValue } from "./FieldInput";
import { useAction } from "./useAction";

type Values = Record<string, FieldValue>;

interface DynamicFormProps {
  fields: FieldConfig[];
  /** Existing row when editing; omit for a blank "create" form. */
  initial?: Record<string, unknown> | null;
  relationOptions?: Partial<Record<ResourceKey, SelectOption[]>>;
  submitLabel: string;
  onSubmit: (values: Record<string, unknown>) => Promise<ActionResult>;
  onSuccess?: () => void;
  onCancel?: () => void;
  /** Reset to defaults after a successful save (for inline "add" forms). */
  resetOnSuccess?: boolean;
}

function toFieldValue(field: FieldConfig, raw: unknown): FieldValue {
  if (raw === null || raw === undefined) {
    if (field.type === "boolean") return Boolean(field.defaultValue ?? false);
    if (field.type === "tags") return Array.isArray(field.defaultValue) ? field.defaultValue : [];
    return (field.defaultValue as FieldValue) ?? "";
  }
  if (field.type === "datetime") return toLocalInputValue(String(raw));
  if (field.type === "tags") return Array.isArray(raw) ? (raw as string[]) : [];
  if (field.type === "boolean") return Boolean(raw);
  if (field.type === "number") return String(raw);
  return raw as FieldValue;
}

function buildInitialValues(fields: FieldConfig[], initial?: Record<string, unknown> | null): Values {
  return Object.fromEntries(fields.map((field) => [field.name, toFieldValue(field, initial?.[field.name])]));
}

/** Converts form state (strings, local datetimes) to the typed payload the server action validates. */
function toPayload(fields: FieldConfig[], values: Values): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const value = values[field.name];
    if (field.type === "number") {
      payload[field.name] = value === "" || value === null || value === undefined ? "" : Number(value);
    } else if (field.type === "datetime") {
      payload[field.name] = typeof value === "string" && value ? new Date(value).toISOString() : "";
    } else {
      payload[field.name] = value;
    }
  }
  return payload;
}

export function DynamicForm({
  fields,
  initial,
  relationOptions,
  submitLabel,
  onSubmit,
  onSuccess,
  onCancel,
  resetOnSuccess = false,
}: DynamicFormProps) {
  const [values, setValues] = useState<Values>(() => buildInitialValues(fields, initial));
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { run, pending } = useAction();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    const result = await run(() => onSubmit(toPayload(fields, values)));

    if (result.ok) {
      if (resetOnSuccess) setValues(buildInitialValues(fields, null));
      onSuccess?.();
    } else {
      setErrors(result.fieldErrors ?? {});
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const wide = field.type === "textarea" || field.type === "tags";
          return (
            <div key={field.name} className={wide ? "sm:col-span-2" : undefined}>
              <FieldInput
                field={field}
                value={values[field.name]}
                onChange={(next) => setValues((current) => ({ ...current, [field.name]: next }))}
                error={errors[field.name]?.[0]}
                relationOptions={relationOptions}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel ? (
          <Button variant="ghost" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" variant="dark" disabled={pending} className="min-w-28">
          {pending ? <Loader2 className="size-4 animate-spin" aria-label="Saving" /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}
