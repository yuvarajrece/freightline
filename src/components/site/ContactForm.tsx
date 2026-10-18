"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Honeypot, TextAreaField, TextField } from "@/components/ui/form";
import { useFormSubmit } from "@/lib/api-client";

export function ContactForm() {
  const form = useFormSubmit("/api/contact");

  if (form.success) {
    return (
      <div role="status" className="flex min-h-[320px] flex-col items-start justify-center gap-3 rounded-2xl border border-ink-100 bg-white p-8">
        <CheckCircle2 className="size-9 text-route-600" aria-hidden="true" />
        <h3 className="text-xl font-semibold">Message sent</h3>
        <p className="text-ink-600">Thanks for writing in. Our team will get back to you using the details you shared.</p>
        <Button variant="secondary" onClick={form.reset}>
          Write another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.onSubmit} noValidate className="grid gap-4 rounded-2xl border border-ink-100 bg-white p-6 sm:grid-cols-2 sm:p-8">
      <Honeypot />
      <TextField label="Full name" name="full_name" autoComplete="name" required error={form.errorFor("full_name")} />
      <TextField label="Email" name="email" type="email" autoComplete="email" required error={form.errorFor("email")} />
      <TextField label="Phone" name="phone" type="tel" autoComplete="tel" error={form.errorFor("phone")} />
      <TextField label="Subject" name="subject" error={form.errorFor("subject")} />
      <TextAreaField label="Message" name="message" required rows={5} wrapperClassName="sm:col-span-2" error={form.errorFor("message")} />
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p aria-live="polite" role={form.message ? "alert" : undefined} className="text-sm text-alert-500">
          {form.message}
        </p>
        <Button type="submit" variant="dark" size="lg" disabled={form.pending} className="sm:min-w-40">
          {form.pending ? <Loader2 className="size-5 animate-spin" aria-label="Sending" /> : "Send message"}
        </Button>
      </div>
    </form>
  );
}
