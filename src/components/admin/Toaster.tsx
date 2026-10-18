"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error";
interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside <ToastProvider>.");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((tone: ToastTone, message: string) => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current.slice(-3), { id, tone, message }]);
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), tone === "error" ? 6500 : 3500);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({ success: (message) => push("success", message), error: (message) => push("error", message) }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 bottom-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.22 }}
              role={item.tone === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 text-sm shadow-lg",
                item.tone === "error" ? "border-alert-500/40" : "border-route-500/40",
              )}
            >
              {item.tone === "error" ? (
                <XCircle className="mt-0.5 size-5 shrink-0 text-alert-500" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-route-600" aria-hidden="true" />
              )}
              <p className="text-ink-800">{item.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
