"use client";

import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { SelectField, TextAreaField, TextField, controlClasses, FieldShell } from "@/components/ui/form";
import type { FieldConfig, ResourceKey, SelectOption } from "@/core/config/resources";
import { cn } from "@/lib/utils";

export type FieldValue = string | number | boolean | string[] | null | undefined;

interface FieldInputProps {
  field: FieldConfig;
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  error?: string;
  relationOptions?: Partial<Record<ResourceKey, SelectOption[]>>;
}

/** Renders the right control for a field config. Values stay in their natural JS types. */
export function FieldInput({ field, value, onChange, error, relationOptions }: FieldInputProps) {
  const common = { label: field.label, error, help: field.help, required: field.required };

  switch (field.type) {
    case "textarea":
      return (
        <TextAreaField
          {...common}
          rows={4}
          maxLength={field.maxLength}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "number":
      return (
        <TextField
          {...common}
          type="number"
          inputMode="decimal"
          min={field.min}
          max={field.max}
          step={field.step ?? "any"}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "datetime":
      return (
        <TextField
          {...common}
          type="datetime-local"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "select":
      return (
        <SelectField
          {...common}
          placeholder={typeof value === "string" && value ? undefined : "Choose..."}
          options={field.options ?? []}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );

    case "relation": {
      const options = field.relation ? (relationOptions?.[field.relation] ?? []) : [];
      return (
        <SelectField
          {...common}
          placeholder="Choose..."
          options={options}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    }

    case "boolean":
      return <ToggleField field={field} value={Boolean(value)} onChange={onChange} />;

    case "tags":
      return <TagsField field={field} value={Array.isArray(value) ? value : []} onChange={onChange} error={error} />;

    case "url":
    case "text":
    default:
      return (
        <TextField
          {...common}
          type={field.type === "url" ? "url" : "text"}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}

function ToggleField({ field, value, onChange }: { field: FieldConfig; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          role="switch"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal-500",
            value ? "bg-route-500" : "bg-ink-200",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform",
              value && "translate-x-5",
            )}
          />
        </span>
        <span className="text-sm font-medium text-ink-800">{field.label}</span>
      </label>
      {field.help ? <p className="text-xs text-ink-500">{field.help}</p> : null}
    </div>
  );
}

function TagsField({
  field,
  value,
  onChange,
  error,
}: {
  field: FieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const next = draft.trim();
    if (next && !value.includes(next)) onChange([...value, next]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <FieldShell label={field.label} error={error} help={field.help}>
      {({ id, describedBy, invalid }) => (
        <div className={cn(controlClasses(invalid), "flex min-h-11 flex-wrap items-center gap-1.5 p-2")}>
          {value.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-ink-100 py-1 pr-1 pl-2 text-sm text-ink-800">
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== tag))}
                aria-label={`Remove ${tag}`}
                className="grid size-5 place-items-center rounded text-ink-500 hover:bg-ink-200 hover:text-ink-900"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </span>
          ))}
          <input
            id={id}
            aria-describedby={describedBy}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={commit}
            placeholder={value.length === 0 ? "Type and press Enter" : ""}
            className="min-w-32 flex-1 bg-transparent px-1.5 py-1 text-[0.95rem] outline-none placeholder:text-ink-400"
          />
        </div>
      )}
    </FieldShell>
  );
}
