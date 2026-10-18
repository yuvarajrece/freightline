import type {
  IReadRepository,
  IShipmentEventRepository,
  ISubscriberRepository,
} from "@/core/domain/contracts";
import { ValidationError } from "@/core/domain/errors";
import type {
  ContactMessage,
  LeadStatus,
  MessageStatus,
  NewShipmentEvent,
  QuoteRequest,
  ShipmentEvent,
  Subscriber,
} from "@/core/domain/models";
import { LEAD_STATUSES, MESSAGE_STATUSES } from "@/core/domain/models";
import { parseOrThrow, shipmentEventSchema } from "@/core/validation/schemas";

/** The slice of a repository this service needs: read, partial update and delete. */
interface ManagedRepository<T extends { id: string }> extends IReadRepository<T> {
  update(id: string, input: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

/** Admin-side workflows for data collected from the website. */
export class InboxService {
  constructor(
    private readonly quotes: ManagedRepository<QuoteRequest>,
    private readonly messages: ManagedRepository<ContactMessage>,
    private readonly subscribers: IReadRepository<Subscriber> & Pick<ISubscriberRepository, "remove">,
    private readonly events: IShipmentEventRepository,
  ) {}

  listQuotes(limit = 500): Promise<QuoteRequest[]> {
    return this.quotes.list({ limit });
  }

  listMessages(limit = 500): Promise<ContactMessage[]> {
    return this.messages.list({ limit });
  }

  listSubscribers(limit = 2000): Promise<Subscriber[]> {
    return this.subscribers.list({ limit });
  }

  async setQuoteStatus(id: string, status: string): Promise<QuoteRequest> {
    if (!(LEAD_STATUSES as readonly string[]).includes(status)) throw new ValidationError("Unknown status.");
    return this.quotes.update(id, { status: status as LeadStatus });
  }

  async setMessageStatus(id: string, status: string): Promise<ContactMessage> {
    if (!(MESSAGE_STATUSES as readonly string[]).includes(status)) throw new ValidationError("Unknown status.");
    return this.messages.update(id, { status: status as MessageStatus });
  }

  removeQuote(id: string): Promise<void> {
    return this.quotes.remove(id);
  }

  removeMessage(id: string): Promise<void> {
    return this.messages.remove(id);
  }

  removeSubscriber(id: string): Promise<void> {
    return this.subscribers.remove(id);
  }

  listShipmentEvents(shipmentId: string): Promise<ShipmentEvent[]> {
    return this.events.listForShipment(shipmentId);
  }

  async addShipmentEvent(raw: unknown): Promise<ShipmentEvent> {
    const input = parseOrThrow(shipmentEventSchema, raw);
    const event: NewShipmentEvent = {
      shipment_id: input.shipment_id,
      status: input.status,
      location: input.location,
      description: input.description,
      occurred_at: new Date(input.occurred_at).toISOString(),
    };
    return this.events.create(event);
  }

  removeShipmentEvent(id: string): Promise<void> {
    return this.events.remove(id);
  }
}
