import { Check } from "lucide-react";
import { SpotlightCard } from "@/components/motion/SpotlightCard";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { Service } from "@/core/domain/models";
import { Section, SectionHeading } from "./Section";

interface ServicesSectionProps {
  services: Service[];
  title: string;
  subtitle: string;
}

export function ServicesSection({ services, title, subtitle }: ServicesSectionProps) {
  if (services.length === 0) return null;

  return (
    <Section id="services" tone="paper">
      <SectionHeading title={title} subtitle={subtitle} />

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <SpotlightCard
            key={service.id}
            className="group flex flex-col rounded-2xl border border-ink-100 bg-white p-7 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-signal-300 hover:shadow-[0_24px_50px_-28px_rgba(11,31,58,0.45)]"
          >
            <span className="grid size-12 place-items-center rounded-xl bg-ink-900 text-signal-400 transition-colors group-hover:bg-signal-400 group-hover:text-ink-950">
              <DynamicIcon name={service.icon} className="size-6" />
            </span>
            <h3 className="mt-6 text-xl font-semibold">{service.title}</h3>
            <p className="mt-2 text-ink-600">{service.summary}</p>
            {service.features.length > 0 ? (
              <ul className="mt-5 space-y-2 border-t border-ink-100 pt-5 text-sm text-ink-700">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-route-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : null}
          </SpotlightCard>
        ))}
      </div>
    </Section>
  );
}
