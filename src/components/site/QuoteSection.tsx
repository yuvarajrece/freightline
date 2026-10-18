import { Mail, Phone } from "lucide-react";
import type { Service, SettingsMap } from "@/core/domain/models";
import { setting } from "@/lib/settings";
import { QuoteForm } from "./QuoteForm";
import { Section, SectionHeading } from "./Section";

export function QuoteSection({ settings, services }: { settings: SettingsMap; services: Service[] }) {
  const phone = setting(settings, "brand", "phone");
  const email = setting(settings, "brand", "email");

  return (
    <Section id="quote" tone="dark" className="relative overflow-hidden">
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-[0.06]" />
      <div className="relative grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:pt-4">
          <SectionHeading
            dark
            title={setting(settings, "sections", "quote_title") || "Request a quote"}
            subtitle={setting(settings, "sections", "quote_subtitle")}
          />
          {phone || email ? (
            <ul className="mt-10 space-y-4">
              {phone ? (
                <li>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-3 text-lg font-medium text-white hover:text-signal-300">
                    <span className="grid size-10 place-items-center rounded-lg bg-white/10 text-signal-400">
                      <Phone className="size-5" aria-hidden="true" />
                    </span>
                    {phone}
                  </a>
                </li>
              ) : null}
              {email ? (
                <li>
                  <a href={`mailto:${email}`} className="flex items-center gap-3 text-lg font-medium text-white hover:text-signal-300">
                    <span className="grid size-10 place-items-center rounded-lg bg-white/10 text-signal-400">
                      <Mail className="size-5" aria-hidden="true" />
                    </span>
                    {email}
                  </a>
                </li>
              ) : null}
            </ul>
          ) : null}
        </div>
        <QuoteForm serviceOptions={services.map((service) => service.title)} />
      </div>
    </Section>
  );
}
