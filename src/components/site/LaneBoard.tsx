"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Clock } from "lucide-react";
import type { Lane } from "@/core/domain/models";

/** Departure-board style list of scheduled lanes. Rows slide in one after another when scrolled into view. */
export function LaneBoard({ lanes }: { lanes: Lane[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-800 bg-ink-950 text-white shadow-[0_30px_70px_-30px_rgba(7,22,43,0.7)]">
      <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/10 bg-ink-900 px-5 py-3 text-xs font-medium text-ink-300 sm:grid-cols-[1.6fr_1fr_auto]">
        <span>Lane</span>
        <span className="hidden sm:block">Departs</span>
        <span className="text-right">Transit</span>
      </div>
      <ul>
        {lanes.map((lane, index) => (
          <motion.li
            key={lane.id}
            initial={reduceMotion ? false : { opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-white/5 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-white/[0.04] sm:grid-cols-[1.6fr_1fr_auto]"
          >
            <span className="flex flex-wrap items-center gap-x-2.5 font-display text-lg font-medium">
              {lane.from.name}
              <ArrowRight className="size-4 text-signal-400" aria-label="to" />
              {lane.to.name}
            </span>
            <span className="hidden text-sm text-ink-300 sm:block">{lane.label}</span>
            <span className="flex items-center justify-end gap-1.5 text-sm font-semibold text-signal-300 tabular-nums">
              <Clock className="size-3.5" aria-hidden="true" />
              {lane.transitHours} h
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
