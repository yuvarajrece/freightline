import { Counter } from "@/components/motion/Counter";
import type { Stat } from "@/core/domain/models";
import { decimalsOf } from "@/lib/utils";
import { Section, SectionHeading } from "./Section";

export function StatsSection({ stats, title }: { stats: Stat[]; title: string }) {
  if (stats.length === 0) return null;

  return (
    <Section tone="dark" className="relative overflow-hidden">
      <div aria-hidden="true" className="dot-grid absolute inset-0 opacity-[0.06]" />
      <div className="relative">
        {title ? <SectionHeading title={title} dark className="max-w-xl" /> : null}
        <dl className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col-reverse gap-2 border-t-2 border-signal-400 pt-5">
              <dt className="text-ink-200">{stat.label}</dt>
              <dd className="font-display text-5xl font-semibold text-white sm:text-6xl">
                <Counter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} decimals={decimalsOf(stat.value)} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
