import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { SetupNotice } from "@/components/site/SetupNotice";
import { Truck } from "lucide-react";
import { getAdminState } from "@/services/admin-context";
import { signOutAction } from "../actions";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const state = await getAdminState();

  if (state.status === "admin") redirect("/admin");

  if (state.status === "unconfigured") {
    return (
      <SetupNotice
        title="Connect Supabase to use the admin"
        steps={[
          "Copy .env.example to .env.local.",
          "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from your Supabase project.",
          "Restart the dev server and reload this page.",
        ]}
      />
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-ink-950 px-5 py-16 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-signal-400 text-ink-950">
            <Truck className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold">Control room</h1>
            <p className="text-sm text-ink-300">Sign in to manage leads, tracking and website content.</p>
          </div>
        </div>

        {state.status === "forbidden" ? (
          <div role="alert" className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-lg font-semibold">This account is not an admin</h2>
            <p className="mt-2 text-ink-200">
              {state.email} is signed in but has not been added to the admin list. Ask an existing admin to add it, or run
              the grant statement from the README in the Supabase SQL editor.
            </p>
            <form action={signOutAction} className="mt-5">
              <button type="submit" className="h-11 rounded-lg bg-white px-5 text-sm font-semibold text-ink-950 hover:bg-ink-100">
                Sign out and use another account
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <LoginForm />
          </div>
        )}
      </div>
    </main>
  );
}
