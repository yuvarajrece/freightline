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
} from "./models";

/**
 * Repository contracts (Interface Segregation + Dependency Inversion).
 * Services depend on these small interfaces, never on Supabase.
 */

export interface OrderBy {
  column: string;
  ascending?: boolean;
}

export type FilterValue = string | number | boolean;

export interface ListOptions {
  onlyPublished?: boolean;
  orderBy?: OrderBy;
  limit?: number;
  filters?: Record<string, FilterValue>;
  /** ISO timestamp; only rows created at or after this moment. */
  createdSince?: string;
}

export interface IReadRepository<T> {
  list(options?: ListOptions): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  count(filters?: Record<string, FilterValue>): Promise<number>;
}

export interface IWriteRepository<T, TCreate, TUpdate> {
  create(input: TCreate): Promise<T>;
  update(id: string, input: TUpdate): Promise<T>;
  remove(id: string): Promise<void>;
}

export interface IInsertOnlyRepository<TCreate> {
  /** Inserts without reading the row back (visitors cannot read what they write). */
  insert(input: TCreate): Promise<void>;
}

export interface IRepository<T, TCreate = Partial<T>, TUpdate = Partial<T>>
  extends IReadRepository<T>,
    IWriteRepository<T, TCreate, TUpdate> {}

export interface IQuoteRepository
  extends IRepository<QuoteRequest, NewQuoteRequest, Partial<QuoteRequest>>,
    IInsertOnlyRepository<NewQuoteRequest> {}

export interface IContactRepository
  extends IRepository<ContactMessage, NewContactMessage, Partial<ContactMessage>>,
    IInsertOnlyRepository<NewContactMessage> {}

export interface ISubscriberRepository extends IReadRepository<Subscriber> {
  subscribe(email: string): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface INoteRepository
  extends IRepository<AdminNote, NewAdminNote, Partial<NewAdminNote>> {
  listForEntity(type: NoteEntityType, entityId: string | null): Promise<AdminNote[]>;
}

export interface IShipmentEventRepository
  extends IRepository<ShipmentEvent, NewShipmentEvent, Partial<NewShipmentEvent>> {
  listForShipment(shipmentId: string): Promise<ShipmentEvent[]>;
}

export interface ITrackingRepository {
  findByCode(code: string): Promise<TrackingResult | null>;
}

export interface ISettingsRepository {
  getAll(): Promise<SettingsMap>;
  save(key: string, value: Record<string, string>): Promise<void>;
}

/** Fixed-window limiter abstraction so the in-memory one can be swapped for Redis. */
export interface IRateLimiter {
  consume(key: string): void;
}
