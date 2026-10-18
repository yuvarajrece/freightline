"use client";

import { motion, useReducedMotion } from "motion/react";

interface CapacityBarProps {
  /** 0 to 1 */
  ratio: number;
  label: string;
}

/** Bar that fills when scrolled into view. */
export function CapacityBar({ ratio, label }: CapacityBarProps) {
  const reduceMotion = useReducedMotion();
  const clamped = Math.min(Math.max(ratio, 0.04), 1);

  return (
    <div
      role="img"
      aria-label={label}
      className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100"
    >
      <motion.div
        className="h-full rounded-full bg-signal-400"
        initial={reduceMotion ? false : { width: 0 }}
        whileInView={{ width: `${clamped * 100}%` }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        style={reduceMotion ? { width: `${clamped * 100}%` } : undefined}
      />
    </div>
  );
}
