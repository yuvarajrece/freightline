import { humanize } from "@/core/config/resources";
import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  new: "bg-signal-100 text-signal-700",
  contacted: "bg-ink-100 text-ink-700",
  quoted: "bg-ink-200 text-ink-800",
  won: "bg-route-500/15 text-route-600",
  lost: "bg-alert-500/10 text-alert-500",
  read: "bg-ink-100 text-ink-700",
  replied: "bg-route-500/15 text-route-600",
  archived: "bg-ink-100 text-ink-500",
  booked: "bg-ink-100 text-ink-700",
  picked_up: "bg-signal-100 text-signal-700",
  in_transit: "bg-signal-100 text-signal-700",
  out_for_delivery: "bg-signal-200 text-signal-700",
  delivered: "bg-route-500/15 text-route-600",
  delayed: "bg-alert-500/10 text-alert-500",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        TONES[status] ?? "bg-ink-100 text-ink-700",
        className,
      )}
    >
      {humanize(status)}
    </span>
  );
}
