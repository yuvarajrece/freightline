/**
 * Domain models. These mirror the database tables but know nothing about
 * Supabase, React or Next.js (Dependency Inversion: everything else depends on this file).
 */

export type UUID = string;
export type ISODateString = string;

export interface Entity {
  id: UUID;
  created_at: ISODateString;
}

export interface Publishable {
  is_published: boolean;
  sort_order: number;
}

/* ------------------------------ Content ------------------------------ */

export interface Service extends Entity, Publishable {
  slug: string;
  title: string;
  summary: string;
  icon: string;
  features: string[];
}

export interface FleetVehicle extends Entity, Publishable {
  name: string;
  category: string;
  capacity_tons: number;
  description: string;
  features: string[];
}

export interface Location extends Entity, Publishable {
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  is_hub: boolean;
}

export interface Route extends Entity, Publishable {
  from_location_id: UUID;
  to_location_id: UUID;
  transit_hours: number;
  label: string;
}

/** A route with both ends resolved to their locations. */
export interface Lane {
  id: UUID;
  from: Location;
  to: Location;
  transitHours: number;
  label: string;
}

export interface Stat extends Entity, Publishable {
  label: string;
  value: number;
  prefix: string;
  suffix: string;
}

export interface ProcessStep extends Entity, Publishable {
  title: string;
  description: string;
  icon: string;
}

export interface Testimonial extends Entity, Publishable {
  author_name: string;
  author_role: string;
  company: string;
  quote: string;
  rating: number;
}

export interface Faq extends Entity, Publishable {
  question: string;
  answer: string;
}

export interface Client extends Entity, Publishable {
  name: string;
}

/** site_settings: section key -> field key -> string value. */
export type SettingsMap = Record<string, Record<string, string>>;

export interface HomeContent {
  settings: SettingsMap;
  services: Service[];
  fleet: FleetVehicle[];
  locations: Location[];
  lanes: Lane[];
  stats: Stat[];
  steps: ProcessStep[];
  testimonials: Testimonial[];
  faqs: Faq[];
  clients: Client[];
}

/* ------------------------- Collected visitor data ------------------------- */

export const LEAD_STATUSES = ["new", "contacted", "quoted", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const MESSAGE_STATUSES = ["new", "read", "replied", "archived"] as const;
export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export interface QuoteRequest extends Entity {
  updated_at: ISODateString;
  full_name: string;
  email: string;
  phone: string;
  company: string | null;
  service_label: string | null;
  origin: string;
  destination: string;
  cargo_type: string | null;
  weight_kg: number | null;
  pickup_date: string | null;
  message: string | null;
  status: LeadStatus;
}

export type NewQuoteRequest = Omit<QuoteRequest, "id" | "created_at" | "updated_at" | "status">;

export interface ContactMessage extends Entity {
  full_name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: MessageStatus;
}

export type NewContactMessage = Omit<ContactMessage, "id" | "created_at" | "status">;

export interface Subscriber extends Entity {
  email: string;
  is_active: boolean;
}

/* ------------------------------ Tracking ------------------------------ */

export const SHIPMENT_STATUSES = [
  "booked",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "delayed",
] as const;
export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number];

export interface Shipment extends Entity {
  tracking_code: string;
  origin: string;
  destination: string;
  customer_name: string | null;
  status: ShipmentStatus;
  eta: ISODateString | null;
}

export interface ShipmentEvent extends Entity {
  shipment_id: UUID;
  status: ShipmentStatus;
  location: string;
  description: string | null;
  occurred_at: ISODateString;
}

export type NewShipmentEvent = Omit<ShipmentEvent, "id" | "created_at">;

export interface TrackingEvent {
  status: ShipmentStatus;
  location: string;
  description: string | null;
  occurred_at: ISODateString;
}

export interface TrackingResult {
  tracking_code: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  eta: ISODateString | null;
  events: TrackingEvent[];
}

/* -------------------------------- Notes -------------------------------- */

export const NOTE_ENTITY_TYPES = ["general", "quote", "message", "shipment"] as const;
export type NoteEntityType = (typeof NOTE_ENTITY_TYPES)[number];

export interface AdminNote extends Entity {
  updated_at: ISODateString;
  entity_type: NoteEntityType;
  entity_id: UUID | null;
  title: string;
  body: string;
  pinned: boolean;
  author_email: string | null;
}

export type NewAdminNote = Pick<
  AdminNote,
  "entity_type" | "entity_id" | "title" | "body" | "pinned" | "author_email"
>;

/* ------------------------------ Dashboard ------------------------------ */

export interface DailyCount {
  date: string; // YYYY-MM-DD
  label: string; // e.g. "17 Oct"
  count: number;
}

export interface DashboardOverview {
  totals: {
    quotes: number;
    newQuotes: number;
    messages: number;
    newMessages: number;
    subscribers: number;
    activeShipments: number;
  };
  quotesByStatus: Record<LeadStatus, number>;
  quotesPerDay: DailyCount[];
  recentQuotes: QuoteRequest[];
  recentMessages: ContactMessage[];
  pinnedNotes: AdminNote[];
}
