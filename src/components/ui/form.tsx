"use client";

import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  label: string;
  error?: string;
  help?: string;
  required?: boolean;
  tone?: "light" | "dark";
  className?: string;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

/** Label, control, help text and error message wired together with correct ARIA attributes. */
export function FieldShell({ label, error, help, required, tone = "light", className, children }: FieldShellProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const hasMessage = Boolean(error || help);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn("text-sm font-medium", tone === "dark" ? "text-ink-100" : "text-ink-800")}>
        {label}
        {required ? <span className="text-signal-600" aria-hidden="true"> *</span> : null}
      </label>
      {children({ id, describedBy: hasMessage ? messageId : undefined, invalid: Boolean(error) })}
      {hasMessage ? (
        <p
          id={messageId}
          role={error ? "alert" : undefined}
          className={cn("text-xs", error ? "text-alert-500" : tone === "dark" ? "text-ink-300" : "text-ink-500")}
        >
          {error ?? help}
        </p>
      ) : null}
    </div>
  );
}

export const controlClasses = (invalid: boolean, tone: "light" | "dark" = "light") =>
  cn(
    "w-full rounded-lg border px-3.5 py-2.5 text-[0.95rem] transition-colors",
    "placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-signal-400/70",
    tone === "dark"
      ? "border-white/15 bg-white/5 text-white focus:border-signal-400"
      : "border-ink-200 bg-white text-ink-900 focus:border-signal-500",
    invalid && "border-alert-500 focus:ring-alert-500/40",
  );

interface BaseFieldProps {
  label: string;
  error?: string;
  help?: string;
  tone?: "light" | "dark";
  wrapperClassName?: string;
}

export function TextField({
  label,
  error,
  help,
  tone,
  wrapperClassName,
  required,
  className,
  ...props
}: BaseFieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} error={error} help={help} tone={tone} required={required} className={wrapperClassName}>
      {({ id, describedBy, invalid }) => (
        <input
          id={id}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(controlClasses(invalid, tone), className)}
          {...props}
        />
      )}
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  error,
  help,
  tone,
  wrapperClassName,
  required,
  className,
  rows = 4,
  ...props
}: BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} error={error} help={help} tone={tone} required={required} className={wrapperClassName}>
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          rows={rows}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(controlClasses(invalid, tone), "resize-y", className)}
          {...props}
        />
      )}
    </FieldShell>
  );
}

export interface Option {
  value: string;
  label: string;
}

export function SelectField({
  label,
  error,
  help,
  tone,
  wrapperClassName,
  required,
  className,
  options,
  placeholder,
  ...props
}: BaseFieldProps & SelectHTMLAttributes<HTMLSelectElement> & { options: Option[]; placeholder?: string }) {
  return (
    <FieldShell label={label} error={error} help={help} tone={tone} required={required} className={wrapperClassName}>
      {({ id, describedBy, invalid }) => (
        <select
          id={id}
          required={required}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn(controlClasses(invalid, tone), "appearance-none bg-no-repeat pr-9", className)}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236c88b0' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundPosition: "right 0.75rem center",
          }}
          {...props}
        >
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FieldShell>
  );
}

/** Visually hidden field that real visitors never see; bots fill it in. */
export function Honeypot({ name = "website" }: { name?: string }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name={name} tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}
