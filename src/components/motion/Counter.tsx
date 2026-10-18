"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { formatNumber } from "@/lib/utils";

interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}

/** Counts up from zero the first time it scrolls into view. */
export function Counter({ value, prefix = "", suffix = "", decimals = 0, duration = 1.8 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(latest),
    });
    return () => controls.stop();
  }, [inView, value, duration, reduceMotion]);

  const finalText = `${prefix}${formatNumber(value, decimals)}${suffix}`;

  return (
    <span ref={ref} aria-label={finalText} className="tabular-nums">
      <span aria-hidden="true">
        {prefix}
        {formatNumber(display, decimals)}
        {suffix}
      </span>
    </span>
  );
}
