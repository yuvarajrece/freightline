import type { Faq } from "@/core/domain/models";
import { FaqAccordion } from "./FaqAccordion";
import { Section, SectionHeading } from "./Section";

export function FaqSection({ faqs, title }: { faqs: Faq[]; title: string }) {
  if (faqs.length === 0) return null;

  return (
    <Section id="faq" tone="white">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <SectionHeading title={title} />
        <FaqAccordion faqs={faqs} />
      </div>
    </Section>
  );
}
