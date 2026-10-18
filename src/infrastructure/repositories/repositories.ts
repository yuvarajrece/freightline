import type { SupabaseClient } from "@supabase/supabase-js";
import { RepositoryError } from "@/core/domain/errors";
import type {
  IContactRepository,
  INoteRepository,
  IQuoteRepository,
  ISettingsRepository,
  IShipmentEventRepository,
  ISubscriberRepository,
  ITrackingRepository,
} from "@/core/domain/contracts";
import type {
  AdminNote,
  ContactMessage,
  NewAdminNote,
  NewContactMessage,
  NewQuoteRequest,
  NewShipmentEvent,
  NoteEntityType,
  QuoteRequest,
  SettingsMap,
  ShipmentEvent,
  Subscriber,
  TrackingResult,
} from "@/core/domain/models";
import { SupabaseRepository } from "./SupabaseRepository";

/** Published website content (services, fleet, FAQs...). No extra behaviour needed. */
export class ContentRepository<T extends { id: string }> extends SupabaseRepository<T> {
  constructor(client: SupabaseClient, table: string) {
    super(client, table, { column: "sort_order", ascending: true });
  }
}

export class QuoteRepository
  extends SupabaseRepository<QuoteRequest, NewQuoteRequest, Partial<QuoteRequest>>
  implements IQuoteRepository
{
  constructor(client: SupabaseClient) {
    super(client, "quote_requests", { column: "created_at", ascending: false });
  }
}

export class ContactRepository
  extends SupabaseRepository<ContactMessage, NewContactMessage, Partial<ContactMessage>>
  implements IContactRepository
{
  constructor(client: SupabaseClient) {
    super(client, "contact_messages", { column: "created_at", ascending: false });
  }
}

export class SubscriberRepository extends SupabaseRepository<Subscriber> implements ISubscriberRepository {
  constructor(client: SupabaseClient) {
    super(client, "subscribers", { column: "created_at", ascending: false });
  }

  /** Goes through a security-definer function so visitors can subscribe without read access. */
  async subscribe(email: string): Promise<void> {
    const { error } = await this.client.rpc("subscribe_email", { p_email: email });
    if (error) throw this.fail(error);
  }
}

export class NoteRepository
  extends SupabaseRepository<AdminNote, NewAdminNote, Partial<NewAdminNote>>
  implements INoteRepository
{
  constructor(client: SupabaseClient) {
    super(client, "admin_notes", { column: "updated_at", ascending: false });
  }

  async listForEntity(type: NoteEntityType, entityId: string | null): Promise<AdminNote[]> {
    let query = this.client.from(this.table).select("*").eq("entity_type", type);
    query = entityId ? query.eq("entity_id", entityId) : query.is("entity_id", null);

    const { data, error } = await query
      .order("pinned", { ascending: false })
      .order("updated_at", { ascending: false });
    if (error) throw this.fail(error);
    return (data ?? []) as unknown as AdminNote[];
  }
}

export class ShipmentEventRepository
  extends SupabaseRepository<ShipmentEvent, NewShipmentEvent, Partial<NewShipmentEvent>>
  implements IShipmentEventRepository
{
  constructor(client: SupabaseClient) {
    super(client, "shipment_events", { column: "occurred_at", ascending: false });
  }

  listForShipment(shipmentId: string): Promise<ShipmentEvent[]> {
    return this.list({ filters: { shipment_id: shipmentId }, orderBy: { column: "occurred_at", ascending: false } });
  }
}

export class TrackingRepository implements ITrackingRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findByCode(code: string): Promise<TrackingResult | null> {
    const { data, error } = await this.client.rpc("track_shipment", { p_code: code });
    if (error) throw new RepositoryError(`track_shipment: ${error.message}`, { code: error.code });
    return data ? (data as TrackingResult) : null;
  }
}

export class SettingsRepository implements ISettingsRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getAll(): Promise<SettingsMap> {
    const { data, error } = await this.client.from("site_settings").select("key, value");
    if (error) throw new RepositoryError(`site_settings: ${error.message}`, { code: error.code });

    const map: SettingsMap = {};
    for (const row of (data ?? []) as { key: string; value: Record<string, unknown> | null }[]) {
      const section: Record<string, string> = {};
      for (const [field, value] of Object.entries(row.value ?? {})) {
        section[field] = value === null || value === undefined ? "" : String(value);
      }
      map[row.key] = section;
    }
    return map;
  }

  async save(key: string, value: Record<string, string>): Promise<void> {
    const { error } = await this.client.from("site_settings").upsert({ key, value }, { onConflict: "key" });
    if (error) throw new RepositoryError(`site_settings: ${error.message}`, { code: error.code });
  }
}
