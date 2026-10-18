import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  reverse?: boolean;
  /** Seconds for one full loop. */
  duration?: number;
  className?: string;
}

/** Infinite, pause-on-hover marquee. Pure CSS, so it works in server components. */
export function Marquee({ children, reverse = false, duration = 45, className }: MarqueeProps) {
  const style = { "--duration": `${duration}s` } as CSSProperties;

  return (
    <div className={cn("marquee", reverse && "marquee--reverse", className)} style={style}>
      <div className="marquee__track">{children}</div>
      <div className="marquee__track" aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
