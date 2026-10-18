"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Honeypot } from "@/components/ui/form";
import { useFormSubmit } from "@/lib/api-client";

export function NewsletterForm() {
  const form = useFormSubmit("/api/subscribe");

  return (
    <form onSubmit={form.onSubmit} noValidate className="w-full max-w-md">
      <Honeypot />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          aria-invalid={form.errorFor("email") ? true : undefined}
          className="h-11 w-full rounded-lg border border-white/15 bg-white/5 px-3.5 text-white placeholder:text-ink-400 focus:border-signal-400 focus:outline-none focus:ring-2 focus:ring-signal-400/50"
        />
        <Button type="submit" variant="primary" disabled={form.pending} className="sm:min-w-32">
          {form.pending ? <Loader2 className="size-4 animate-spin" aria-label="Subscribing" /> : "Subscribe"}
        </Button>
      </div>
      <p aria-live="polite" className={form.success ? "mt-2 text-sm text-route-400" : "mt-2 text-sm text-red-300"}>
        {form.success ? "You are on the list. Thanks for subscribing." : (form.errorFor("email") ?? form.message)}
      </p>
    </form>
  );
}
