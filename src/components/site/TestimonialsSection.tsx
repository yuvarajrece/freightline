import { Star } from "lucide-react";
import { Marquee } from "@/components/motion/Marquee";
import type { Testimonial } from "@/core/domain/models";
import { Section, SectionHeading } from "./Section";

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const credit = [testimonial.author_role, testimonial.company].filter(Boolean).join(", ");

  return (
    <figure className="flex w-[340px] shrink-0 flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.05] p-6 sm:w-[400px]">
      <div>
        <div className="flex gap-0.5" role="img" aria-label={`${testimonial.rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, index) => (
            <Star
              key={index}
              className={index < testimonial.rating ? "size-4 fill-signal-400 text-signal-400" : "size-4 text-ink-600"}
              aria-hidden="true"
            />
          ))}
        </div>
        <blockquote className="mt-4 text-lg leading-snug text-ink-50">{testimonial.quote}</blockquote>
      </div>
      <figcaption className="mt-6 text-sm">
        <span className="font-semibold text-white">{testimonial.author_name}</span>
        {credit ? <span className="block text-ink-300">{credit}</span> : null}
      </figcaption>
    </figure>
  );
}

export function TestimonialsSection({ testimonials, title }: { testimonials: Testimonial[]; title: string }) {
  if (testimonials.length === 0) return null;

  const split = Math.ceil(testimonials.length / 2);
  const rows =
    testimonials.length > 3
      ? [testimonials.slice(0, split), testimonials.slice(split)]
      : [testimonials];

  return (
    <Section id="testimonials" tone="darker" className="overflow-hidden">
      <SectionHeading title={title} dark />
      <div className="-mx-5 mt-14 space-y-5">
        {rows.map((row, index) => (
          <Marquee key={index} reverse={index % 2 === 1} duration={Math.max(row.length * 16, 40)} className="[--gap:1.25rem]">
            {row.map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </Marquee>
        ))}
      </div>
    </Section>
  );
}
