"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Loader2, PackageSearch } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import type { ShipmentStatus, TrackingResult } from "@/core/domain/models";
import { humanize } from "@/core/config/resources";
import { cn, formatDateTime } from "@/lib/utils";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; result: TrackingResult };

interface TrackingPanelProps {
  label: string;
  placeholder: string;
}

const STATUS_TONE: Record<ShipmentStatus, string> = {
  booked: "bg-ink-500/30 text-ink-100",
  picked_up: "bg-signal-400/20 text-signal-200",
  in_transit: "bg-signal-400/20 text-signal-200",
  out_for_delivery: "bg-signal-400/25 text-signal-100",
  delivered: "bg-route-500/25 text-route-400",
  delayed: "bg-alert-500/25 text-red-300",
};

interface TrackResponse {
  ok?: boolean;
  result?: TrackingResult;
  error?: { message?: string; fields?: Record<string, string[]> };
}

export function TrackingPanel({ label, placeholder }: TrackingPanelProps) {
  const [state, setState] = useState<State>({ status: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = String(new FormData(event.currentTarget).get("code") ?? "").trim();
    setState({ status: "loading" });

    try {
      const response = await fetch(`/api/track?code=${encodeURIComponent(code)}`);
      const body = (await response.json().catch(() => null)) as TrackResponse | null;

      if (response.ok && body?.ok && body.result) {
        setState({ status: "done", result: body.result });
      } else {
        setState({
          status: "error",
          message: body?.error?.fields?.code?.[0] ?? body?.error?.message ?? "We could not look that up. Try again.",
        });
      }
    } catch {
      setState({ status: "error", message: "We could not reach the server. Check your connection and try again." });
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm sm:p-5">
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label htmlFor="tracking-code" className="flex items-center gap-2 text-sm font-medium text-ink-100">
          <PackageSearch className="size-4 text-signal-400" aria-hidden="true" />
          {label}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="tracking-code"
            name="code"
            required
            minLength={4}
            maxLength={24}
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            className="h-11 w-full rounded-lg border border-white/15 bg-ink-950/60 px-3.5 font-medium tracking-wide text-white uppercase placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-400 focus:border-signal-400 focus:outline-none focus:ring-2 focus:ring-signal-400/50"
          />
          <Button type="submit" variant="primary" disabled={state.status === "loading"} className="sm:min-w-32">
            {state.status === "loading" ? (
              <Loader2 className="size-4 animate-spin" aria-label="Searching" />
            ) : (
              <>
                Track <ArrowRight className="size-4" aria-hidden="true" />
              </>
            )}
          </Button>
        </div>
      </form>

      <div aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {state.status === "error" ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-sm text-red-300"
            >
              {state.message}
            </motion.p>
          ) : null}

          {state.status === "done" ? (
            <motion.div
              key={state.result.tracking_code}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <TrackingResultView result={state.result} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TrackingResultView({ result }: { result: TrackingResult }) {
  return (
    <div className="mt-4 border-t border-white/10 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-lg font-semibold text-white">
          {result.origin} <span className="text-signal-400">to</span> {result.destination}
        </p>
        <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", STATUS_TONE[result.status])}>
          {humanize(result.status)}
        </span>
      </div>
      <p className="mt-1 text-sm text-ink-300">
        Code {result.tracking_code}
        {result.eta ? ` · ETA ${formatDateTime(result.eta)}` : ""}
      </p>

      {result.events.length > 0 ? (
        <ol className="mt-4 space-y-3 border-l border-white/15 pl-4">
          {result.events.map((event, index) => (
            <li key={`${event.occurred_at}-${index}`} className="relative">
              <span
                className={cn(
                  "absolute -left-[21px] top-1.5 size-2.5 rounded-full border-2 border-ink-950",
                  index === 0 ? "bg-signal-400" : "bg-ink-400",
                )}
              />
              <p className="text-sm font-medium text-white">
                {event.description || humanize(event.status)} <span className="text-ink-300">at {event.location}</span>
              </p>
              <p className="text-xs text-ink-400">{formatDateTime(event.occurred_at)}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-ink-300">No scan events yet. Check back after pickup.</p>
      )}
    </div>
  );
}
