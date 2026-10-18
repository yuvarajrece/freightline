import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";
import type { SettingsMap } from "@/core/domain/models";
import { setting } from "@/lib/settings";
import { ContactForm } from "./ContactForm";
import { Section, SectionHeading } from "./Section";

function Detail({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink-900 text-signal-400">{icon}</span>
      <div>
        <p className="text-sm font-medium text-ink-500">{label}</p>
        <div className="mt-0.5 text-lg font-medium text-ink-900">{children}</div>
      </div>
    </div>
  );
}

export function ContactSection({ settings }: { settings: SettingsMap }) {
  const phone = setting(settings, "brand", "phone");
  const email = setting(settings, "brand", "email");
  const address = setting(settings, "brand", "address");
  const hours = setting(settings, "brand", "hours");

  return (
    <Section id="contact" tone="paper">
      <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div>
          <SectionHeading title={setting(settings, "sections", "contact_title") || "Contact us"} />
          <div className="mt-10 space-y-6">
            {address ? (
              <Detail icon={<MapPin className="size-5" aria-hidden="true" />} label="Head office">
                {address}
              </Detail>
            ) : null}
            {phone ? (
              <Detail icon={<Phone className="size-5" aria-hidden="true" />} label="Phone">
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-signal-700">
                  {phone}
                </a>
              </Detail>
            ) : null}
            {email ? (
              <Detail icon={<Mail className="size-5" aria-hidden="true" />} label="Email">
                <a href={`mailto:${email}`} className="hover:text-signal-700">
                  {email}
                </a>
              </Detail>
            ) : null}
            {hours ? (
              <Detail icon={<Clock className="size-5" aria-hidden="true" />} label="Working hours">
                {hours}
              </Detail>
            ) : null}
          </div>
        </div>
        <ContactForm />
      </div>
    </Section>
  );
}
