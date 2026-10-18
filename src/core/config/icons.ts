/** Icon names editors can pick from the admin dashboard. Mapped to components in DynamicIcon. */
export const ICON_NAMES = [
  "Truck",
  "Boxes",
  "Warehouse",
  "Snowflake",
  "Container",
  "Gauge",
  "FileCheck",
  "Package",
  "Route",
  "MapPin",
  "ShieldCheck",
  "Ship",
  "Plane",
  "Train",
  "Globe",
  "Clock",
  "Factory",
  "Fuel",
  "Headphones",
] as const;

export type IconName = (typeof ICON_NAMES)[number];
