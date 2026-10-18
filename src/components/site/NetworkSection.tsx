import type { Lane, Location } from "@/core/domain/models";
import { LaneBoard } from "./LaneBoard";
import { Section, SectionHeading } from "./Section";

interface NetworkSectionProps {
  lanes: Lane[];
  locations: Location[];
  title: string;
  subtitle: string;
}

export function NetworkSection({ lanes, locations, title, subtitle }: NetworkSectionProps) {
  if (lanes.length === 0) return null;
  const hubs = locations.filter((location) => location.is_hub);

  return (
    <Section id="network" tone="white">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div>
          <SectionHeading title={title} subtitle={subtitle} />
          {hubs.length > 0 ? (
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Operating hubs">
              {hubs.map((hub) => (
                <li
                  key={hub.id}
                  className="flex items-center gap-2 rounded-full border border-ink-200 bg-paper px-3.5 py-1.5 text-sm font-medium text-ink-800"
                >
                  <span className="size-2 rounded-full bg-signal-400" aria-hidden="true" />
                  {hub.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <LaneBoard lanes={lanes} />
      </div>
    </Section>
  );
}
