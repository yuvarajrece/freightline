import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/PageHeader";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { SETTINGS_SECTIONS } from "@/core/config/settings";
import { requireAdmin } from "@/services/admin-context";

export const metadata: Metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const { container } = await requireAdmin();
  const values = await container.settingsService.getAll();

  return (
    <>
      <PageHeader title="Site settings" description="Headlines, contact details and links used across the website." />
      <SettingsEditor sections={SETTINGS_SECTIONS} values={values} />
    </>
  );
}
