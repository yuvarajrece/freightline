import { DailyBars, StatusBreakdown } from "@/components/admin/Charts";
import type { DailyCount, LeadStatus } from "@/core/domain/models";

export function Charts({ perDay, byStatus }: { perDay: DailyCount[]; byStatus: Record<LeadStatus, number> }) {
  const total = perDay.reduce((sum, point) => sum + point.count, 0);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <section aria-labelledby="per-day" className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 id="per-day" className="text-xl font-semibold">
          Quote requests, last {perDay.length} days
        </h2>
        <p className="mt-1 mb-4 text-sm text-ink-600">{total} received in this period.</p>
        <DailyBars data={perDay} />
      </section>

      <section aria-labelledby="pipeline" className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 id="pipeline" className="mb-5 text-xl font-semibold">
          Pipeline
        </h2>
        <StatusBreakdown counts={byStatus} />
      </section>
    </div>
  );
}
