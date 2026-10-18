"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/form";
import { getBrowserSupabaseClient } from "@/infrastructure/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError(null);

    try {
      const { error: signInError } = await getBrowserSupabaseClient().auth.signInWithPassword({
        email: String(data.get("email") ?? "").trim(),
        password: String(data.get("password") ?? ""),
      });

      if (signInError) {
        setError("That email and password do not match. Check them and try again.");
        setPending(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <TextField label="Email" name="email" type="email" autoComplete="username" required tone="dark" />
      <TextField label="Password" name="password" type="password" autoComplete="current-password" required tone="dark" />
      <p aria-live="polite" role={error ? "alert" : undefined} className="min-h-5 text-sm text-red-300">
        {error}
      </p>
      <Button type="submit" variant="primary" size="lg" disabled={pending} className="w-full">
        {pending ? <Loader2 className="size-5 animate-spin" aria-label="Signing in" /> : "Sign in"}
      </Button>
    </form>
  );
}
