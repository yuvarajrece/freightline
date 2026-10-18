"use client";

import { Pencil, Plus, Route as RouteIcon, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { deleteResourceAction, saveResourceAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import type { ColumnConfig, ResourceConfig, ResourceKey, SelectOption } from "@/core/config/resources";
import { formatDateTime, formatNumber } from "@/lib/utils";
import { ConfirmButton } from "./ConfirmButton";
import { DynamicForm } from "./DynamicForm";
import { EmptyState } from "./PageHeader";
import { StatusBadge } from "./StatusBadge";

type Row = { id: string } & Record<string, unknown>;

interface ResourceManagerProps {
  config: ResourceConfig;
  rows: Row[];
  relationOptions: Partial<Record<ResourceKey, SelectOption[]>>;
  /** Base path of a detail page; rows link to `${detailBasePath}/${row.id}` (used by shipments). */
  detailBasePath?: string;
  detailLabel?: string;
}

export function ResourceManager({ config, rows, relationOptions, detailBasePath, detailLabel = "Open" }: ResourceManagerProps) {
  const [editing, setEditing] = useState<Row | "new" | null>(null);

  const relationLabels = useMemo(() => {
    const maps: Partial<Record<ResourceKey, Map<string, string>>> = {};
    for (const [key, options] of Object.entries(relationOptions) as [ResourceKey, SelectOption[]][]) {
      maps[key] = new Map(options.map((option) => [option.value, option.label]));
    }
    return maps;
  }, [relationOptions]);

  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button variant="primary" onClick={() => setEditing("new")}>
          <Plus className="size-4" aria-hidden="true" />
          Add {config.singular}
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title={`No ${config.label.toLowerCase()} yet`}
          description={`Add your first ${config.singular} and it will appear on the website straight away.`}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">{config.label}</caption>
            <thead className="border-b border-ink-100 bg-ink-50 text-ink-600">
              <tr>
                {config.columns.map((column) => (
                  <th key={column.field} scope="col" className="px-4 py-3 font-semibold">
                    {column.label}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-ink-50/60">
                  {config.columns.map((column) => (
                    <td key={column.field} className="max-w-xs px-4 py-3 align-middle">
                      <Cell column={column} value={row[column.field]} relationLabels={relationLabels} />
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    {detailBasePath ? (
                      <Link
                        href={`${detailBasePath}/${row.id}`}
                        className="mr-1 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
                      >
                        <RouteIcon className="size-4" aria-hidden="true" />
                        {detailLabel}
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setEditing(row)}
                      aria-label={`Edit ${config.singular}`}
                      className="mr-1 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink-700 hover:bg-ink-100"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Edit
                    </button>
                    <ConfirmButton
                      ariaLabel={`Delete ${config.singular}`}
                      confirmText={`Delete this ${config.singular}? This cannot be undone.`}
                      action={() => deleteResourceAction(config.key, row.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditorDialog open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" || editing === null ? `Add ${config.singular}` : `Edit ${config.singular}`}>
        {editing !== null ? (
          <DynamicForm
            key={editing === "new" ? "new" : editing.id}
            fields={config.fields}
            initial={editing === "new" ? null : editing}
            relationOptions={relationOptions}
            submitLabel={editing === "new" ? "Add" : "Save changes"}
            onSubmit={(values) => saveResourceAction(config.key, editing === "new" ? null : editing.id, values)}
            onSuccess={() => setEditing(null)}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </EditorDialog>
    </>
  );
}

function Cell({
  column,
  value,
  relationLabels,
}: {
  column: ColumnConfig;
  value: unknown;
  relationLabels: Partial<Record<ResourceKey, Map<string, string>>>;
}) {
  if (value === null || value === undefined || value === "") return <span className="text-ink-400">None</span>;

  switch (column.format) {
    case "boolean":
      return value ? (
        <span className="inline-flex items-center gap-1.5 font-medium text-route-600">
          <span className="size-2 rounded-full bg-route-500" aria-hidden="true" />
          Yes
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-ink-500">
          <span className="size-2 rounded-full bg-ink-300" aria-hidden="true" />
          No
        </span>
      );
    case "badge":
      return <StatusBadge status={String(value)} />;
    case "datetime":
      return <span className="whitespace-nowrap">{formatDateTime(String(value))}</span>;
    case "number":
      return <span className="tabular-nums">{formatNumber(Number(value), Number.isInteger(Number(value)) ? 0 : 2)}</span>;
    case "tags":
      return <span>{Array.isArray(value) ? value.join(", ") : String(value)}</span>;
    case "relation": {
      const label = column.relation ? relationLabels[column.relation]?.get(String(value)) : undefined;
      return <span>{label ?? "Unknown"}</span>;
    }
    default:
      return <span className="line-clamp-2">{String(value)}</span>;
  }
}

/** Accessible modal built on the native <dialog> element (focus trap and Esc handled by the browser). */
export function EditorDialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="m-auto w-[min(42rem,calc(100vw-2rem))] max-h-[90vh] rounded-2xl p-0 shadow-2xl backdrop:bg-ink-950/60 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
        <h2 className="text-xl font-semibold capitalize">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-lg text-ink-600 hover:bg-ink-100">
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div className="overflow-y-auto px-6 py-5">{open ? children : null}</div>
    </dialog>
  );
}
