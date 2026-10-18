"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ProcessStep } from "@/core/domain/models";

/** Vertical timeline whose amber spine fills as the reader scrolls through the steps. */
export function ProcessTimeline({ steps }: { steps: ProcessStep[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });

  return (
    <ol ref={ref} className="relative space-y-10 pl-16">
      <span aria-hidden="true" className="absolute top-2 bottom-2 left-[22px] w-px bg-ink-200" />
      <motion.span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[21px] w-[3px] origin-top rounded-full bg-signal-400"
        style={{ scaleY: reduceMotion ? 1 : progress }}
      />

      {steps.map((step, index) => (
        <li key={step.id} className="relative">
          <span className="absolute -left-16 top-0 grid size-11 place-items-center rounded-xl border border-ink-200 bg-white text-ink-900 shadow-sm">
            <DynamicIcon name={step.icon} className="size-5" />
          </span>
          <p className="text-sm font-semibold text-signal-600 tabular-nums">Step {index + 1}</p>
          <h3 className="mt-0.5 text-xl font-semibold">{step.title}</h3>
          <p className="mt-2 max-w-lg text-ink-600">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
