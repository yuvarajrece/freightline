import { SHIPMENT_STATUSES } from "../domain/models";
import { ICON_NAMES } from "./icons";

/**
 * Declarative description of every admin-managed content type.
 * The admin UI, server actions and validation are all generated from this registry,
 * so adding a new content type means adding one entry here (Open/Closed principle).
 */

export type ResourceKey =
  | "services"
  | "fleet"
  | "locations"
  | "routes"
  | "stats"
  | "steps"
  | "testimonials"
  | "faqs"
  | "clients"
  | "shipments";

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "number"
  | "boolean"
  | "select"
  | "tags"
  | "datetime"
  | "relation";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: SelectOption[];
  relation?: ResourceKey;
  min?: number;
  max?: number;
  step?: number;
  maxLength?: number;
  /** Regular expression source the value must match (text fields). */
  pattern?: string;
  patternMessage?: string;
  /** Normalisation applied before validation. */
  transform?: "uppercase";
  /** When empty the field is omitted so the database default applies (e.g. generated codes). */
  generated?: boolean;
  defaultValue?: string | number | boolean | string[];
}

export type ColumnFormat = "text" | "boolean" | "tags" | "datetime" | "badge" | "relation" | "number";

export interface ColumnConfig {
  field: string;
  label: string;
  format?: ColumnFormat;
  relation?: ResourceKey;
}

export interface ResourceConfig {
  key: ResourceKey;
  table: string;
  label: string;
  singular: string;
  description: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  orderBy: { column: string; ascending: boolean };
  /** Public paths to revalidate after a change. */
  revalidate: string[];
}

export const humanize = (value: string): string =>
  value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

const iconOptions: SelectOption[] = ICON_NAMES.map((name) => ({ value: name, label: name }));

const sortOrder: FieldConfig = {
  name: "sort_order",
  label: "Display order",
  type: "number",
  min: 0,
  step: 1,
  required: true,
  defaultValue: 0,
  help: "Lower numbers appear first.",
};

const published: FieldConfig = {
  name: "is_published",
  label: "Published",
  type: "boolean",
  defaultValue: true,
  help: "Unpublished items are hidden from the website.",
};

export const SHIPMENT_STATUS_OPTIONS: SelectOption[] = SHIPMENT_STATUSES.map((value) => ({
  value,
  label: humanize(value),
}));

export const RESOURCES: Record<ResourceKey, ResourceConfig> = {
  services: {
    key: "services",
    table: "services",
    label: "Services",
    singular: "service",
    description: "Freight services shown in the services section.",
    columns: [
      { field: "title", label: "Title" },
      { field: "icon", label: "Icon" },
      { field: "sort_order", label: "Order", format: "number" },
      { field: "is_published", label: "Live", format: "boolean" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 80 },
      { name: "slug", label: "Slug", type: "text", required: true, maxLength: 80, help: "URL-safe identifier, e.g. full-truckload." },
      { name: "summary", label: "Summary", type: "textarea", required: true, maxLength: 300 },
      { name: "icon", label: "Icon", type: "select", required: true, options: iconOptions, defaultValue: "Truck" },
      { name: "features", label: "Key features", type: "tags", help: "Press Enter after each feature." },
      sortOrder,
      published,
    ],
    orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/"],
  },
  fleet: {
    key: "fleet",
    table: "fleet_vehicles",
    label: "Fleet",
    singular: "vehicle",
    description: "Vehicle types and their load capacity.",
    columns: [
      { field: "name", label: "Vehicle" },
      { field: "category", label: "Category" },
      { field: "capacity_tons", label: "Capacity (t)", format: "number" },
      { field: "is_published", label: "Live", format: "boolean" },
    ],
    fields: [
      { name: "name", label: "Vehicle name", type: "text", required: true, maxLength: 80 },
      { name: "category", label: "Category", type: "text", required: true, maxLength: 60 },
      { name: "capacity_tons", label: "Capacity (tonnes)", type: "number", required: true, min: 0, step: 0.5 },
      { name: "description", label: "Description", type: "textarea", maxLength: 300 },
      { name: "features", label: "Highlights", type: "tags" },
      sortOrder,
      published,
    ],
    orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/"],
  },
  locations: {
    key: "locations",
    table: "locations",
    label: "Locations",
    singular: "location",
    description: "Cities on the network map. Hubs are highlighted.",
    columns: [
      { field: "name", label: "City" },
      { field: "state", label: "State" },
      { field: "is_hub", label: "Hub", format: "boolean" },
      { field: "is_published", label: "Live", format: "boolean" },
    ],
    fields: [
      { name: "name", label: "City", type: "text", required: true, maxLength: 80 },
      { name: "state", label: "State", type: "text", maxLength: 80 },
      { name: "latitude", label: "Latitude", type: "number", required: true, min: -90, max: 90, step: 0.0001 },
      { name: "longitude", label: "Longitude", type: "number", required: true, min: -180, max: 180, step: 0.0001 },
      { name: "is_hub", label: "Operating hub", type: "boolean", defaultValue: false },
      sortOrder,
      published,
    ],
    orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/"],
  },
  routes: {
    key: "routes",
    table: "routes",
    label: "Lanes",
    singular: "lane",
    description: "Scheduled lanes shown on the map and lane board.",
    columns: [
      { field: "from_location_id", label: "From", format: "relation", relation: "locations" },
      { field: "to_location_id", label: "To", format: "relation", relation: "locations" },
      { field: "transit_hours", label: "Transit (h)", format: "number" },
      { field: "label", label: "Schedule" },
      { field: "is_published", label: "Live", format: "boolean" },
    ],
    fields: [
      { name: "from_location_id", label: "From", type: "relation", relation: "locations", required: true },
      { name: "to_location_id", label: "To", type: "relation", relation: "locations", required: true },
      { name: "transit_hours", label: "Transit time (hours)", type: "number", required: true, min: 1, step: 1, defaultValue: 12 },
      { name: "label", label: "Schedule label", type: "text", required: true, maxLength: 60, defaultValue: "Daily departure" },
      sortOrder,
      published,
    ],
    orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/"],
  },
  stats: {
    key: "stats",
    table: "stats",
    label: "Key numbers",
    singular: "number",
    description: "Animated counters in the numbers section.",
    columns: [
      { field: "label", label: "Label" },
      { field: "value", label: "Value", format: "number" },
      { field: "suffix", label: "Suffix" },
      { field: "is_published", label: "Live", format: "boolean" },
    ],
    fields: [
      { name: "label", label: "Label", type: "text", required: true, maxLength: 80 },
      { name: "value", label: "Value", type: "number", required: true, min: 0, step: 0.1 },
      { name: "prefix", label: "Prefix", type: "text", maxLength: 6, placeholder: "e.g. Rs." },
      { name: "suffix", label: "Suffix", type: "text", maxLength: 6, placeholder: "e.g. %, +" },
      sortOrder,
      published,
    ],
    orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/"],
  },
  steps: {
    key: "steps",
    table: "process_steps",
    label: "Process steps",
    singular: "step",
    description: "The booking-to-delivery timeline.",
    columns: [
      { field: "title", label: "Step" },
      { field: "icon", label: "Icon" },
      { field: "sort_order", label: "Order", format: "number" },
      { field: "is_published", label: "Live", format: "boolean" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, maxLength: 80 },
      { name: "description", label: "Description", type: "textarea", required: true, maxLength: 300 },
      { name: "icon", label: "Icon", type: "select", required: true, options: iconOptions, defaultValue: "Package" },
      sortOrder,
      published,
    ],
    orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/"],
  },
  testimonials: {
    key: "testimonials",
    table: "testimonials",
    label: "Testimonials",
    singular: "testimonial",
    description: "Customer quotes shown in the scrolling wall.",
    columns: [
      { field: "author_name", label: "Author" },
      { field: "company", label: "Company" },
      { field: "rating", label: "Rating", format: "number" },
      { field: "is_published", label: "Live", format: "boolean" },
    ],
    fields: [
      { name: "author_name", label: "Author", type: "text", required: true, maxLength: 80 },
      { name: "author_role", label: "Role", type: "text", maxLength: 80 },
      { name: "company", label: "Company", type: "text", maxLength: 80 },
      { name: "quote", label: "Quote", type: "textarea", required: true, maxLength: 500 },
      { name: "rating", label: "Rating (1 to 5)", type: "number", required: true, min: 1, max: 5, step: 1, defaultValue: 5 },
      sortOrder,
      published,
    ],
    orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/"],
  },
  faqs: {
    key: "faqs",
    table: "faqs",
    label: "FAQs",
    singular: "question",
    description: "Frequently asked questions.",
    columns: [
      { field: "question", label: "Question" },
      { field: "sort_order", label: "Order", format: "number" },
      { field: "is_published", label: "Live", format: "boolean" },
    ],
    fields: [
      { name: "question", label: "Question", type: "text", required: true, maxLength: 200 },
      { name: "answer", label: "Answer", type: "textarea", required: true, maxLength: 800 },
      sortOrder,
      published,
    ],
    orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/"],
  },
  clients: {
    key: "clients",
    table: "clients",
    label: "Client names",
    singular: "client",
    description: "Names in the scrolling client strip.",
    columns: [
      { field: "name", label: "Name" },
      { field: "sort_order", label: "Order", format: "number" },
      { field: "is_published", label: "Live", format: "boolean" },
    ],
    fields: [
      { name: "name", label: "Client name", type: "text", required: true, maxLength: 80 },
      sortOrder,
      published,
    ],
    orderBy: { column: "sort_order", ascending: true },
    revalidate: ["/"],
  },
  shipments: {
    key: "shipments",
    table: "shipments",
    label: "Shipments",
    singular: "shipment",
    description: "Consignments customers can track by code.",
    columns: [
      { field: "tracking_code", label: "Code" },
      { field: "origin", label: "Origin" },
      { field: "destination", label: "Destination" },
      { field: "status", label: "Status", format: "badge" },
      { field: "eta", label: "ETA", format: "datetime" },
    ],
    fields: [
      { name: "tracking_code", label: "Tracking code", type: "text", maxLength: 24, generated: true, transform: "uppercase", pattern: "^[A-Z0-9-]{4,24}$", patternMessage: "Use 4 to 24 letters, numbers or dashes.", help: "Leave empty to generate one automatically." },
      { name: "origin", label: "Origin", type: "text", required: true, maxLength: 120 },
      { name: "destination", label: "Destination", type: "text", required: true, maxLength: 120 },
      { name: "customer_name", label: "Customer (internal)", type: "text", maxLength: 120, help: "Never shown on the public tracking page." },
      { name: "status", label: "Status", type: "select", required: true, options: SHIPMENT_STATUS_OPTIONS, defaultValue: "booked" },
      { name: "eta", label: "Estimated arrival", type: "datetime" },
    ],
    orderBy: { column: "created_at", ascending: false },
    revalidate: [],
  },
};

export const CONTENT_RESOURCE_KEYS: ResourceKey[] = [
  "services",
  "fleet",
  "locations",
  "routes",
  "stats",
  "steps",
  "testimonials",
  "faqs",
  "clients",
];

export function isResourceKey(value: string): value is ResourceKey {
  return Object.prototype.hasOwnProperty.call(RESOURCES, value);
}
