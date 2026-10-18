"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface LineRevealProps {
  lines: string[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p";
}

/**
 * Line-by-line masked slide-up. Each line is clipped by its own wrapper so it appears
 * to rise out of the page. Used for the hero headline: the single orchestrated entrance.
 */
export function LineReveal({ lines, className, lineClassName, delay = 0.1, stagger = 0.12, as = "h1" }: LineRevealProps) {
  const reduceMotion = useReducedMotion();
  const Tag = as;

  return (
    <Tag className={className} aria-label={lines.join(" ")}>
      {lines.map((line, index) => (
        <span key={`${line}-${index}`} aria-hidden="true" className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <motion.span
            className={cn("block", lineClassName)}
            initial={reduceMotion ? false : { y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: delay + index * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
