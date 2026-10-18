"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Honeypot, SelectField, TextAreaField, TextField } from "@/components/ui/form";
import { useFormSubmit } from "@/lib/api-client";

interface QuoteFormProps {
  serviceOptions: string[];
}

export function QuoteForm({ serviceOptions }: QuoteFormProps) {
  const form = useFormSubmit("/api/quotes");

  return (
    <div className="relative rounded-2xl bg-white p-6 shadow-[0_30px_80px_-30px_rgba(7,22,43,0.6)] sm:p-8">
      <AnimatePresence mode="wait" initial={false}>
        {form.success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex min-h-[420px] flex-col items-start justify-center gap-4"
            role="status"
          >
            <span className="grid size-14 place-items-center rounded-full bg-route-500/15 text-route-600">
              <CheckCircle2 className="size-8" aria-hidden="true" />
            </span>
            <h3 className="text-2xl font-semibold">Quote request received</h3>
            <p className="max-w-md text-ink-600">
              A logistics manager will review your lane and contact you with a quote using the phone number and email you
              shared.
            </p>
            <Button variant="secondary" onClick={form.reset}>
              Send another request
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={form.onSubmit}
            noValidate
            initial={false}
            exit={{ opacity: 0 }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <Honeypot />
            <TextField label="Full name" name="full_name" autoComplete="name" required error={form.errorFor("full_name")} />
            <TextField label="Company" name="company" autoComplete="organization" error={form.errorFor("company")} />
            <TextField label="Email" name="email" type="email" autoComplete="email" required error={form.errorFor("email")} />
            <TextField label="Phone" name="phone" type="tel" autoComplete="tel" required error={form.errorFor("phone")} />

            <TextField label="Pickup city" name="origin" required error={form.errorFor("origin")} />
            <TextField label="Delivery city" name="destination" required error={form.errorFor("destination")} />

            {serviceOptions.length > 0 ? (
              <SelectField
                label="Service"
                name="service_label"
                placeholder="Select a service"
                options={serviceOptions.map((title) => ({ value: title, label: title }))}
                error={form.errorFor("service_label")}
              />
            ) : (
              <TextField label="Service needed" name="service_label" error={form.errorFor("service_label")} />
            )}
            <TextField label="Cargo type" name="cargo_type" placeholder="e.g. Machinery, textiles" error={form.errorFor("cargo_type")} />

            <TextField
              label="Approx. weight (kg)"
              name="weight_kg"
              type="number"
              inputMode="decimal"
              min={1}
              step="any"
              error={form.errorFor("weight_kg")}
            />
            <TextField label="Preferred pickup date" name="pickup_date" type="date" error={form.errorFor("pickup_date")} />

            <TextAreaField
              label="Anything else we should know?"
              name="message"
              wrapperClassName="sm:col-span-2"
              error={form.errorFor("message")}
            />

            <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p aria-live="polite" role={form.message ? "alert" : undefined} className="text-sm text-alert-500">
                {form.message}
              </p>
              <Button type="submit" size="lg" disabled={form.pending} className="sm:min-w-44">
                {form.pending ? <Loader2 className="size-5 animate-spin" aria-label="Sending" /> : "Request quote"}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
