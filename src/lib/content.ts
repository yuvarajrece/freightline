import { cache } from "react";
import type { HomeContent } from "@/core/domain/models";
import { getSupabaseEnv } from "@/lib/env";
import { getPublicContainer } from "@/services/container";

export type HomeContentResult =
  | { status: "ready"; content: HomeContent }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

/** Loads the home page content once per request (shared by metadata and the page). */
export const loadHomeContent = cache(async (): Promise<HomeContentResult> => {
  if (!getSupabaseEnv()) return { status: "unconfigured" };

  try {
    const content = await getPublicContainer().contentService.getHomeContent();
    return { status: "ready", content };
  } catch (error) {
    console.error("[home] failed to load content", error);
    return { status: "error", message: error instanceof Error ? error.message : "Unknown error" };
  }
});
