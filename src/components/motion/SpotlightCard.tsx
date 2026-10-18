"use client";

import { useRef, type HTMLAttributes, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

/** Card with a soft amber glow that follows the pointer. Updates CSS variables directly, no re-renders. */
export function SpotlightCard({ className, children, onPointerMove, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (element) {
      const rect = element.getBoundingClientRect();
      element.style.setProperty("--x", `${event.clientX - rect.left}px`);
      element.style.setProperty("--y", `${event.clientY - rect.top}px`);
    }
    onPointerMove?.(event);
  };

  return (
    <div ref={ref} onPointerMove={handleMove} className={cn("spotlight", className)} {...props}>
      {children}
    </div>
  );
}
