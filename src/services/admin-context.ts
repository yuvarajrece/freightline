import { cache } from "react";
import { redirect } from "next/navigation";
import { ForbiddenError, UnauthorizedError } from "@/core/domain/errors";
import { createServerSupabaseClient } from "@/infrastructure/supabase/clients";
import { getSupabaseEnv } from "@/lib/env";
import { AppContainer } from "./container";

export interface AdminContext {
  user: { id: string; email: string };
  container: AppContainer;
}

export type AdminState =
  | { status: "unconfigured" }
  | { status: "anonymous" }
  | { status: "forbidden"; email: string }
  | { status: "admin"; context: AdminContext };

/** Resolves who is calling and whether they are listed in admin_users. Cached per request. */
export const getAdminState = cache(async (): Promise<AdminState> => {
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return { status: "anonymous" };

  const { data: isAdmin } = await client.rpc("is_admin");
  if (isAdmin !== true) return { status: "forbidden", email: user.email ?? "" };

  return {
    status: "admin",
    context: { user: { id: user.id, email: user.email ?? "" }, container: new AppContainer(client) },
  };
});

/** For pages and layouts: redirects to the login screen unless an admin is signed in. */
export async function requireAdmin(): Promise<AdminContext> {
  const state = await getAdminState();
  if (state.status === "admin") return state.context;
  redirect(state.status === "forbidden" ? "/admin/login?error=forbidden" : "/admin/login");
}

/** For server actions and route handlers: throws typed errors instead of redirecting. */
export async function assertAdmin(): Promise<AdminContext> {
  const state = await getAdminState();
  if (state.status === "admin") return state.context;
  if (state.status === "forbidden") throw new ForbiddenError();
  throw new UnauthorizedError();
}
