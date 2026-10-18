import type { Metadata } from "next";
import Link from "next/link";
import { Charts } from "./overview-charts";
import { NetworkOverview } from "@/components/admin/NetworkOverview";
import { EmptyState, PageHeader } from "@/components/admin/PageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatNumber, formatRelative } from "@/lib/utils";
import { requireAdmin } from "@/services/admin-context";

export const metadata: Metadata = { title: "Overview" };

function Kpi({ label, value, hint, href }: { label: string; value: number; hint?: string; href: string }) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-ink-100 bg-white p-5 transition-[border-color,box-shadow] hover:border-signal-300 hover:shadow-[0_18px_40px_-28px_rgba(11,31,58,0.5)]"
    >
      <p className="text-sm font-medium text-ink-600">{label}</p>
      <p className="mt-2 font-display text-4xl font-semibold tabular-nums">{formatNumber(value)}</p>
      {hint ? <p className="mt-1 text-sm text-ink-500">{hint}</p> : null}
    </Link>
  );
}

export default async function OverviewPage() {
  const { container } = await requireAdmin();
  const [overview, network] = await Promise.all([
    container.dashboardService.getOverview(),
    container.dashboardService.getNetwork(),
  ]);
  const { totals } = overview;

  return (
    <>
      <PageHeader title="Overview" description="What is coming in from the website and what needs a reply." />

      <section aria-label="Key figures" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Quote requests" value={totals.quotes} hint={`${totals.newQuotes} waiting for a first reply`} href="/admin/leads" />
        <Kpi label="Messages" value={totals.messages} hint={`${totals.newMessages} unread`} href="/admin/messages" />
        <Kpi label="Newsletter subscribers" value={totals.subscribers} href="/admin/subscribers" />
        <Kpi label="Shipments on the road" value={totals.activeShipments} hint="Not yet delivered" href="/admin/shipments" />
      </section>

      <NetworkOverview locations={network.locations} lanes={network.lanes} />

      <Charts perDay={overview.quotesPerDay} byStatus={overview.quotesByStatus} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="recent-quotes" className="rounded-2xl border border-ink-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-quotes" className="text-xl font-semibold">
              Latest quote requests
            </h2>
            <Link href="/admin/leads" className="text-sm font-medium text-ink-700 hover:text-signal-700">
              View all
            </Link>
          </div>
          {overview.recentQuotes.length === 0 ? (
            <p className="text-ink-600">Nothing yet. Requests from the quote form land here.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {overview.recentQuotes.map((quote) => (
                <li key={quote.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{quote.full_name}</p>
                    <p className="truncate text-sm text-ink-600">
                      {quote.origin} to {quote.destination}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge status={quote.status} />
                    <p className="mt-1 text-xs text-ink-500">{formatRelative(quote.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="recent-messages" className="rounded-2xl border border-ink-100 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-messages" className="text-xl font-semibold">
              Latest messages
            </h2>
            <Link href="/admin/messages" className="text-sm font-medium text-ink-700 hover:text-signal-700">
              View all
            </Link>
          </div>
          {overview.recentMessages.length === 0 ? (
            <p className="text-ink-600">Nothing yet. Contact form messages land here.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {overview.recentMessages.map((message) => (
                <li key={message.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{message.full_name}</p>
                    <p className="truncate text-sm text-ink-600">{message.subject || message.message}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <StatusBadge status={message.status} />
                    <p className="mt-1 text-xs text-ink-500">{formatRelative(message.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="pinned-notes" className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="pinned-notes" className="text-xl font-semibold">
            Pinned notes
          </h2>
          <Link href="/admin/notes" className="text-sm font-medium text-ink-700 hover:text-signal-700">
            Open notebook
          </Link>
        </div>
        {overview.pinnedNotes.length === 0 ? (
          <EmptyState title="No pinned notes" description="Pin a note from any quote, message, shipment or the notebook and it stays here." />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {overview.pinnedNotes.map((note) => (
              <li key={note.id} className="rounded-xl border border-signal-300 bg-signal-50 p-4">
                {note.title ? <p className="font-display font-semibold">{note.title}</p> : null}
                <p className="line-clamp-4 text-sm whitespace-pre-wrap text-ink-800">{note.body}</p>
                <p className="mt-2 text-xs text-ink-500">{formatRelative(note.updated_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
