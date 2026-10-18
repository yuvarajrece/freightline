import type { Metadata } from "next";
import { InboxList, type InboxItem } from "@/components/admin/InboxList";
import { PageHeader } from "@/components/admin/PageHeader";
import { LEAD_STATUSES } from "@/core/domain/models";
import { groupBy } from "@/lib/group";
import { formatDate, formatNumber } from "@/lib/utils";
import { requireAdmin } from "@/services/admin-context";
import { deleteQuoteAction, setQuoteStatusAction } from "../../actions";

export const metadata: Metadata = { title: "Quote requests" };

export default async function LeadsPage() {
  const { container } = await requireAdmin();
  const [quotes, notes] = await Promise.all([container.inboxService.listQuotes(), container.noteService.listByType("quote")]);
  const notesByQuote = groupBy(notes, (note) => note.entity_id);

  const items: InboxItem[] = quotes.map((quote) => ({
    id: quote.id,
    title: quote.company ? `${quote.full_name}, ${quote.company}` : quote.full_name,
    subtitle: `${quote.origin} to ${quote.destination}${quote.service_label ? ` · ${quote.service_label}` : ""}`,
    email: quote.email,
    phone: quote.phone,
    createdAt: quote.created_at,
    status: quote.status,
    details: [
      { label: "Pickup", value: quote.origin },
      { label: "Delivery", value: quote.destination },
      quote.service_label ? { label: "Service", value: quote.service_label } : null,
      quote.cargo_type ? { label: "Cargo", value: quote.cargo_type } : null,
      quote.weight_kg !== null ? { label: "Weight", value: `${formatNumber(Number(quote.weight_kg), 0)} kg` } : null,
      quote.pickup_date ? { label: "Preferred pickup", value: formatDate(quote.pickup_date) } : null,
    ].filter((detail): detail is { label: string; value: string } => detail !== null),
    body: quote.message,
    notes: notesByQuote.get(quote.id) ?? [],
  }));

  return (
    <>
      <PageHeader title="Quote requests" description="Every request from the website quote form. Update the status as you work through each one." />
      <InboxList
        entityType="quote"
        noun="quote requests"
        items={items}
        statuses={LEAD_STATUSES}
        onStatusChange={setQuoteStatusAction}
        onDelete={deleteQuoteAction}
        exportHref="/admin/export/quotes"
      />
    </>
  );
}
