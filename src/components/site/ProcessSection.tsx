import type { ProcessStep } from "@/core/domain/models";
import { ProcessTimeline } from "./ProcessTimeline";
import { Section, SectionHeading } from "./Section";

interface ProcessSectionProps {
  steps: ProcessStep[];
  title: string;
  subtitle: string;
}

export function ProcessSection({ steps, title, subtitle }: ProcessSectionProps) {
  if (steps.length === 0) return null;

  return (
    <Section id="process" tone="white">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading title={title} subtitle={subtitle} />
        </div>
        <ProcessTimeline steps={steps} />
      </div>
    </Section>
  );
}
