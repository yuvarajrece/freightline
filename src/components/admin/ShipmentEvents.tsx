"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { addShipmentEventAction, deleteShipmentEventAction } from "@/app/admin/actions";
import { SHIPMENT_STATUS_OPTIONS, type FieldConfig } from "@/core/config/resources";
import type { ShipmentEvent } from "@/core/domain/models";
import { cn, formatDateTime, toLocalInputValue } from "@/lib/utils";
import { ConfirmButton } from "./ConfirmButton";
import { DynamicForm } from "./DynamicForm";
import { StatusBadge } from "./StatusBadge";

interface ShipmentEventsProps {
  shipmentId: string;
  events: ShipmentEvent[];
}

export function ShipmentEvents({ shipmentId, events }: ShipmentEventsProps) {
  // Set after mount: the server and the browser can be in different time zones.
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => setNow(toLocalInputValue(new Date().toISOString())), []);

  const fields: FieldConfig[] = [
    { name: "status", label: "Status", type: "select", required: true, options: SHIPMENT_STATUS_OPTIONS, defaultValue: "in_transit" },
    { name: "location", label: "Location", type: "text", required: true, maxLength: 160, placeholder: "e.g. Salem checkpoint" },
    { name: "description", label: "Note shown to the customer", type: "text", maxLength: 400, placeholder: "e.g. Departed hub" },
    { name: "occurred_at", label: "When", type: "datetime", required: true, defaultValue: now ?? "" },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <section aria-labelledby="events-heading">
        <h2 id="events-heading" className="mb-4 text-xl font-semibold">
          Tracking history
        </h2>
        {events.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-200 bg-white p-6 text-ink-600">
            No updates yet. Add the first one so customers see progress on the tracking page.
          </p>
        ) : (
          <ol className="space-y-0 rounded-2xl border border-ink-100 bg-white p-5">
            {events.map((event, index) => (
              <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                {index < events.length - 1 ? <span className="absolute top-5 bottom-0 left-[7px] w-px bg-ink-200" aria-hidden="true" /> : null}
                <span
                  className={cn("relative mt-1.5 size-4 shrink-0 rounded-full border-2 border-white ring-2", index === 0 ? "bg-signal-400 ring-signal-300" : "bg-ink-300 ring-ink-200")}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={event.status} />
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-800">
                      <MapPin className="size-3.5 text-ink-500" aria-hidden="true" />
                      {event.location}
                    </span>
                  </div>
                  {event.description ? <p className="mt-1 text-sm text-ink-700">{event.description}</p> : null}
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-xs text-ink-500">{formatDateTime(event.occurred_at)}</p>
                    <ConfirmButton
                      ariaLabel="Delete tracking update"
                      confirmText="Delete this tracking update?"
                      action={() => deleteShipmentEventAction(event.id)}
                      className="px-2 py-1 text-xs"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section aria-labelledby="add-event-heading" className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 id="add-event-heading" className="mb-1 text-xl font-semibold">
          Add a tracking update
        </h2>
        <p className="mb-5 text-sm text-ink-600">The newest update sets the shipment status shown to customers.</p>
        <DynamicForm
          key={now ?? "pending"}
          fields={fields}
          submitLabel="Add update"
          resetOnSuccess
          onSubmit={(values) => addShipmentEventAction({ ...values, shipment_id: shipmentId })}
        />
      </section>
    </div>
  );
}
