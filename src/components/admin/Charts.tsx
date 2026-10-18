import type { DailyCount, LeadStatus } from "@/core/domain/models";
import { LEAD_STATUSES } from "@/core/domain/models";
import { humanize } from "@/core/config/resources";

/** Daily bar chart (server-rendered SVG, no chart library). Includes a text summary for screen readers. */
export function DailyBars({ data }: { data: DailyCount[] }) {
  const max = Math.max(...data.map((point) => point.count), 1);
  const total = data.reduce((sum, point) => sum + point.count, 0);
  const width = 640;
  const height = 180;
  const gap = 8;
  const barWidth = (width - gap * (data.length - 1)) / data.length;
  const plotHeight = height - 28;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Quote requests per day for the last ${data.length} days. ${total} in total.`}
      >
        {[0.5, 1].map((fraction) => (
          <line
            key={fraction}
            x1={0}
            x2={width}
            y1={plotHeight - plotHeight * fraction + 4}
            y2={plotHeight - plotHeight * fraction + 4}
            stroke="#e4ebf5"
            strokeDasharray="3 4"
          />
        ))}
        {data.map((point, index) => {
          const barHeight = point.count === 0 ? 3 : Math.max((point.count / max) * (plotHeight - 12), 6);
          const x = index * (barWidth + gap);
          const y = plotHeight - barHeight + 4;
          return (
            <g key={point.date}>
              <title>{`${point.label}: ${point.count}`}</title>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx={4} fill={point.count === 0 ? "#e4ebf5" : "#ffc21a"} />
              {point.count > 0 ? (
                <text x={x + barWidth / 2} y={y - 5} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1b3a63">
                  {point.count}
                </text>
              ) : null}
              {index % 2 === data.length % 2 || data.length < 8 ? (
                <text x={x + barWidth / 2} y={height - 4} textAnchor="middle" fontSize="10.5" fill="#6c88b0">
                  {point.label}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">
        {data.map((point) => `${point.label}: ${point.count}`).join(", ")}
      </figcaption>
    </figure>
  );
}

const STATUS_FILL: Record<LeadStatus, string> = {
  new: "#ffc21a",
  contacted: "#6c88b0",
  quoted: "#2f4b73",
  won: "#19b37d",
  lost: "#e5484d",
};

/** Pipeline breakdown as labelled horizontal bars (labels carry the meaning, not just colour). */
export function StatusBreakdown({ counts }: { counts: Record<LeadStatus, number> }) {
  const total = LEAD_STATUSES.reduce((sum, status) => sum + counts[status], 0);

  return (
    <ul className="space-y-3">
      {LEAD_STATUSES.map((status) => {
        const value = counts[status];
        const share = total === 0 ? 0 : (value / total) * 100;
        return (
          <li key={status}>
            <div className="mb-1 flex items-baseline justify-between text-sm">
              <span className="font-medium text-ink-800">{humanize(status)}</span>
              <span className="tabular-nums text-ink-600">
                {value}
                <span className="ml-1.5 text-ink-400">{Math.round(share)}%</span>
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink-100">
              <div className="h-full rounded-full" style={{ width: `${share}%`, backgroundColor: STATUS_FILL[status] }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
