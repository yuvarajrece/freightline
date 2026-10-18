import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SectionTone = "paper" | "white" | "dark" | "darker";

const TONES: Record<SectionTone, string> = {
  paper: "bg-paper text-ink-900",
  white: "bg-white text-ink-900",
  dark: "bg-ink-900 text-white",
  darker: "bg-ink-950 text-white",
};

interface SectionProps {
  id?: string;
  tone?: SectionTone;
  className?: string;
  children: ReactNode;
}

export function Section({ id, tone = "paper", className, children }: SectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-16 py-20 sm:py-28", TONES[tone], className)}>
      <div className="mx-auto max-w-7xl px-5">{children}</div>
    </section>
  );
}

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  dark?: boolean;
  className?: string;
}

export function SectionHeading({ title, subtitle, dark = false, className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <h2 className="text-3xl font-semibold sm:text-5xl">{title}</h2>
      {subtitle ? (
        <p className={cn("mt-4 text-lg", dark ? "text-ink-200" : "text-ink-600")}>{subtitle}</p>
      ) : null}
    </div>
  );
}
