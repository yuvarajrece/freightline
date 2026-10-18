import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const IST = "Asia/Kolkata";

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", { timeZone: IST, day: "numeric", month: "short", year: "numeric" }).format(
    new Date(value),
  );
}

export function formatRelative(value: string): string {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return formatDate(value);
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Number of decimals needed to display a value exactly (max 2). */
export function decimalsOf(value: number): number {
  const text = String(value);
  const index = text.indexOf(".");
  return index === -1 ? 0 : Math.min(text.length - index - 1, 2);
}

export function splitLines(value: string | undefined): string[] {
  return (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** datetime-local input value (local time) from an ISO string. */
export function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const text = Array.isArray(value) ? value.join("; ") : String(value);
    // Neutralise spreadsheet formula injection.
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  const header = columns.join(",");
  const lines = rows.map((row) => columns.map((column) => escape(row[column])).join(","));
  return [header, ...lines].join("\r\n");
}
