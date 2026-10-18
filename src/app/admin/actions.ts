"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { RESOURCES, isResourceKey } from "@/core/config/resources";
import { SETTINGS_SECTIONS } from "@/core/config/settings";
import { AppError, RepositoryError, ValidationError } from "@/core/domain/errors";
import { buildSettingsSchema } from "@/core/validation/dynamic";
import { parseOrThrow } from "@/core/validation/schemas";
import { createServerSupabaseClient } from "@/infrastructure/supabase/clients";
import { assertAdmin } from "@/services/admin-context";

export interface ActionResult {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

/** Runs an admin operation and converts any failure into a safe, user-readable result. */
async function run(work: () => Promise<void>, success?: string): Promise<ActionResult> {
  try {
    await work();
    return { ok: true, message: success };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { ok: false, message: error.message, fieldErrors: error.details as Record<string, string[]> | undefined };
    }
    if (error instanceof RepositoryError) {
      const code = (error.details as { code?: string } | undefined)?.code;
      if (code === "23505") return { ok: false, message: "Another item already uses that value. Choose a different one." };
      if (code === "23503") return { ok: false, message: "This item is still used elsewhere. Remove those references first." };
    }
    if (error instanceof AppError && error.status < 500) return { ok: false, message: error.message };
    console.error("[admin action]", error);
    return { ok: false, message: "That did not save. Please try again." };
  }
}

/* ------------------------------ Session ------------------------------ */

export async function signOutAction(): Promise<void> {
  const client = await createServerSupabaseClient();
  await client.auth.signOut();
  redirect("/admin/login");
}

/* ------------------------- Website content CRUD ------------------------- */

export async function saveResourceAction(
  resource: string,
  id: string | null,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  return run(async () => {
    const { container } = await assertAdmin();
    if (!isResourceKey(resource)) throw new ValidationError("Unknown content type.");
    await container.resourceService.save(resource, id, values);
    for (const path of RESOURCES[resource].revalidate) revalidatePath(path);
    revalidatePath(`/admin/content/${resource}`);
    revalidatePath("/admin/shipments");
  }, id ? "Changes saved." : "Added.");
}

export async function deleteResourceAction(resource: string, id: string): Promise<ActionResult> {
  return run(async () => {
    const { container } = await assertAdmin();
    if (!isResourceKey(resource)) throw new ValidationError("Unknown content type.");
    await container.resourceService.remove(resource, id);
    for (const path of RESOURCES[resource].revalidate) revalidatePath(path);
    revalidatePath(`/admin/content/${resource}`);
    revalidatePath("/admin/shipments");
  }, "Deleted.");
}

/* ------------------------------ Settings ------------------------------ */

export async function saveSettingsAction(sectionKey: string, values: Record<string, string>): Promise<ActionResult> {
  return run(async () => {
    const { container } = await assertAdmin();
    const section = SETTINGS_SECTIONS.find((item) => item.key === sectionKey);
    if (!section) throw new ValidationError("Unknown settings group.");
    const parsed = parseOrThrow(buildSettingsSchema(section.fields), values) as Record<string, string>;
    await container.settingsService.save(section.key, parsed);
    revalidatePath("/");
    revalidatePath("/admin/settings");
  }, "Settings saved. The website updates within seconds.");
}

/* ----------------------------- Quote requests ----------------------------- */

export async function setQuoteStatusAction(id: string, status: string): Promise<ActionResult> {
  return run(async () => {
    const { container } = await assertAdmin();
    await container.inboxService.setQuoteStatus(id, status);
    revalidatePath("/admin", "layout");
  }, "Status updated.");
}

export async function deleteQuoteAction(id: string): Promise<ActionResult> {
  return run(async () => {
    const { container } = await assertAdmin();
    await container.inboxService.removeQuote(id);
    revalidatePath("/admin", "layout");
  }, "Quote request deleted.");
}

/* ------------------------------- Messages ------------------------------- */

export async function setMessageStatusAction(id: string, status: string): Promise<ActionResult> {
  return run(async () => {
    const { container } = await assertAdmin();
    await container.inboxService.setMessageStatus(id, status);
    revalidatePath("/admin", "layout");
  }, "Status updated.");
}

export async function deleteMessageAction(id: string): Promise<ActionResult> {
  return run(async () => {
    const { container } = await assertAdmin();
    await container.inboxService.removeMessage(id);
    revalidatePath("/admin", "layout");
  }, "Message deleted.");
}

/* ------------------------------ Subscribers ------------------------------ */

export async function deleteSubscriberAction(id: string): Promise<ActionResult> {
  return run(async () => {
    const { container } = await assertAdmin();
    await container.inboxService.removeSubscriber(id);
    revalidatePath("/admin/subscribers");
  }, "Subscriber removed.");
}

/* ----------------------------- Shipment events ----------------------------- */

export async function addShipmentEventAction(values: Record<string, unknown>): Promise<ActionResult> {
  return run(async () => {
    const { container } = await assertAdmin();
    await container.inboxService.addShipmentEvent(values);
    revalidatePath("/admin/shipments", "layout");
  }, "Tracking update added.");
}

export async function deleteShipmentEventAction(id: string): Promise<ActionResult> {
  return run(async () => {
    const { container } = await assertAdmin();
    await container.inboxService.removeShipmentEvent(id);
    revalidatePath("/admin/shipments", "layout");
  }, "Tracking update removed.");
}

/* --------------------------------- Notes --------------------------------- */

export async function saveNoteAction(
  id: string | null,
  values: Record<string, unknown>,
): Promise<ActionResult> {
  return run(async () => {
    const { container, user } = await assertAdmin();
    if (id) await container.noteService.update(id, values);
    else await container.noteService.create(values, user.email);
    revalidatePath("/admin", "layout");
  }, id ? "Note updated." : "Note added.");
}

export async function toggleNotePinAction(id: string, pinned: boolean): Promise<ActionResult> {
  return run(async () => {
    const { container } = await assertAdmin();
    await container.noteService.setPinned(id, pinned);
    revalidatePath("/admin", "layout");
  });
}

export async function deleteNoteAction(id: string): Promise<ActionResult> {
  return run(async () => {
    const { container } = await assertAdmin();
    await container.noteService.remove(id);
    revalidatePath("/admin", "layout");
  }, "Note deleted.");
}
