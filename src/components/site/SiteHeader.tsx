"use client";

import { AnimatePresence, motion } from "motion/react";
import { Menu, Phone, Truck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
}

interface SiteHeaderProps {
  brandName: string;
  phone: string;
  items: NavItem[];
  ctaLabel: string;
}

export function SiteHeader({ brandName, phone, items, ctaLabel }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || open ? "bg-ink-950/85 backdrop-blur-lg border-b border-white/10" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5">
        <a href="#top" className="flex items-center gap-2.5 text-white" aria-label={`${brandName} home`}>
          <span className="grid size-9 place-items-center rounded-lg bg-signal-400 text-ink-950">
            <Truck className="size-5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">{brandName}</span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {items.map((item) => (
            <a key={item.href} href={item.href} className="text-sm font-medium text-ink-200 transition-colors hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {phone ? (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-sm font-medium text-ink-100 hover:text-white">
              <Phone className="size-4" aria-hidden="true" />
              {phone}
            </a>
          ) : null}
          <a href="#quote" className={buttonStyles("primary", "sm")}>
            {ctaLabel}
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid size-10 place-items-center rounded-lg text-white hover:bg-white/10 lg:hidden"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col gap-1 px-5 py-4">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-lg font-medium text-ink-100 hover:bg-white/5"
                >
                  {item.label}
                </a>
              ))}
              <a href="#quote" onClick={() => setOpen(false)} className={buttonStyles("primary", "lg", "mt-3")}>
                {ctaLabel}
              </a>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
