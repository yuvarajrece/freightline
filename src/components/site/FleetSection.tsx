import { CapacityBar } from "@/components/motion/CapacityBar";
import type { FleetVehicle } from "@/core/domain/models";
import { formatNumber } from "@/lib/utils";
import { Section, SectionHeading } from "./Section";

interface FleetSectionProps {
  fleet: FleetVehicle[];
  title: string;
  subtitle: string;
}

export function FleetSection({ fleet, title, subtitle }: FleetSectionProps) {
  if (fleet.length === 0) return null;
  const maxCapacity = Math.max(...fleet.map((vehicle) => vehicle.capacity_tons), 1);

  return (
    <Section id="fleet" tone="paper">
      <SectionHeading title={title} subtitle={subtitle} />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {fleet.map((vehicle) => (
          <article key={vehicle.id} className="flex flex-col rounded-2xl border border-ink-100 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink-500">{vehicle.category}</p>
                <h3 className="mt-1 text-xl font-semibold">{vehicle.name}</h3>
              </div>
              <p className="text-right font-display text-3xl font-semibold text-ink-900 tabular-nums">
                {formatNumber(vehicle.capacity_tons, vehicle.capacity_tons % 1 === 0 ? 0 : 1)}
                <span className="ml-1 text-base font-medium text-ink-500">t</span>
              </p>
            </div>

            <div className="mt-5">
              <CapacityBar
                ratio={vehicle.capacity_tons / maxCapacity}
                label={`${vehicle.capacity_tons} tonnes, ${Math.round((vehicle.capacity_tons / maxCapacity) * 100)}% of our largest vehicle`}
              />
            </div>

            {vehicle.description ? <p className="mt-5 text-ink-600">{vehicle.description}</p> : null}

            {vehicle.features.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {vehicle.features.map((feature) => (
                  <li key={feature} className="rounded-md bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700">
                    {feature}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </Section>
  );
}
