"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Download, Mail, Phone, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { ActionResult } from "@/app/admin/actions";
import { humanize } from "@/core/config/resources";
import type { AdminNote, NoteEntityType } from "@/core/domain/models";
import { cn, formatDateTime, formatRelative } from "@/lib/utils";
import { ConfirmButton } from "./ConfirmButton";
import { EmptyState } from "./PageHeader";
import { NotesPanel } from "./NotesPanel";
import { StatusBadge } from "./StatusBadge";
import { useAction } from "./useAction";

export interface InboxItem {
  id: string;
  title: string;
  subtitle: string;
  email: string;
  phone: string | null;
  createdAt: string;
  status: string;
  details: { label: string; value: string }[];
  body: string | null;
  notes: AdminNote[];
}

interface InboxListProps {
  entityType: Exclude<NoteEntityType, "general" | "shipment">;
  items: InboxItem[];
  statuses: readonly string[];
  onStatusChange: (id: string, status: string) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
  exportHref: string;
  noun: string;
}

export function InboxList({ entityType, items, statuses, onStatusChange, onDelete, exportHref, noun }: InboxListProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const { run, pending } = useAction();

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!needle) return true;
      const haystack = [item.title, item.subtitle, item.email, item.phone ?? "", item.body ?? "", ...item.details.map((d) => d.value)]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [items, query, statusFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    for (const item of items) map[item.status] = (map[item.status] ?? 0) + 1;
    return map;
  }, [items]);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${noun}`}
            aria-label={`Search ${noun}`}
            className="h-11 w-full rounded-lg border border-ink-200 bg-white pr-3 pl-10 focus:border-signal-500 focus:ring-2 focus:ring-signal-400/70 focus:outline-none"
          />
        </div>
        <a
          href={exportHref}
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-900 hover:border-ink-400"
        >
          <Download className="size-4" aria-hidden="true" />
          Export CSV
        </a>
      </div>

      <div role="tablist" aria-label="Filter by status" className="mb-5 flex flex-wrap gap-2">
        {["all", ...statuses].map((status) => (
          <button
            key={status}
            role="tab"
            type="button"
            aria-selected={statusFilter === status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              statusFilter === status
                ? "border-ink-900 bg-ink-900 text-white"
                : "border-ink-200 bg-white text-ink-700 hover:border-ink-400",
            )}
          >
            {status === "all" ? "All" : humanize(status)}
            <span className={cn("ml-1.5 tabular-nums", statusFilter === status ? "text-ink-300" : "text-ink-500")}>
              {counts[status] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={items.length === 0 ? `No ${noun} yet` : `No ${noun} match`}
          description={
            items.length === 0
              ? `New ${noun} submitted on the website will show up here.`
              : "Try a different search or status filter."
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((item) => {
            const open = openId === item.id;
            const panelId = `inbox-${item.id}`;
            return (
              <li key={item.id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={panelId}
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-ink-50/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-display text-lg font-semibold">{item.title}</span>
                      <StatusBadge status={item.status} />
                      {item.notes.length > 0 ? (
                        <span className="text-xs font-medium text-ink-500">
                          {item.notes.length} {item.notes.length === 1 ? "note" : "notes"}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-ink-600">{item.subtitle}</span>
                  </span>
                  <span className="hidden shrink-0 text-sm text-ink-500 sm:block" title={formatDateTime(item.createdAt)}>
                    {formatRelative(item.createdAt)}
                  </span>
                  <ChevronDown className={cn("size-5 shrink-0 text-ink-500 transition-transform", open && "rotate-180")} aria-hidden="true" />
                </button>

                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      id={panelId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-8 border-t border-ink-100 bg-ink-50/50 px-5 py-5 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-5">
                          <div className="flex flex-wrap gap-4 text-sm">
                            <a href={`mailto:${item.email}`} className="inline-flex items-center gap-2 font-medium text-ink-800 hover:text-signal-700">
                              <Mail className="size-4" aria-hidden="true" />
                              {item.email}
                            </a>
                            {item.phone ? (
                              <a href={`tel:${item.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 font-medium text-ink-800 hover:text-signal-700">
                                <Phone className="size-4" aria-hidden="true" />
                                {item.phone}
                              </a>
                            ) : null}
                          </div>

                          {item.details.length > 0 ? (
                            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                              {item.details.map((detail) => (
                                <div key={detail.label}>
                                  <dt className="text-xs font-medium text-ink-500">{detail.label}</dt>
                                  <dd className="text-sm font-medium text-ink-900">{detail.value}</dd>
                                </div>
                              ))}
                            </dl>
                          ) : null}

                          {item.body ? (
                            <div>
                              <p className="text-xs font-medium text-ink-500">Message</p>
                              <p className="mt-1 text-sm whitespace-pre-wrap text-ink-800">{item.body}</p>
                            </div>
                          ) : null}

                          <div className="flex flex-wrap items-center gap-3 border-t border-ink-100 pt-4">
                            <label className="flex items-center gap-2 text-sm font-medium text-ink-800">
                              Status
                              <select
                                value={item.status}
                                disabled={pending}
                                onChange={(event) => void run(() => onStatusChange(item.id, event.target.value))}
                                className="h-9 rounded-lg border border-ink-200 bg-white px-2.5 text-sm focus:border-signal-500 focus:outline-none focus:ring-2 focus:ring-signal-400/70"
                              >
                                {statuses.map((status) => (
                                  <option key={status} value={status}>
                                    {humanize(status)}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <ConfirmButton
                              label="Delete"
                              ariaLabel={`Delete ${noun.replace(/s$/, "")} from ${item.title}`}
                              confirmText="Delete this record and its notes? This cannot be undone."
                              action={() => onDelete(item.id)}
                            />
                          </div>
                        </div>

                        <div>
                          <h3 className="mb-3 font-display text-base font-semibold">Internal notes</h3>
                          <NotesPanel entityType={entityType} entityId={item.id} notes={item.notes} />
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
