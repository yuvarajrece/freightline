import { ConfigurationError } from "@/core/domain/errors";

export interface SupabasePublicEnv {
  url: string;
  anonKey: string;
}

/** Returns the Supabase credentials, or null when the project is not configured yet. */
export function getSupabaseEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function requireSupabaseEnv(): SupabasePublicEnv {
  const env = getSupabaseEnv();
  if (!env) {
    throw new ConfigurationError(
      "Supabase is not configured. Copy .env.example to .env.local and add your project URL and anon key.",
    );
  }
  return env;
}

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
