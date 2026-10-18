import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { NotesPanel } from "@/components/admin/NotesPanel";
import { PageHeader } from "@/components/admin/PageHeader";
import { ShipmentEvents } from "@/components/admin/ShipmentEvents";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { ShipmentStatus } from "@/core/domain/models";
import { formatDateTime } from "@/lib/utils";
import { requireAdmin } from "@/services/admin-context";

export const metadata: Metadata = { title: "Shipment" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ShipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();

  const { container } = await requireAdmin();
  const shipment = await container.resourceService.get("shipments", id);
  if (!shipment) notFound();

  const [events, notes] = await Promise.all([
    container.inboxService.listShipmentEvents(id),
    container.noteService.listForEntity("shipment", id),
  ]);

  return (
    <>
      <Link href="/admin/shipments" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-700 hover:text-signal-700">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All shipments
      </Link>

      <PageHeader
        title={`${String(shipment.origin)} to ${String(shipment.destination)}`}
        description={`Tracking code ${String(shipment.tracking_code)}${shipment.customer_name ? ` · ${String(shipment.customer_name)}` : ""}${shipment.eta ? ` · ETA ${formatDateTime(String(shipment.eta))}` : ""}`}
        actions={<StatusBadge status={String(shipment.status) as ShipmentStatus} className="px-3.5 py-1.5 text-sm" />}
      />

      <ShipmentEvents shipmentId={id} events={events} />

      <section aria-labelledby="shipment-notes" className="mt-10">
        <h2 id="shipment-notes" className="mb-4 text-xl font-semibold">
          Internal notes
        </h2>
        <p className="mb-4 max-w-2xl text-sm text-ink-600">Only your team can see these. They never appear on the public tracking page.</p>
        <div className="max-w-2xl">
          <NotesPanel entityType="shipment" entityId={id} notes={notes} emptyText="No notes on this shipment yet." />
        </div>
      </section>
    </>
  );
}
