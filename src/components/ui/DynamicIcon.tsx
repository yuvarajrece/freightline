import {
  Boxes,
  Clock,
  Container,
  Factory,
  FileCheck,
  Fuel,
  Gauge,
  Globe,
  Headphones,
  MapPin,
  Package,
  Plane,
  Route,
  ShieldCheck,
  Ship,
  Snowflake,
  Train,
  Truck,
  Warehouse,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/core/config/icons";

/** Record<IconName, ...> makes the compiler fail if an icon offered in the admin has no component. */
const ICONS: Record<IconName, LucideIcon> = {
  Truck,
  Boxes,
  Warehouse,
  Snowflake,
  Container,
  Gauge,
  FileCheck,
  Package,
  Route,
  MapPin,
  ShieldCheck,
  Ship,
  Plane,
  Train,
  Globe,
  Clock,
  Factory,
  Fuel,
  Headphones,
};

interface DynamicIconProps extends LucideProps {
  name: string;
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const Icon = ICONS[name as IconName] ?? Package;
  return <Icon aria-hidden="true" {...props} />;
}
