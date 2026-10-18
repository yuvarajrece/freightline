"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { Faq } from "@/core/domain/models";
import { cn } from "@/lib/utils";

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <ul className="divide-y divide-ink-100 border-y border-ink-100">
      {faqs.map((faq) => {
        const open = openId === faq.id;
        const panelId = `faq-panel-${faq.id}`;
        return (
          <li key={faq.id}>
            <h3>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : faq.id)}
                className="flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span className="font-display text-lg font-medium text-ink-900">{faq.question}</span>
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full border transition-colors",
                    open ? "border-signal-400 bg-signal-400 text-ink-950" : "border-ink-200 text-ink-600",
                  )}
                >
                  <Plus className={cn("size-4 transition-transform duration-300", open && "rotate-45")} aria-hidden="true" />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  id={panelId}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 text-ink-600">{faq.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
