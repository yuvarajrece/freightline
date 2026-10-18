import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "dark" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-signal-400 text-ink-950 hover:bg-signal-300 active:bg-signal-500 shadow-[0_1px_0_rgba(255,255,255,0.5)_inset]",
  secondary: "border border-ink-200 bg-white text-ink-900 hover:border-ink-400 hover:bg-ink-50",
  dark: "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950",
  ghost: "text-ink-700 hover:bg-ink-100",
  danger: "bg-alert-500 text-white hover:bg-alert-500/90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
};

/** Class names shared by <Button> and anchor-styled buttons. */
export function buttonStyles(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap",
    "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-55",
    variants[variant],
    sizes[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles(variant, size, className)} {...props} />;
}
